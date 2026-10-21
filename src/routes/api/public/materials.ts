import { createFileRoute } from "@tanstack/react-router";
import { filterMaterials } from "@/lib/materials";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/materials")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const p = url.searchParams;
        const items = filterMaterials({ search: p.get("search"), category: p.get("category"), maxPrice: p.get("maxPrice") }).map(({ imagePath, ...material }) => ({
          ...material,
          imageUrl: new URL(imagePath, url.origin).href,
        }));
        return Response.json({ count: items.length, currency: "THB", items }, { headers: cors });
      },
    },
  },
});
