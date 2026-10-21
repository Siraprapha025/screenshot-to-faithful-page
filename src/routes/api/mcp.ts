import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }) {
  const [{ handleMcpRequest }, { handleCreateOrder }] = await Promise.all([
    import("@/lib/mcp.server"), import("@/lib/orders.server"),
  ]);
  return handleMcpRequest(request, handleCreateOrder);
}

export const Route = createFileRoute("/api/mcp")({
  server: { handlers: { POST: handle, GET: handle, DELETE: handle } },
});
