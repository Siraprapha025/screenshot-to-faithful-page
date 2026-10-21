import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/orders")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      } }),
      POST: async ({ request }) => {
        const { handleCreateOrder } = await import("@/lib/orders.server");
        return handleCreateOrder(request);
      },
    },
  },
});
