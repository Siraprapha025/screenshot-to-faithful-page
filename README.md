# Screenshot To Faithful Page

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://screenshot-to-faithful-page.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6243859d-78a7-4ad9-bec9-c8c72bed9ece).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Material images for Botnoi / LINE

GET `/api/public/materials` returns `name`, `price`, `unit`, and an absolute `imageUrl` in each item. Existing filters (`search`, `category`, `maxPrice`) are unchanged. Images are the existing category illustrations, not individual product photos.

After publishing, test `/api/public/materials?search=MAT004` and open the returned `imageUrl` in a browser. Use `name` for the product title and `imageUrl` for the image in Botnoi / LINE. Configuring a Flex Message in Botnoi is a separate step.


## เชื่อม Botnoi Agent ด้วย MCP

หลัง Push และ Publish เวอร์ชันนี้แล้ว ใช้ Custom MCP Server:

- ชื่อ: `Built-in Material Shop`
- URL: `https://screenshot-to-faithful-page.lovable.app/api/mcp`
- Header: ไม่ต้องเพิ่มสำหรับระบบสั่งซื้อทดลองนี้
- Transport: MCP Streamable HTTP (stateless, JSON responses)

เลือกเครื่องมือทั้งสองแล้วบันทึก Agent:

1. `search_materials`: ค้นด้วยชื่อ/รหัส, หมวด, ราคาสูงสุด หรือส่ง `{}` เพื่อดูทั้งหมด คืน `items` พร้อม `name`, `price`, `unit`, `usage`, `caution`, `imageUrl`
2. `create_trial_order`: รับ `customerName`, `items`, `requestId`, `confirmed: true` ใช้ระบบบันทึกคำสั่งซื้อเดียวกับ REST API เดิม

เพิ่มข้อความนี้ใน Instruction โดยคงกติกาการถามชื่อและยืนยันคำสั่งซื้อเดิม:

> เมื่อถามสินค้าและราคา ให้เรียก search_materials และอ่าน items จากผลเครื่องมือก่อนตอบ หากไม่รู้คำค้นให้ส่ง {} เพื่อดึงทั้งหมด หากงบเปลี่ยนให้ค้นใหม่ หากไม่พบในงบให้ค้นโดยไม่จำกัดราคาแล้วแจ้งส่วนต่าง ห้ามอ้างว่าไม่มีข้อมูลสินค้าเมื่อเครื่องมือผิดพลาด ใช้ imageUrl จากผลเป็นลิงก์ภาพเท่านั้น ไม่แต่ง URL ก่อนสร้างคำสั่งซื้อให้สรุปชื่อ สินค้า จำนวน และยอดรวมให้ลูกค้ายืนยัน จากนั้นเรียก create_trial_order โดยใส่ confirmed: true พร้อมข้อมูลที่ยืนยันและ requestId ใหม่ หากลองส่งคำสั่งซื้อเดิมซ้ำให้ใช้ requestId และข้อมูลเดิม แจ้งเลขคำสั่งซื้อและยอดจากผลเครื่องมือเท่านั้น

ทดสอบในบทสนทนาใหม่: แจ้งชื่อ → ถาม HMR ราคาเท่าไร (ต้องตอบ 1,250 บาท/แผ่น) → ถามสินค้าทั้งหมด → สั่ง MDF 1 แผ่น → ยืนยัน → ต้องได้ orderId จากฐานข้อมูลจริง

การเปิด URL MCP ตรงในเบราว์เซอร์จะได้ HTTP 405 เพราะต้องเชื่อมด้วย MCP client ผ่าน POST ไม่ใช่หน้าเว็บปกติ การแสดง Flex Message และการเชื่อม LINE ต้องตั้งค่าใน Botnoi เพิ่ม และต้องทดสอบกับ Botnoi จริงหลังเผยแพร่ หาก Botnoi รองรับเฉพาะ SSE แบบเก่า endpoint นี้จะยังเชื่อมไม่ได้ ห้ามเปลี่ยน URL สุ่ม

ระบบนี้เปิดสาธารณะตามขอบเขตงานสาธิต ไม่มีชำระเงิน จัดส่ง ตรวจสถานะ หรือยกเลิกคำสั่งซื้อ ตัว confirmed เป็นข้อมูลที่ Agent ส่ง ไม่ใช่หลักฐานการยืนยันจากระบบชำระเงิน
