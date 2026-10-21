// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { handleMcpRequest } from "./mcp.server";

const endpoint = "https://shop.example/api/mcp";

async function connect(submit = vi.fn(async (_request: Request) => Response.json({ orderId: "TEST-1", total: 750, duplicate: false }))) {
  const client = new Client({ name: "shop-test", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    fetch: async (input, init) => handleMcpRequest(new Request(input, init), submit),
  });
  // SDK v1's concrete client permits an undefined sessionId; its Transport
  // interface omits that union under exactOptionalPropertyTypes.
  await client.connect(transport as Transport);
  return { client, submit };
}

describe("shop MCP through the official HTTP client", () => {
  it("initializes, discovers two tools, and reads real catalog data with absolute images", async () => {
    const { client, submit } = await connect();
    try {
      expect((await client.listTools()).tools.map(t => t.name)).toEqual(["search_materials", "create_trial_order"]);
      const result = await client.callTool({ name: "search_materials", arguments: { search: "HMR" } });
      expect(result.structuredContent).toMatchObject({ count: 1, items: [{ id: "MAT004", price: 1250, imageUrl: "https://shop.example/images/materials/cat-board.jpg" }] });
      const limited = await client.callTool({ name: "search_materials", arguments: { search: "HMR", maxPrice: 1000 } });
      expect(limited.structuredContent).toMatchObject({ count: 0 });
      expect((await client.callTool({ name: "search_materials", arguments: {} })).structuredContent).toMatchObject({ count: 8 });
      expect(submit).not.toHaveBeenCalled();
    } finally { await client.close(); }
  });

  it("requires confirmation and positive quantity, forwards customer data and preserves requestId", async () => {
    const { client, submit } = await connect();
    const args = { customerName: "ลูกค้าทดสอบ", requestId: "test-order-1", items: [{ materialId: "MAT001", quantity: 1 }] };
    try {
      expect((await client.callTool({ name: "create_trial_order", arguments: args })).isError).toBe(true);
      expect((await client.callTool({ name: "create_trial_order", arguments: { ...args, confirmed: true, items: [{ materialId: "MAT001", quantity: 0 }] } })).isError).toBe(true);
      expect(submit).not.toHaveBeenCalled();
      const result = await client.callTool({ name: "create_trial_order", arguments: { ...args, confirmed: true } });
      expect(result.isError).toBe(false);
      expect(result.structuredContent).toMatchObject({ orderId: "TEST-1", total: 750 });
      expect(await submit.mock.calls[0]![0].json()).toEqual(args);
    } finally { await client.close(); }
  });

  it("returns API failures as tool errors and never claims success after an exception", async () => {
    const submit = vi.fn(async (_request: Request) => Response.json({ error: "validation_failed" }, { status: 400 }));
    const { client } = await connect(submit);
    const args = { customerName: "ทดสอบ", requestId: "retry-same-id", items: [{ materialId: "MAT999", quantity: 1 }], confirmed: true };
    try {
      expect((await client.callTool({ name: "create_trial_order", arguments: args })).isError).toBe(true);
      submit.mockRejectedValueOnce(new Error("database unavailable"));
      expect((await client.callTool({ name: "create_trial_order", arguments: args })).isError).toBe(true);
    } finally { await client.close(); }
  });

  it("rejects foreign browser origins, malformed JSON and unsupported methods", async () => {
    const submit = vi.fn();
    expect((await handleMcpRequest(new Request(endpoint, { method: "POST", headers: { Origin: "https://unrelated.example" } }), submit)).status).toBe(403);
    expect((await handleMcpRequest(new Request(endpoint), submit)).status).toBe(405);
    expect((await handleMcpRequest(new Request(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" }, body: "{" }), submit)).status).toBe(400);
    expect(submit).not.toHaveBeenCalled();
  });
});
