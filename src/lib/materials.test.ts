import { describe, expect, it } from "vitest";
import { MATERIALS, filterMaterials, priceOrder } from "./materials";

describe("materials", () => {
  it("every material has non-empty usage and caution", () => {
    for (const m of MATERIALS) {
      expect(m.usage.length).toBeGreaterThan(0);
      expect(m.caution.length).toBeGreaterThan(0);
    }
  });
  it("returns all 8 without filters", () => expect(filterMaterials({})).toHaveLength(8));
  it("filters by maxPrice", () => expect(filterMaterials({ maxPrice: "500" }).map((m) => m.id)).toEqual(["MAT006", "MAT007", "MAT008"]));
  it("searches by id", () => expect(filterMaterials({ search: "mat004" })[0]?.id).toBe("MAT004"));
  it("prices from server data, ignoring client price", () => {
    const r = priceOrder({ customerName: "ทดสอบ", requestId: "r1", items: [{ materialId: "MAT001", quantity: 2, price: 1 } as never] });
    expect(r.ok && r.total).toBe(1500);
  });
  it("rejects unknown id and non-integer qty", () => {
    const r = priceOrder({ customerName: "a", requestId: "r", items: [{ materialId: "X", quantity: 1.5 }] });
    expect(r.ok).toBe(false);
  });
});
