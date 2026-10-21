export type Material = {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  unit: string;
};

export const MATERIALS: Material[] = [
  { id: "MAT001", name: "MDF 18 มม.", category: "แผ่นไม้", size: "1220×2440×18 มม.", price: 750, unit: "แผ่น" },
  { id: "MAT002", name: "ปาร์ติเคิลเมลามีนขาว 18 มม.", category: "แผ่นไม้", size: "1220×2440×18 มม.", price: 890, unit: "แผ่น" },
  { id: "MAT003", name: "ไม้อัดยาง 15 มม.", category: "แผ่นไม้", size: "1220×2440×15 มม.", price: 1050, unit: "แผ่น" },
  { id: "MAT004", name: "HMR 18 มม.", category: "แผ่นไม้", size: "1220×2440×18 มม.", price: 1250, unit: "แผ่น" },
  { id: "MAT005", name: "ลามิเนตลายโอ๊ก", category: "วัสดุปิดผิว", size: "1220×2440×0.8 มม.", price: 650, unit: "แผ่น" },
  { id: "MAT006", name: "ขอบ PVC ขาว", category: "วัสดุปิดขอบ", size: "22×1 มม. ยาว 10 เมตร", price: 180, unit: "ม้วน" },
  { id: "MAT007", name: "บานพับปิดนุ่ม", category: "อุปกรณ์", size: "ถ้วย 35 มม.", price: 95, unit: "ชิ้น" },
  { id: "MAT008", name: "รางลิ้นชักปิดนุ่ม", category: "อุปกรณ์", size: "ยาว 450 มม.", price: 420, unit: "คู่" },
];

export const CATEGORIES = ["แผ่นไม้", "วัสดุปิดผิว", "วัสดุปิดขอบ", "อุปกรณ์"];

export function filterMaterials(opts: { search?: string | null; category?: string | null; maxPrice?: string | number | null }) {
  const q = (opts.search ?? "").trim().toLowerCase();
  const cat = (opts.category ?? "").trim();
  const mp = opts.maxPrice === null || opts.maxPrice === undefined || opts.maxPrice === "" ? null : Number(opts.maxPrice);
  return MATERIALS.filter(
    (m) =>
      (!q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)) &&
      (!cat || m.category === cat) &&
      (mp === null || Number.isNaN(mp) || m.price <= mp),
  );
}

export type OrderInput = { customerName?: unknown; items?: unknown; requestId?: unknown };
export type PricedItem = { materialId: string; name: string; quantity: number; unitPrice: number; unit: string; subtotal: number };

/** Validates input and prices it from server data only. Returns errors (Thai) or priced result. */
export function priceOrder(body: OrderInput):
  | { ok: false; errors: string[] }
  | { ok: true; customerName: string; requestId: string; items: PricedItem[]; total: number } {
  const errors: string[] = [];
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
  if (!customerName || customerName.length > 100) errors.push("customerName ต้องเป็นข้อความ 1-100 ตัวอักษร");
  if (!requestId || requestId.length > 100) errors.push("requestId ต้องเป็นข้อความ 1-100 ตัวอักษร");
  const items: PricedItem[] = [];
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    errors.push("items ต้องเป็นอาร์เรย์ 1-50 รายการ");
  } else {
    body.items.forEach((raw, i) => {
      const it = (raw ?? {}) as { materialId?: unknown; quantity?: unknown };
      const m = MATERIALS.find((x) => x.id === it.materialId);
      if (!m) errors.push(`items[${i}].materialId ไม่พบรหัสสินค้า`);
      const q = it.quantity;
      if (typeof q !== "number" || !Number.isInteger(q) || q <= 0 || q > 10000)
        errors.push(`items[${i}].quantity ต้องเป็นจำนวนเต็มบวก (1-10000)`);
      if (m && typeof q === "number" && Number.isInteger(q) && q > 0 && q <= 10000)
        items.push({ materialId: m.id, name: m.name, quantity: q, unitPrice: m.price, unit: m.unit, subtotal: m.price * q });
    });
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, customerName, requestId, items, total: items.reduce((s, x) => s + x.subtotal, 0) };
}
