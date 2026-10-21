import { priceOrder } from "./materials";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type Row = { order_no: string; items: unknown; total: number; currency: string; customer_name: string; request_id: string };
const toBody = (r: Row, duplicate: boolean) => ({
  orderId: r.order_no,
  requestId: r.request_id,
  customerName: r.customer_name,
  items: r.items,
  total: Number(r.total),
  currency: r.currency,
  duplicate,
});

export async function handleCreateOrder(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json", errors: ["body ต้องเป็น JSON"] }, { status: 400, headers: cors });
  }
  const priced = priceOrder((body ?? {}) as object);
  if (!priced.ok) return Response.json({ error: "validation_failed", errors: priced.errors }, { status: 400, headers: cors });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cols = "order_no, items, total, currency, customer_name, request_id";
  const existing = await supabaseAdmin.from("orders").select(cols).eq("request_id", priced.requestId).maybeSingle();
  if (existing.data) return Response.json(toBody(existing.data as Row, true), { status: 200, headers: cors });

  const orderNo = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const ins = await supabaseAdmin
    .from("orders")
    .insert({ order_no: orderNo, request_id: priced.requestId, customer_name: priced.customerName, items: priced.items, total: priced.total, currency: "THB" })
    .select(cols)
    .single();
  if (ins.error) {
    // race on unique request_id → return the stored one
    const again = await supabaseAdmin.from("orders").select(cols).eq("request_id", priced.requestId).maybeSingle();
    if (again.data) return Response.json(toBody(again.data as Row, true), { status: 200, headers: cors });
    return Response.json({ error: "save_failed" }, { status: 500, headers: cors });
  }
  return Response.json(toBody(ins.data as Row, false), { status: 201, headers: cors });
}
