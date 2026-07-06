# พิมพ์เขียวการออกแบบ: การปรับโครงสร้าง Frontend & การนำ Pinia มาใช้

## 1. เป้าหมาย (Goal)
ปรับโครงสร้าง (Refactor) โค้ดของ Vue 3 ที่ปัจจุบันกองรวมกันอยู่ที่เดียว (โดยเฉพาะไฟล์ `App.vue` และ `BuilderView.vue`) ให้กลายเป็นโครงสร้างที่ดูแลรักษาง่ายและขยายสเกลได้ในอนาคต โดยการนำ **Pinia** มาใช้จัดการ State ส่วนกลาง การปรับปรุงนี้จะช่วยเตรียมความพร้อมสำหรับการเขียน Automated Test (Unit Testing) และการเชื่อมต่อฟีเจอร์ AI ใหม่ๆ 

## 2. การเปลี่ยนแปลงสถาปัตยกรรม (Architecture Changes)

### การจัดการสถานะ (State Management ด้วย Pinia)
เราจะสร้าง Pinia Store หลัก 3 ตัวในโฟลเดอร์ `frontend/src/stores/`:

1. **`useAuthStore`**
   - **State**: `user` (เก็บข้อมูลผู้ใช้), `token` (เก็บ JWT Token)
   - **Actions**: `login(email, password)`, `register(data)`, `logout()`
   - **Getters**: `isAuthenticated` (ตรวจสอบว่าล็อกอินหรือยัง), `isAdmin` (ตรวจสอบว่าเป็นแอดมินไหม)
   - **จุดประสงค์**: รวมลอจิกการเข้าสู่ระบบ/ออกจากระบบ โดย Store นี้จะเรียก API ไปจัดการที่ฐานข้อมูล (MySQL) และรับ Token มาเซฟลง `LocalStorage` ของเบราว์เซอร์ (เพื่อให้รีเฟรชหน้าแล้วล็อกอินไม่หลุด)

2. **`useCatalogStore`**
   - **State**: `hardwareList` (รายการสินค้าทั้งหมด), `isLoading` (สถานะกำลังโหลด)
   - **Actions**: `fetchCatalog()` (ดึงข้อมูล)
   - **Getters**: `getCategorizedHardware` (จัดกลุ่มอุปกรณ์ตามประเภท)
   - **จุดประสงค์**: ดึงข้อมูลและแคช (Cache) ฐานข้อมูลฮาร์ดแวร์จาก Backend ไม่ต้องดึงซ้ำบ่อยๆ

3. **`useBuilderStore`**
   - **State**: `build` (อ็อบเจ็กต์ตะกร้าสินค้า เช่น cpu -> itemId)
   - **Actions**: `selectItem(category, itemId)`, `clearBuild()`, `applyPreset(presetId)`
   - **Getters**: `totalPrice` (ราคารวม), `compatibilityIssues` (ปัญหาความเข้ากันได้), `isBuildReadyToCheckout`
   - **จุดประสงค์**: จัดการลอจิกการจัดสเปคคอมฯ คำนวณราคา และตรวจเช็คความเข้ากันได้ของชิ้นส่วนต่างๆ

### การปรับโครงสร้าง Component (Component Refactoring)
1. **`App.vue`**
   - **ก่อนแก้**: โค้ดยาวเกือบ 800 บรรทัด จัดการทั้งเรื่องการดึงข้อมูล, ฟอร์มล็อกอิน, ตะกร้าจัดสเปค, ลอจิกแชตบอต AI, และ Routing
   - **หลังแก้**: จะเหลือหน้าที่แค่เป็น "โครงหลัก" (Layout Component) ทำหน้าที่แสดง Navigation Bar ด้านบน, `<router-view>` ตรงกลาง, และ Modal ที่ใช้ร่วมกันทั้งแอป
2. **`BuilderView.vue`**
   - **ก่อนแก้**: ต้องโยน Props (ตัวแปร) ลงไปให้ลูกๆ (`HardwareSelection`, `PriceSummary`) มากกว่า 10 ตัว (Props Drilling)
   - **หลังแก้**: คอมโพเนนต์ลูกๆ สามารถดึงข้อมูลจาก `useBuilderStore` และ `useCatalogStore` ได้โดยตรง โค้ดจะสะอาดขึ้นมหาศาล
3. **`ChatbotWindow.vue`**
   - จะมี State ของตัวเอง หรือแยกไปใช้ `useChatStore` รับหน้าที่จัดการการยิง API คุยกับ AI (`processBotResponse`) ด้วยตัวเอง แทนที่จะไปฝากไว้ที่ App.vue

## 3. ลำดับขั้นตอนการทำงาน (Implementation Phases)
1. **เฟส 1: ติดตั้ง & สร้าง Store**
   - รันคำสั่งติดตั้ง Pinia (`npm install pinia`)
   - ตั้งค่า Pinia ใน `main.js`
   - สร้างไฟล์ `auth.js`, `catalog.js`, `builder.js`
2. **เฟส 2: ย้ายข้อมูล (Data Migration)**
   - ย้าย Preset สเปคคอม และลอจิกการดึง Backend เข้าไปใน Store
   - ย้ายลอจิก "ตรวจสอบความเข้ากันได้ของฮาร์ดแวร์" ไปเป็น Getters ใน `useBuilderStore`
3. **เฟส 3: เชื่อมต่อ Component**
   - รื้อ State เก่าใน `App.vue` ออก
   - ปรับให้ `BuilderView.vue`, `HardwareSelection.vue`, และ `PriceSummary.vue` ไปอ่านค่าจาก Store แทน
   - ตรวจสอบให้แน่ใจว่า AI Chatbot ยังทำงานได้อย่างอิสระ

## 4. ความเสี่ยง & สิ่งที่ต้องระวัง (Risks & Considerations)
- **ความเสี่ยง**: อาจทำให้ระบบ Checkout (สั่งซื้อ) พัง เพราะเดิมมันพึ่งพา `App.vue` ในการบันทึกออเดอร์
- **วิธีแก้**: ย้ายลอจิกการสั่งซื้อไปอยู่ใน Action ชื่อ `checkout()` ของ `useBuilderStore` หรือให้ `CheckoutView.vue` จัดการตัวเอง
- **ความเสี่ยง**: อาจโดน Rate Limit ตอนเรียกใช้ API ของแชตบอต หากข้อมูล State รีเซ็ตบ่อย 
- **วิธีแก้**: เซฟประวัติแชตเอาไว้ใน Store 

## 5. ก้าวต่อไป (Next Steps)
หลังจากคุณอนุมัติ Design Spec ฉบับนี้แล้ว ผมจะเรียกใช้สกิล `writing-plans` เพื่อวางแผนและสั่งให้ Subagents เริ่มลงมือเขียนโค้ดตามลูป (Loop-Engineering) ครับ!
