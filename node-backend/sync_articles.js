const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const newArticles = [
  {
    id: 11,
    title: 'จัดโต๊ะคอม 2026: เคล็ดลับจัดสายไฟและทิศทางลม ให้เคสเย็นเฉียบ ฝุ่นไม่เกาะ',
    image_url: '/images/articles/article-11-pc-cable-management-airflow.jpg',
    created_at: '2026-08-15 10:00:00',
    content: 'ในยุคปี 2026 ที่ฮาร์ดแวร์คอมพิวเตอร์อย่าง CPU และ GPU รุ่นใหม่ ๆ ซดพลังงานระดับ 250W ถึง 450W ขึ้นไป ความร้อนสะสมในเคสไม่ได้เป็นแค่เรื่องของตัวเลขอุณหภูมิที่แสดงบนหน้าจออีกต่อไป แต่มันส่งผลโดยตรงต่อการ Boost สัญญาณนาฬิกา (Clock Speed) และความเสถียรของเฟรมเรตในระยะยาว หลายคนมักเข้าใจว่า "ยิ่งติดพัดลมเยอะ คอมยิ่งเย็น" แต่ในความเป็นจริง หากทิศทางการไหลเวียนของอากาศ (Airflow) และความดันอากาศในเคสถูกจัดวางอย่างผิดทิศ ต่อให้คุณยัดพัดลมเข้าไป 10 ตัว เคสของคุณก็อาจกลายเป็น "เตาอบลมร้อน" หรือ "เครื่องดูดฝุ่นประจำบ้าน" ได้โดยไม่รู้ตัว<br><br>หัวใจข้อแรกของการระบายความร้อนคือ <strong>ความดันอากาศบวก (Positive Air Pressure)</strong> หลักการง่าย ๆ คือการทำให้ "ปริมาณลมที่ดูดเข้า (Intake) มีมากกว่าปริมาณลมที่เป่าออก (Exhaust)" เมื่อลมเข้ามากกว่าลมออก อากาศส่วนเกินจะดันตัวออกตามช่องว่าง รอยต่อ และตะแกรงด้านหลังเคส ทำให้ฝุ่นละอองจากภายนอกไม่สามารถแทรกซึมเข้ามาได้ โดยมีข้อแม้ว่าพัดลมดูดเข้าทุกตัวต้องผ่าน <strong>แผ่นกรองฝุ่น (Dust Filter)</strong> เสมอ ตรงกันข้ามกับระบบ "ความดันอากาศลบ (Negative Pressure)" ที่ลมเป่าออกมากกว่าลมเข้า ซึ่งจะทำให้เคสทำตัวเหมือนเครื่องดูดฝุ่น ดึงเศษฝุ่นผ่านรอยต่อที่ไม่มีฟิลเตอร์เข้ามาจับตามซิงก์ระบายความร้อนจนหนาเป็นชั้นเค้ก<br><br>หัวใจข้อที่สองคือ <strong>ทิศทางการไหลของอากาศ (Airflow Path)</strong> กฎเหล็กของธรรมชาติคือ "อากาศร้อนจะลอยตัวขึ้นสู่ที่สูง" ดังนั้น การวางตำแหน่งมาตรฐานที่มีประสิทธิภาพสูงสุดสำหรับเคสยุคปัจจุบันคือ:<br><ul><li><strong>ด้านหน้าและด้านล่าง (Front & Bottom):</strong> ติดตั้งพัดลมแบบดูดลมเย็นเข้า (Intake) เพื่อส่งลมเย็นสดชื่นเข้าป้อนการ์ดจอและภาคจ่ายไฟเมนบอร์ดโดยตรง</li><li><strong>ด้านหลังและด้านบน (Rear & Top):</strong> ติดตั้งพัดลมเป่าลมร้อนออก (Exhaust) หรือใช้เป็นตำแหน่งติดตั้งหม้อน้ำชุดน้ำปิด (AIO Radiator) เพื่อดึงความร้อนออกจากเคสทันที ไม่ปล่อยให้วนเวียนอยู่ภายใน</li></ul><br>และที่ขาดไม่ได้เลยคือ <strong>การจัดสายไฟหลังเคส (Cable Management)</strong> สายไฟที่ระโยงระยางอยู่ฝั่งด้านหน้ากระจก ไม่เพียงแค่ดูไม่สบายตา แต่ยังขวางเส้นทางลมและดักจับฝุ่น การจัดสายไฟหลัก 24-Pin ATX และสายไฟเลี้ยงการ์ดจอ PCIe 12V-2x6 / 8-Pin ให้แนบชิดไปกับแผงร้อยสายไฟด้านหลัง (Grommets) จะช่วยให้อากาศหมุนเวียนไหลผ่านชิ้นส่วนได้อย่างราบรื่น อุณหภูมิการ์ดจอและซีพียูลดลงได้จริง 3–5°C แบบไม่ต้องเสียเงินเพิ่มแม้แต่บาทเดียวครับ'
  },
  {
    id: 12,
    title: 'เจาะลึก VRAM ปี 2026: การ์ดจอ 8GB ยังไหวไหม หรือ 16GB กลายเป็นมาตรฐานใหม่ไปแล้ว?',
    image_url: '/images/articles/article-12-vram-demands-2026.jpg',
    created_at: '2026-08-18 11:30:00',
    content: 'หนึ่งในคำถามยอดฮิตตลอดกาลของวงการจัดสเปกคอมพิวเตอร์คือ "เลือกการ์ดจอรุ่นไหนดี และ VRAM เท่าไหร่ถึงจะพอ?" ย้อนกลับไปเมื่อ 4-5 ปีก่อน การ์ดจอความจุ 8GB เคยเป็นระดับพรีเมียมที่รันได้ทุกเกมบนโลก แต่เมื่อก้าวเข้าสู่ปี 2026 โลกของเกมระดับ AAA ได้เปลี่ยนผ่านสู่ <strong>Unreal Engine 5</strong> เต็มตัว เทคโนโลยี Nanite และ Lumen รวมถึงพื้นผิวความละเอียดสูงระดับ 4K Textures ได้เปลี่ยนพฤติกรรมการบริโภคหน่วยความจำวิดีโอ (VRAM) ไปอย่างสิ้นเชิง ทำให้การ์ดจอ 8GB เริ่มเผชิญหน้ากับ "กำแพงคอขวด" อย่างหลีกเลี่ยงไม่ได้<br><br>สิ่งที่เกิดขึ้นเมื่อ VRAM ไม่พอ ไม่ใช่แค่ภาพกระตุกทั่วไป แต่คืออาการ <strong>Stuttering หรือเฟรมร่วงฮวบในเสี้ยววินาที (1% Low FPS ดิ่งเหว)</strong> เพราะเมื่อหน่วยความจำบนการ์ดจอเต็ม ระบบจะต้องสลับข้อมูลพื้นผิว (Texture Swap) ไปเก็บบน RAM ของเครื่องผ่านช่องทาง PCIe ซึ่งมีความเร็วแบนด์วิดท์ต่ำกว่า VRAM บนตัวการ์ดจอถึง 10-20 เท่า ผลลัพธ์ที่ตามมาคือ อาการ Texture โหลดไม่ทัน ภาพเบลอเป็นโคลน หรือเกมเด้งหลุด (Crash to Desktop) ในเกมยุคใหม่อย่าง Cyberpunk 2077 Phantom Liberty, Alan Wake 2 หรือ Black Myth: Wukong เมื่อเปิดใช้งาน Ray Tracing และความละเอียดระดับ 1440p (2K)<br><br><strong>สรุปเกณฑ์การเลือก VRAM ในปี 2026 ให้คุ้มเงินในกระเป๋าที่สุด:</strong><br><ul><li><strong>VRAM 8GB:</strong> ยังคงใช้งานได้ดีเยี่ยมสำหรับคนที่เล่นเกมระดับ 1080p (Full HD) สบายๆ เหมาะกับเกมแนว eSports (Valorant, CS2, Dota 2, Apex Legends) และเกมอินดี้ทั่วไป หรือผู้ที่ยอมปรับ Texture Quality ลงมาที่ Medium-High</li><li><strong>VRAM 12GB:</strong> จุดสมดุลสุดคุ้ม (Sweet Spot) สำหรับเกมเมอร์ระดับ 1440p ปรับกราฟิก High เปิด DLSS / FSR ได้สบายไร้อาการกระตุก รองรับเกมส่วนใหญ่ไปได้อีกอย่างน้อย 2-3 ปีข้างหน้า</li><li><strong>VRAM 16GB ขึ้นไป:</strong> มาตรฐานทองคำ (Gold Standard) สำหรับใครที่อยากเล่นเกมระดับ 1440p Ultra Settings, ลุยความละเอียดระดับ 4K, เปิด Ray Tracing เต็มสูบ หรือคนที่ต้องใช้คอมพิวเตอร์ทำงานด้าน 3D Rendering, ตัดต่อวิดีโอระดับมืออาชีพ และรันโมเดล AI ในเครื่องตัวเองครับ</li></ul>'
  },
  {
    id: 13,
    title: 'เคสคอมตู้ปลา (Panoramic Dual-Chamber): สวยสะกดตาหรือเตาอบความร้อน? วิธีจัดทิศทางลมที่ถูกต้อง',
    image_url: '/images/articles/article-13-panoramic-aquarium-pc-case.jpg',
    created_at: '2026-08-20 14:15:00',
    content: 'ปฏิเสธไม่ได้เลยว่า เทรนด์เคสคอมพิวเตอร์ที่มาแรงที่สุดแห่งยุคคือ <strong>เคสกระจกตู้ปลาไร้เสา (Panoramic Pillarless Case)</strong> ที่ออกแบบมาด้วยดีไซน์กระจกโค้งหรือกระจกสองด้านแบบ Seamless ไร้เสาคั่นกลาง ทำให้ผู้ใช้งานสามารถมองเห็นฮาร์ดแวร์ภายใน ไม่ว่าจะเป็นการ์ดจอแนวตั้ง แรม RGB หรือชุดน้ำระบบปิด ได้แบบพาโนรามา 270 องศาเต็มตา แต่ท่ามกลางความสวยสะดุดตา หลายคนมักมีคำถามในใจว่า "ด้านหน้าก็เป็นกระจก ด้านข้างก็เป็นกระจก แล้วลมเย็นจะเข้าจากทางไหน? เคสแบบนี้ร้อนจนเป็นเตาอบจริงหรือเปล่า?"<br><br>คำตอบคือ: <strong>ไม่จริงเสมอไป หากคุณเข้าใจสถาปัตยกรรมเคสแบบ Dual-Chamber (สองห้อง)!</strong> เคสตู้ปลาสมัยใหม่ไม่ได้ใช้โครงสร้างแบบเคสเดี่ยวเดิมๆ แต่แยกห้องเก็บ Power Supply, ฮาร์ดดิสก์ และสายไฟไว้ด้านหลัง (Rear Chamber) ทำให้ห้องหลักด้านหน้า (Main Chamber) มีพื้นที่โล่งโปร่ง ไม่มีแผง PSU Cover มาบดบังทิศทางลม สิ่งสำคัญคือการเลือกใช้ <strong>พัดลมใบย้อนกลับ (Reverse Blade Fans)</strong> เพื่อควบคุมทิศทางลมให้ถูกต้องตามหลักวิศวกรรม:<br><br><strong>สูตรการจัดพัดลมเคสตู้ปลาให้เย็นเฉียบ:</strong><br><ul><li><strong>พื้นเคสด้านล่าง (Bottom Intake):</strong> ติดตั้งพัดลม Reverse Blade 2-3 ตัว ดูดลมเย็นจากใต้โต๊ะเป่าขึ้นป้อนพัดลมการ์ดจอโดยตรง นี่คือไม้เด็ดที่ทำให้การ์ดจอในเคสตู้ปลาเย็นกว่าเคสธรรมดาด้วยซ้ำ!</li><li><strong>ผนังข้างเมนบอร์ด (Side Intake):</strong> ติดตั้งพัดลมดูดลมเข้าจากแผงด้านข้าง เพื่อสร้างกระแสลมเย็นหมุนเวียนป้อนเข้าสู่บริเวณภาคจ่ายไฟ VRM และ RAM</li><li><strong>เพดานเคสด้านบน (Top Exhaust):</strong> ติดตั้งหม้อน้ำระบายความร้อนด้วยน้ำ (AIO Radiator 360mm) เป่าลมร้อนขึ้นด้านบนตามธรรมชาติของอากาศร้อน</li><li><strong>แผงหลัง (Rear Exhaust):</strong> ติดตั้งพัดลมเป่าลมร้อนระบายออกท้ายเคส 1 ตัว</li></ul><br>ข้อผิดพลาดที่พบบ่อยที่สุดคือการติดตั้งพัดลมด้านข้างแบบเป่าออก (Exhaust) ร่วมกับด้านบน ทำให้เคสเกิดสุญญากาศลมร้อนและอุณหภูมิพุ่งสูง เพียงแค่คุณปรับพัดลมด้านล่างและด้านข้างเป็นตัวดูดเข้า เคสตู้ปลาของคุณก็จะกลายเป็นทั้งผลงานศิลปะบนโต๊ะคอม และเครื่องจักรเล่นเกมที่เย็นเงียบไร้กังวลครับ'
  },
  {
    id: 14,
    title: 'ซิลิโคนแบบดั้งเดิม vs แผ่นเปลี่ยนสถานะ PTM7950: หมดยุคซิลิโคนแห้งกรอบจริงหรือไม่?',
    image_url: '/images/articles/article-14-thermal-paste-vs-ptm7950.jpg',
    created_at: '2026-08-22 09:40:00',
    content: 'สำหรับนักประกอบคอมพิวเตอร์และช่างเทคนิค ขั้นตอนที่ต้องพิถีพิถันที่สุดขั้นตอนหนึ่งคือ "การทาซิลิโคนระบายความร้อน (Thermal Paste)" ไม่ว่าจะเป็นสูตรหยดเมล็ดถั่ว ทากากบาท หรือปาดเรียบด้วยไม้พาย แต่ปัญหาคลาสสิกที่ทุกคนต้องเจอหลังจากใช้งานไปสัก 6 เดือนถึง 1 ปี คือ <strong>อาการ Pump-Out Effect และซิลิโคนแห้งกรอบ</strong> ซึ่งเกิดจากการที่หน้าสัมผัสของกระดอง CPU และฐานทองแดงของฮีตซิงก์มีการขยายตัวและหดตัวสลับกันตามวงจรอุณหภูมิร้อน-เย็น จนดันเนื้อซิลิโคนเหลวให้ทะลักออกด้านข้าง เหลือจุดสัมผัสตรงกลางว่างเปล่า ส่งผลให้อุณหภูมิพุ่งสูงแตะ 95-100°C โดยไม่ทราบสาเหตุ<br><br>นี่คือเหตุผลที่ทำให้ <strong>Honeywell PTM7950 (Phase-Change Material หรือแผ่นเปลี่ยนสถานะ)</strong> ได้กลายเป็นดาวเด่นที่เข้ามาปฏิวัติวงการระบายความร้อนในปัจจุบัน PTM7950 ไม่ใช่ซิลิโคนเหลว แต่เป็นแผ่นโพลีเมอร์นำความร้อนบางเฉียบ เมื่ออยู่ที่อุณหภูมิห้อง มันจะมีสถานะเป็นของแข็งคล้ายฟิล์มยาง ทำให้ตัดแปะลงบนหน้าสัมผัสของชิปได้อย่างสมบูรณ์แบบโดยไม่ต้องเลอะมือ แต่เมื่อระบบเริ่มทำงานและอุณหภูมิแตะ <strong>45°C ขึ้นไป</strong> แผ่น PTM7950 จะ "เปลี่ยนสถานะกลายเป็นของเหลวกึ่งหนืด" แทรกซึมเข้าไปเติมเต็มร่องจุลภาคระดับไมครอนระหว่างฮีตซิงก์กับชิปซิลิคอนอย่างแนบสนิท<br><br><strong>ข้อเปรียบเทียบหมัดต่อหมัด:</strong><br><ul><li><strong>ประสิทธิภาพการนำความร้อน:</strong> ซิลิโคนเกรดท็อป (เช่น Arctic MX-6, Thermal Grizzly Kryonaut) ให้ผลลัพธ์สูสีกับ PTM7950 ในวันแรกที่ทา (ต่างกันไม่เกิน 1-2°C)</li><li><strong>ความทนทานและอายุการใช้งาน:</strong> ซิลิโคนแบบเหลวมักเริ่มเสื่อมสภาพและเกิด Pump-out ภายใน 6–12 เดือน แต่ PTM7950 มีคุณสมบัติคืนสถานะแข็งตัวเมื่อเครื่องดับ ทำให้ <strong>ไม่มีวันเกิด Pump-Out Effect</strong> และสามารถใช้งานยาวนาน 3–5 ปีโดยที่อุณหภูมิแทบไม่ดรอปเลยแม้แต่น้อย</li><li><strong>ความปลอดภัย:</strong> PTM7950 ไม่นำไฟฟ้า (Non-conductive) ปลอดภัย 100% ต่างจาก Liquid Metal (โลหะเหลว) ที่หากหยดลงบนเมนบอร์ดอาจทำให้ไฟฟ้าลัดวงจรเสียหายถาวร</li></ul><br>หากคุณเป็นคนชอบแกะเครื่องเปลี่ยนอะไหล่บ่อย ๆ ซิลิโคนแบบหลอดยังคงสะดวกและราคาประหยัดกว่า แต่ถ้าคุณต้องการ "ประกอบเสร็จ ปิดฝาเครื่อง แล้วใช้งานยาว ๆ 3-4 ปีโดยไม่ต้องกังวลเรื่องความร้อน" PTM7950 คือนวัตกรรมที่คุ้มค่าที่สุดในตอนนี้ครับ'
  },
  {
    id: 15,
    title: 'จัดสเปกคอมรัน AI บนเครื่องตัวเอง (Local AI): สเปกเท่าไหร่ถึงรัน LLM และสร้างภาพได้ลื่น?',
    image_url: '/images/articles/article-15-local-ai-pc-build-guide.jpg',
    created_at: '2026-08-25 16:00:00',
    content: 'ปี 2026 ถือเป็นยุคทองของ <strong>Local AI หรือการรันโมเดลปัญญาประดิษฐ์บนเครื่องส่วนตัว</strong> โดยไม่ต้องพึ่งพา Cloud API ไม่ต้องเสียค่าสมาชิกรายเดือน และไม่ต้องกังวลเรื่องข้อมูลส่วนบุคคลรั่วไหล โปรแกรมอย่าง Ollama, LM Studio, Text-Generation-WebUI สำหรับคุยกับโมเดลภาษา (LLM) เช่น Llama 3, DeepSeek, Mistral หรือเครื่องมือสร้างภาพ AI อย่าง ComfyUI และ Stable Diffusion / Flux ได้กลายเป็นซอฟต์แวร์สามัญประจำเครื่องของสายครีเอเตอร์และโปรแกรมเมอร์ แต่คำถามสำคัญคือ "ต้องจัดสเปกคอมพิวเตอร์ระดับไหน ถึงจะรัน AI เหล่านี้ได้แบบลื่นไหล ไม่ค้าง ไม่หน่วง?"<br><br>หัวใจอันดับหนึ่งของงาน AI ไม่ใช่ CPU แต่คือ <strong>การ์ดจอ (GPU) ที่รองรับ CUDA และปริมาณ VRAM</strong> เพราะน้ำหนักของโมเดล (Weights) ทั้งหมดจะต้องถูกโหลดขึ้นไปรอบนหน่วยความจำการ์ดจอ ยิ่งโมเดลมีขนาดใหญ่หรือความละเอียดสูงเท่าไร ก็ยิ่งต้องการ VRAM มหาศาล:<br><br><strong>1. สายรันโมเดลภาษา (Local LLMs - เช่น ตอบคำถาม, เขียนโค้ด, สรุปเอกสาร):</strong><br><ul><li><strong>โมเดล 7B - 8B พารามิเตอร์ (เช่น Llama-3-8B-Instruct 4-bit / Q4_K_M):</strong> ต้องการ VRAM ขั้นต่ำ <strong>8GB – 12GB</strong> สามารถตอบคำถามได้รวดเร็วระดับ 40-70 Tokens ต่อวินาทีบนการ์ดจออย่าง RTX 4060 Ti / RTX 4070</li><li><strong>โมเดล 14B - 32B พารามิเตอร์ (เช่น Qwen-2.5-14B, DeepSeek-Coder):</strong> ต้องการ VRAM ขั้นต่ำ <strong>16GB – 24GB</strong> แนะนำการ์ดจอระดับ RTX 4080 (16GB), RTX 3090 มือสอง (24GB) หรือ RTX 4090 (24GB) เพื่อให้รันในระดับความแม่นยำสูงได้แบบไม่สะดุด</li><li><strong>โมเดล 70B พารามิเตอร์:</strong> หากต้องการความฉลาดเทียบเท่า GPT-4 จำเป็นต้องใช้การ์ดจอ VRAM รวม 40GB+ (เช่น RTX 3090 สองตัวทำ Dual-GPU) หรือใช้ RAM ของเครื่องขั้นต่ำ 64GB-128GB ช่วยแบ่งเบา (Offload) ซึ่งความเร็วจะช้าลงตามแบนด์วิดท์ของระบบ</li></ul><br><strong>2. สายสร้างภาพและวิดีโอ (Generative Image / Video - Stable Diffusion, Flux, SDXL):</strong><br>โมเดลเจนเนอเรชันใหม่อย่าง Flux ต้องการ VRAM ไม่ต่ำกว่า <strong>12GB ถึง 16GB</strong> สำหรับการประมวลผล Text Encoder (T5) และ Transformer blocks หากใช้การ์ดจอต่ำกว่า 12GB จะต้องพึ่งพาโมเดลย่อย (NF4 Quantization) และใช้เวลานานขึ้นหลายเท่าตัว<br><br><strong>สเปกแนะนำสำหรับสายเริ่มต้นจัดเต็ม (งบ 45,000 - 65,000 บาท):</strong><br><ul><li><strong>CPU:</strong> AMD Ryzen 7 7700 หรือ Intel Core i7-14700 (8 คอร์ขึ้นไปเพื่อความเร็วในการโหลดข้อมูล)</li><li><strong>GPU:</strong> NVIDIA GeForce RTX 4070 Ti Super 16GB หรือ RTX 4070 Super 12GB (จำเป็นต้องเป็นค่ายเขียวเนื่องจาก CUDA Ecosystem เหนือกว่าค่ายอื่นในงาน AI แบบขาดลอย)</li><li><strong>RAM:</strong> 32GB หรือ 64GB DDR5 Bus 6000MHz (สำหรับการ Offload ข้อมูลและสลับโมเดล)</li><li><strong>Storage:</strong> 2TB NVMe PCIe Gen 4 SSD (ไฟล์ Checkpoints แต่ละโมเดลมีขนาด 5GB - 25GB พื้นที่ต้องกว้างและความเร็วอ่านต้องสูงเพื่อโหลดโมเดลเข้า VRAM ในไม่กี่วินาที)</li><li><strong>PSU:</strong> 850W 80 Plus Gold จ่ายไฟนิ่งเพื่อความเสถียรขณะรัน Tensor Cores 100% ต่อเนื่องเป็นเวลานาน</li></ul>'
  }
];

const existingImages = {
  1: '/images/articles/article-01-monitors-144hz-vs-240hz.jpg',
  2: '/images/articles/article-02-cpu-intel-vs-amd-2026.jpg',
  3: '/images/articles/article-03-used-gpu-guide.jpg',
  4: '/images/articles/article-04-psu-buying-guide.jpg',
  5: '/images/articles/article-05-prebuilt-vs-custom-pc.jpg',
  6: '/images/articles/article-06-budget-streamer-pc.jpg',
  7: '/images/articles/article-07-ddr5-vs-ddr4-ram.jpg',
  8: '/images/articles/article-08-pcie-gen5-ssd.jpg',
  9: '/images/articles/article-09-future-aio-liquid-cooling.jpg',
  10: '/images/articles/article-10-ultimate-4k-gaming-pc.jpg'
};

async function sync() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'smart_pc_builder'
  });

  console.log('Connected to MySQL!');

  // 1. Update existing articles 1-10
  for (const [id, img] of Object.entries(existingImages)) {
    await conn.query('UPDATE articles SET image_url = ? WHERE id = ?', [img, id]);
    console.log(`Updated article ${id} image_url to ${img}`);
  }

  // 2. Remove test articles (id 13, 14 or test titles)
  await conn.query('DELETE FROM articles WHERE id IN (13, 14) OR title LIKE "เทส%" OR title LIKE "test%"');
  console.log('Cleaned old test articles');

  // 3. Insert new articles 11-15
  for (const art of newArticles) {
    const [existing] = await conn.query('SELECT id FROM articles WHERE id = ? OR title = ?', [art.id, art.title]);
    if (existing.length > 0) {
      await conn.query('UPDATE articles SET title = ?, content = ?, image_url = ?, created_at = ? WHERE id = ?', [art.title, art.content, art.image_url, art.created_at, existing[0].id]);
      console.log(`Updated new article ${existing[0].id}: ${art.title}`);
    } else {
      await conn.query('INSERT INTO articles (id, title, content, image_url, created_at) VALUES (?, ?, ?, ?, ?)', [art.id, art.title, art.content, art.image_url, art.created_at]);
      console.log(`Inserted new article ${art.id}: ${art.title}`);
    }
  }

  // 4. Query all 15 articles ordered by id
  const [allRows] = await conn.query('SELECT id, title, content, image_url as image, created_at as date FROM articles ORDER BY id ASC');
  console.log(`Total articles in DB: ${allRows.length}`);

  const formattedArticles = allRows.map(r => ({
    id: r.id,
    title: r.title,
    content: r.content,
    image: r.image,
    date: r.date ? new Date(r.date).toISOString().slice(0, 10) : ''
  }));

  // Save to node-backend/articles.json
  const articlesJsonPath = path.join(__dirname, 'articles.json');
  fs.writeFileSync(articlesJsonPath, JSON.stringify(formattedArticles, null, 2), 'utf8');
  console.log(`Successfully synced ${formattedArticles.length} articles to articles.json!`);

  await conn.end();
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
