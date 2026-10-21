import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Material } from "@/lib/materials";
import imgBoard from "@/assets/cat-board.jpg";
import imgSurface from "@/assets/cat-surface.jpg";
import imgEdge from "@/assets/cat-edge.jpg";
import imgHardware from "@/assets/cat-hardware.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Built-in Material Shop — ระบบสาธิต" },
      { name: "description", content: "ค้นหาวัสดุงานบิวท์อิน สั่งซื้อทดลอง และทดสอบ API สำหรับเตรียมเชื่อม Botnoi Agent" },
      { property: "og:title", content: "Built-in Material Shop — ระบบสาธิต" },
      { property: "og:description", content: "ค้นหาวัสดุ สั่งซื้อทดลอง และทดสอบ API จริง" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const IMG: Record<string, string> = { แผ่นไม้: imgBoard, วัสดุปิดผิว: imgSurface, วัสดุปิดขอบ: imgEdge, อุปกรณ์: imgHardware };
const MAT_PATH = "/api/public/materials";
const ORD_PATH = "/api/public/orders";
const baht = (n: number) => n.toLocaleString("th-TH") + " บาท";
const newReq = () => "req-" + crypto.randomUUID().slice(0, 8);

const card = "rounded-xl border border-border bg-card p-4 shadow-sm";
const input = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const btn = "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50";
const btn2 = "rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-muted";

function useMaterials(params: Record<string, string>) {
  const [items, setItems] = useState<Material[] | null>(null);
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  useEffect(() => {
    let alive = true;
    fetch(MAT_PATH + (qs ? "?" + qs : ""))
      .then((r) => r.json())
      .then((d) => alive && setItems(d.items));
    return () => {
      alive = false;
    };
  }, [qs]);
  return items;
}

function Index() {
  const [tab, setTab] = useState<"m" | "o" | "a">("m");
  const tabs = [
    ["m", "วัสดุ"],
    ["o", "สั่งซื้อทดลอง"],
    ["a", "API Test"],
  ] as const;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <p className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            ระบบสาธิต — ยังไม่เชื่อม Botnoi
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Built-in Material Shop</h1>
          <p className="text-sm text-muted-foreground">ร้านวัสดุงานบิวท์อิน · ภาพและราคาเป็นตัวอย่างเท่านั้น</p>
          <nav className="mt-4 flex gap-2 overflow-x-auto">
            {tabs.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={tab === k ? btn : btn2}>
                {l}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "m" && <MaterialsTab />}
        {tab === "o" && <OrderTab />}
        {tab === "a" && <ApiTab />}
      </main>
    </div>
  );
}

function MaterialsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const items = useMaterials({ search, category, maxPrice });
  return (
    <section>
      <div className="grid gap-2 sm:grid-cols-3">
        <input className={input} placeholder="ค้นหาชื่อหรือรหัส เช่น MDF, MAT007" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">ทุกประเภท</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input className={input} type="number" min={0} placeholder="ราคาสูงสุด (บาท)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{items ? `พบ ${items.length} รายการ` : "กำลังโหลด…"}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items?.map((m) => (
          <article key={m.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <img src={IMG[m.category]} alt={m.category} loading="lazy" width={992} height={672} className="aspect-[3/2] w-full object-cover" />
            <div className="p-3">
              <p className="font-mono text-xs text-muted-foreground">{m.id} · {m.category}</p>
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-xs text-muted-foreground">{m.size}</p>
              <p className="mt-1 text-xs"><span className="text-muted-foreground">ใช้:</span> {m.usage}</p>
              <p className="text-xs"><span className="text-muted-foreground">ระวัง:</span> {m.caution}</p>
              <p className="mt-1 font-bold text-primary">
                {baht(m.price)} / {m.unit}
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">* ภาพประกอบใช้ร่วมกันตามประเภทสินค้า ราคาเป็นข้อมูลตัวอย่าง</p>
    </section>
  );
}

function OrderTab() {
  const all = useMaterials({});
  const [name, setName] = useState("");
  const [lines, setLines] = useState<{ id: string; q: string }[]>([{ id: "MAT001", q: "1" }]);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState(newReq);
  const [result, setResult] = useState<{ ok: boolean; data: any } | null>(null);

  const preview = useMemo(
    () =>
      lines.map((l) => {
        const m = all?.find((x) => x.id === l.id);
        const q = Number(l.q);
        return { m, q, sub: m && Number.isInteger(q) && q > 0 ? m.price * q : 0 };
      }),
    [lines, all],
  );
  const valid = name.trim() && preview.every((p) => p.m && Number.isInteger(p.q) && p.q > 0);
  const total = preview.reduce((s, p) => s + p.sub, 0);

  async function submit() {
    setBusy(true);
    const res = await fetch(ORD_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name, requestId, items: lines.map((l) => ({ materialId: l.id, quantity: Number(l.q) })) }),
    });
    setResult({ ok: res.ok, data: await res.json() });
    setBusy(false);
    setConfirming(false);
  }
  function reset() {
    setResult(null);
    setRequestId(newReq());
    setLines([{ id: "MAT001", q: "1" }]);
  }

  if (result?.ok)
    return (
      <div className={card}>
        <p className="text-sm text-success font-semibold">บันทึกคำสั่งซื้อทดลองแล้ว{result.data.duplicate ? " (คำขอซ้ำ — คืนคำสั่งเดิม)" : ""}</p>
        <p className="mt-1 text-2xl font-bold">{result.data.orderId}</p>
        <ul className="mt-3 text-sm">
          {result.data.items.map((i: any) => (
            <li key={i.materialId}>
              {i.name} × {i.quantity} = {baht(i.subtotal)}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-semibold">ยอดรวม {baht(result.data.total)}</p>
        <p className="text-xs text-muted-foreground">ไม่มีการชำระเงิน จัดส่ง หรือตัดสต็อก</p>
        <button className={btn + " mt-4"} onClick={reset}>
          สั่งใหม่
        </button>
      </div>
    );

  return (
    <section className={card}>
      <label className="text-sm font-medium">ชื่อสมมติผู้สั่ง</label>
      <input className={input + " mt-1"} value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ช่างสมชาย" disabled={confirming} />
      <div className="mt-4 space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2">
            <select className={input} value={l.id} disabled={confirming} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)))}>
              {all?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} {m.name} ({baht(m.price)}/{m.unit})
                </option>
              ))}
            </select>
            <input className={input + " w-24"} type="number" min={1} step={1} value={l.q} disabled={confirming} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
            {lines.length > 1 && !confirming && (
              <button className={btn2} onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                ลบ
              </button>
            )}
          </div>
        ))}
        {!confirming && (
          <button className={btn2} onClick={() => setLines([...lines, { id: "MAT001", q: "1" }])}>
            + เพิ่มรายการ
          </button>
        )}
      </div>
      <p className="mt-4 text-lg font-bold">ยอดรวมโดยประมาณ {baht(total)}</p>
      {result && !result.ok && <pre className="mt-2 whitespace-pre-wrap text-sm text-destructive">{(result.data.errors ?? [result.data.error]).join("\n")}</pre>}
      {!confirming ? (
        <button className={btn + " mt-3"} disabled={!valid} onClick={() => setConfirming(true)}>
          ตรวจสอบก่อนยืนยัน
        </button>
      ) : (
        <div className="mt-3 rounded-lg bg-muted p-3">
          <p className="text-sm">ยืนยันส่งคำสั่งซื้อทดลอง {baht(total)} ในชื่อ “{name}”? (ราคาสุดท้ายคำนวณโดยระบบหลังบ้าน)</p>
          <div className="mt-2 flex gap-2">
            <button className={btn} disabled={busy} onClick={submit}>
              {busy ? "กำลังส่ง…" : "ยืนยันสั่งซื้อ"}
            </button>
            <button className={btn2} disabled={busy} onClick={() => setConfirming(false)}>
              แก้ไข
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

type Spec = { method: "GET" | "POST"; path: string; desc: string; fields: string; example: string; botnoi: string; respExample?: string };
const SPECS: Spec[] = [
  {
    method: "GET",
    path: MAT_PATH,
    desc: "ค้นหาวัสดุ พารามิเตอร์ (ไม่บังคับ): search = ชื่อ/รหัส, category = ประเภท (แผ่นไม้, วัสดุปิดผิว, วัสดุปิดขอบ, อุปกรณ์), maxPrice = ราคาสูงสุด ไม่ส่งตัวกรองจะคืนทั้งหมด ทุก item มีฟิลด์ usage (การใช้งาน) และ caution (ข้อควรระวัง) สำหรับแนะนำสินค้า",
    fields: "search=MDF&maxPrice=1000",
    example: "?category=อุปกรณ์&maxPrice=200",
    respExample: JSON.stringify({ count: 1, currency: "THB", items: [{ id: "MAT001", name: "MDF 18 มม.", category: "แผ่นไม้", size: "1220×2440×18 มม.", price: 750, unit: "แผ่น", usage: "งานภายในแห้งและหน้าบานพ่นสี", caution: "ต้องปิดผิว หลีกเลี่ยงน้ำ" }] }, null, 2),
    botnoi: "ตั้งเป็น Tool ชื่อ search_materials · Method GET · Query: search, category, maxPrice (string, optional) · ใช้เมื่อลูกค้าถามหาวัสดุหรือราคา",
  },
  {
    method: "POST",
    path: ORD_PATH,
    desc: "สร้างคำสั่งซื้อทดลอง Body JSON: customerName, items [{materialId, quantity}], requestId ราคาคำนวณจากหลังบ้าน requestId ซ้ำจะคืนคำสั่งเดิม (duplicate: true)",
    fields: JSON.stringify({ customerName: "ช่างสมชาย", requestId: "botnoi-001", items: [{ materialId: "MAT001", quantity: 2 }, { materialId: "MAT007", quantity: 4 }] }, null, 2),
    example: '{"customerName":"ทดสอบ","requestId":"x1","items":[{"materialId":"MAT999","quantity":0}]}  → 400',
    botnoi: "ตั้งเป็น Tool ชื่อ create_order · Method POST · Header Content-Type: application/json · ให้ Agent สรุปรายการและยอดให้ลูกค้ายืนยันก่อนเรียกเสมอ และสร้าง requestId ใหม่ต่อการยืนยันหนึ่งครั้ง",
  },
];

function ApiTab() {
  return (
    <div className="space-y-6">
      {SPECS.map((s) => (
        <ApiCard key={s.path} s={s} />
      ))}
    </div>
  );
}

function ApiCard({ s }: { s: Spec }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = origin + s.path;
  const [val, setVal] = useState(s.fields);
  const [out, setOut] = useState<{ status: number; body: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const res =
        s.method === "GET"
          ? await fetch(url + (val.trim() ? "?" + val.trim().replace(/^\?/, "") : ""))
          : await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: val });
      const t = await res.text();
      let pretty = t;
      try {
        pretty = JSON.stringify(JSON.parse(t), null, 2);
      } catch {}
      setOut({ status: res.status, body: pretty });
    } catch (e) {
      setOut({ status: 0, body: String(e) });
    }
    setBusy(false);
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-primary px-2 py-1 font-mono text-xs font-bold text-primary-foreground">{s.method}</span>
        <code className="break-all font-mono text-sm">{url}</code>
        <button
          className={btn2 + " py-1 text-xs"}
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "คัดลอกแล้ว" : "คัดลอก URL"}
        </button>
      </div>
      <p className="mt-2 text-sm">{s.desc}</p>
      {s.respExample && (
        <>
          <p className="mt-2 text-xs font-medium">ตัวอย่าง response (มี usage และ caution ทุกรายการ):</p>
          <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-code p-3 font-mono text-xs text-code-foreground">{s.respExample}</pre>
        </>
      )}
      <p className="mt-2 text-xs text-muted-foreground">ตัวอย่างอื่น: <code className="font-mono">{s.example}</code></p>
      <p className="mt-1 rounded-lg bg-muted p-2 text-xs">Botnoi Agent: {s.botnoi}</p>
      <label className="mt-3 block text-sm font-medium">{s.method === "GET" ? "Query string" : "Request body (JSON)"}</label>
      <textarea className={input + " mt-1 font-mono"} rows={s.method === "GET" ? 2 : 8} value={val} onChange={(e) => setVal(e.target.value)} />
      <button className={btn + " mt-2"} onClick={send} disabled={busy}>
        {busy ? "กำลังส่ง…" : "Send"}
      </button>
      {out && (
        <div className="mt-3">
          <p className={"text-sm font-semibold " + (out.status >= 200 && out.status < 300 ? "text-success" : "text-destructive")}>HTTP {out.status}</p>
          <pre className="mt-1 max-h-80 overflow-auto rounded-lg bg-code p-3 font-mono text-xs text-code-foreground">{out.body}</pre>
        </div>
      )}
    </section>
  );
}
