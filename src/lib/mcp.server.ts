import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { filterMaterials } from "./materials";

type SubmitOrder = (request: Request) => Promise<Response>;

export function createShopMcpServer(origin: string, submitOrder: SubmitOrder) {
  const server = new McpServer({ name: "built-in-material-shop", version: "1.0.0" });
  server.registerTool("search_materials", {
    title: "ค้นหาวัสดุและราคา",
    description: "ค้นสินค้าจริงของร้านพร้อมราคา หน่วย รายละเอียดและ imageUrl หากไม่รู้คำค้นให้ไม่ส่งตัวกรองเพื่อดูทั้งหมด หากไม่พบในงบให้ค้นอีกครั้งโดยไม่จำกัดราคา ห้ามสรุปว่าไม่มีสินค้าจากการเรียกที่ล้มเหลว",
    inputSchema: {
      search: z.string().max(100).optional().describe("ชื่อหรือรหัสสินค้า เช่น HMR หรือ MAT004; เว้นว่างเพื่อดูทั้งหมด"),
      category: z.enum(["แผ่นไม้", "วัสดุปิดผิว", "วัสดุปิดขอบ", "อุปกรณ์"]).optional(),
      maxPrice: z.number().finite().nonnegative().optional().describe("ราคาสูงสุดต่อหน่วยขาย ไม่ใช่งบทั้งงาน"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (args) => {
    const items = filterMaterials({ search: args.search ?? null, category: args.category ?? null, maxPrice: args.maxPrice ?? null }).map(({ imagePath, ...material }) => ({
      ...material, imageUrl: new URL(imagePath, origin).href,
    }));
    const data = { count: items.length, currency: "THB", items };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data };
  });
  server.registerTool("create_trial_order", {
    title: "สร้างคำสั่งซื้อทดลอง",
    description: "บันทึกคำสั่งซื้อทดลอง ไม่มีการชำระเงินหรือจัดส่งจริง เรียกหลังลูกค้ายืนยันชื่อ รายการ จำนวนและยอดรวมล่าสุดเท่านั้น ไม่เรียกเพื่อถามราคา ใช้ requestId ใหม่สำหรับคำสั่งซื้อใหม่ และใช้ค่าเดิมกับข้อมูลเดิมเมื่อส่งซ้ำ ห้ามอ้างว่าสำเร็จหากเครื่องมือผิดพลาด",
    inputSchema: {
      customerName: z.string().trim().min(1).max(100),
      items: z.array(z.object({ materialId: z.string().min(1), quantity: z.number().int().min(1).max(10000) })).min(1).max(50),
      requestId: z.string().trim().min(1).max(100).describe("รหัสไม่ซ้ำของคำสั่งซื้อ ใช้ค่าเดิมในการลองส่งคำสั่งซื้อเดิมซ้ำ"),
      confirmed: z.literal(true).describe("true เฉพาะหลังลูกค้ายืนยันรายการล่าสุดแล้ว"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ confirmed: _confirmed, ...order }) => {
    try {
      const response = await submitOrder(new Request(new URL("/api/public/orders", origin), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order),
      }));
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data, isError: !response.ok };
    } catch {
      return { content: [{ type: "text", text: "ตรวจผลการบันทึกไม่ได้ชั่วคราว ห้ามแจ้งว่าสำเร็จ หากลองใหม่ต้องใช้ requestId และข้อมูลเดิม" }], isError: true };
    }
  });
  return server;
}

// Stateless Streamable HTTP works across serverless instances without an in-memory session store.
export async function handleMcpRequest(request: Request, submitOrder: SubmitOrder): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return new Response("Origin not allowed", { status: 403 });
  if (request.method !== "POST") return new Response("Use an MCP Streamable HTTP client with POST.", {
    status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" },
  });
  const server = createShopMcpServer(url.origin, submitOrder);
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } finally {
    await server.close();
  }
}
