# 📑 SuperK OneOCR Integration Plan (คู่มือผสาน Windows Native OneOCR เข้ากับ OCR Service)

## 1. 🏗️ สถาปัตยกรรมและตำแหน่งไฟล์ (File & Architecture Mapping)

| ส่วนประกอบ (Component) | ตำแหน่งไฟล์ (File Path) | หน้าที่และความรับผิดชอบ |
| :--- | :--- | :--- |
| **OneOCR Engine Module** | `ocr-service/app/oneocr/__init__.py` | Export `OneOcrEngine` |
| **OneOCR Core Wrapper** | `ocr-service/app/oneocr/engine.py` | คลาส `OneOcrEngine` จัดการ WinRT OCR, การแปลง PIL Image เป็น `SoftwareBitmap`, และ Normalize Bounding Box |
| **FastAPI App & Endpoints** | `ocr-service/app/api.py` | เพิ่ม `app.state.one_ocr` ใน Lifespan และเปิด Endpoint `@app.post("/v1/ocr/native")` |
| **Unit Test Suite** | `ocr-service/tests/test_oneocr.py` | ทดสอบการทำงานของ `OneOcrEngine` ทั้งกรณีที่พร้อมใช้งานและ Graceful Fallback |

---

## 2. 🔍 วิเคราะห์ปัญหาและความถูกต้องเชิงเทคนิค (Technical Feasibility & Gap Analysis)

### 2.1 สถาปัตยกรรม Windows Native OneOCR (WinRT OCR)
- Windows 10/11 มาพร้อมกับระบบ OCR ความเร็วสูงระดับ Native (WinRT `Windows.Media.Ocr.OcrEngine`)
- ใน Python สามารถเรียกใช้ผ่านแพ็กเกจ `winrt-Windows.Media.Ocr` หรือ `winsdk`
- **จุดสำคัญที่แก้ไขจากแบบร่างเดิม:**
  1. `import oneocr` ไม่มีอยู่จริงใน Python PyPI มาตรฐาน ต้องใช้ `winrt.windows.media.ocr` หรือ `winsdk.windows.media.ocr` พร้อม Try-Except Fallback
  2. คำสั่ง `@app.on_event("startup")` ใน FastAPI เป็นรูปแบบ Deprecated แล้ว ต้องใช้ `app.state.one_ocr` ใน `create_app` หรือ `@asynccontextmanager lifespan` แทน
  3. Windows Media OCR ต้องการการแปลงภาพเป็น `SoftwareBitmap (BGRA8)` เพื่อความเข้ากันได้สูงสุด

### 2.2 โครงสร้างข้อมูลที่ส่งกลับ (Data Contract Matching SuperK)
ระบบจะแปลงผลลัพธ์ของ OneOCR ให้เข้ากับ Schema มาตรฐานของ SuperK:
```json
{
  "available": true,
  "count": 2,
  "regions": [
    {
      "text": "こんにちは",
      "confidence": 0.95,
      "box": [120, 450, 280, 620],
      "rect": {
        "x": 450,
        "y": 120,
        "width": 170,
        "height": 160
      }
    }
  ]
}
```
- `box`: `[ymin, xmin, ymax, xmax]` ในสเกล 0–1000 เพื่อความเข้ากันได้กับ Canvas Overlay และ Gemini Prompt Format
- `rect`: `{x, y, width, height}` ในพิกัดพิกเซลจริงของภาพต้นฉบับ

---

## 3. 🛠️ ขั้นตอนการติดตั้งและรันระบบ (Step-by-Step Execution Commands)

### ขั้นตอนที่ 1: ติดตั้งแพ็กเกจ WinRT OCR (Optional บน Windows)
```powershell
& "F:\Projects\manga-translator\ocr-service\venv\Scripts\python.exe" -m pip install winrt-Windows.Media.Ocr winrt-Windows.Graphics.Imaging winrt-Windows.Storage.Streams winrt-Windows.Globalization
```

### ขั้นตอนที่ 2: รัน Unit Test ตรวจสอบ OneOCR
```powershell
& "F:\Projects\manga-translator\ocr-service\venv\Scripts\python.exe" -m pytest "F:\Projects\manga-translator\ocr-service\tests\test_oneocr.py" -v
```

### ขั้นตอนที่ 3: ตรวจสอบสถานะการทำงานผ่าน Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8765/health" -Method Get
```
*ผลลัพธ์จะแสดง `"one_ocr_available": true/false` โดยไม่กระทบต่อระบบ Inpainting เดิม*

---

## 4. 📋 กฎเหล็กในโค้ดและวิธีแก้บั๊ก (Code Rules & Edge-case Handling)

1. **Zero-Crash Graceful Fallback:** ห้ามทำให้ Service พังหากเครื่องผู้ใช้ไม่ใช่ Windows หรือไม่ได้ติดตั้ง Language Pack ให้ตั้งค่า `self.available = False` และคืนค่าลิสต์ว่าง `[]` เสมอ
2. **BGR/RGBA Pixel Conversion:** WinRT SoftwareBitmap ต้องการภาพฟอร์แมต `BGRA8` เสมอ ห้ามส่ง Raw RGB โดยไม่แปลง Channel เพราะจะทำให้สีเพี้ยนและ OCR อ่านข้อความไม่ออก
3. **Async Non-blocking:** ฟังก์ชัน OCR ต้องเป็น `async` (`await engine.recognize_async(bitmap)`) เพื่อไม่ให้บล็อก Event Loop ของ FastAPI
4. **Coordinate Clamping:** พิกัด 0–1000 ต้องผ่านการ `min/max` ไม่ให้เกินขอบเขตภาพ

---

## 5. 🧪 ชุดคำสั่งทดสอบยืนยันผลลัพธ์ (Testing & Verification Checklist)

- [x] สร้างโมดูล `ocr-service/app/oneocr/engine.py` พร้อมระบบ Fallback
- [x] เชื่อมต่อ `app.state.one_ocr` และเปิด Endpoint `/v1/ocr/native` ใน `ocr-service/app/api.py`
- [x] ตรวจสอบ Unit Test ใน `ocr-service/tests/test_oneocr.py` ผ่าน 100%
- [x] ยืนยันว่า `/health` รายงานสถานะ `one_ocr_available` อย่างถูกต้อง
