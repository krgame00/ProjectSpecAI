# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder.spec.js >> Builder Compatibility >> selecting RAM with mismatched type shows warning
- Location: e2e\builder.spec.js:69:3

# Error details

```
Error: locator.click: Error: strict mode violation: locator('.category-item').filter({ hasText: 'RAM' }) resolved to 2 elements:
    1) <li data-v-3580c684="" class="category-item active selected">…</li> aka getByRole('listitem').filter({ hasText: 'MotherboardGigabyte MAINBOARD' })
    2) <li data-v-3580c684="" class="category-item">…</li> aka getByRole('listitem').filter({ hasText: 'RAM—' })

Call log:
  - waiting for locator('.category-item').filter({ hasText: 'RAM' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6] [cursor=pointer]:
        - img "ForgeLabs Logo" [ref=e7]
        - generic [ref=e8]:
          - text: Forge
          - generic [ref=e9]: Labs
      - generic [ref=e10]:
        - button "💻 จัดสเปค" [ref=e11] [cursor=pointer]
        - button "📰 บทความ" [ref=e12] [cursor=pointer]
        - button "เข้าสู่ระบบ" [ref=e14] [cursor=pointer]
  - generic [ref=e15]:
    - generic [ref=e16]:
      - complementary [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: 💰
            - generic [ref=e21]: ยอดรวมทั้งสิ้น
          - generic [ref=e22]: ฿5,380
          - generic [ref=e23]: อัปเดตตามเวลาจริง (Real-time)
          - button "🛒 ดำเนินการสั่งซื้อ" [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: 🛒
            - generic [ref=e26]: ดำเนินการสั่งซื้อ
        - generic [ref=e27]:
          - img [ref=e29]
          - generic [ref=e31]:
            - strong [ref=e32]: "สถานะ: พบข้อขัดแย้งบางส่วน"
            - list [ref=e33]:
              - listitem [ref=e34]:
                - generic [ref=e35]: ❌
                - generic [ref=e36]: "CPU อาจไม่มีชิปกราฟิกในตัว: AMD Ryzen 5 8400F มักจำเป็นต้องใช้ร่วมกับการ์ดจอ (GPU) กรุณาตรวจสอบอีกครั้ง หรือเพิ่มการ์ดจอลงในสเปค"
              - listitem [ref=e37]:
                - generic [ref=e38]: ✅
                - generic [ref=e39]: Socket ตรงกัน
        - generic [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e42]: เลือกหมวดหมู่ฮาร์ดแวร์
            - generic [ref=e43]: 2/7
          - list [ref=e44]:
            - listitem [ref=e45] [cursor=pointer]:
              - generic [ref=e47]:
                - generic [ref=e48]:
                  - generic [ref=e49]: CPU
                  - img [ref=e51]
                - generic [ref=e53]:
                  - generic [ref=e54]: AMD Ryzen 5 8400F
                  - generic [ref=e55]: ฿3,990
                  - generic [ref=e56]:
                    - generic [ref=e57]:
                      - generic [ref=e58]: "Socket:"
                      - generic [ref=e59]: AM5
                    - generic [ref=e60]:
                      - generic [ref=e61]: "Cores:"
                      - generic [ref=e62]: "6"
                    - generic [ref=e63]:
                      - generic [ref=e64]: "Threads:"
                      - generic [ref=e65]: "12"
                    - generic [ref=e66]:
                      - generic [ref=e67]: "TDP:"
                      - generic [ref=e68]: 65W
                  - button "นำออก" [ref=e69]:
                    - img [ref=e70]
                    - text: นำออก
            - listitem [ref=e72] [cursor=pointer]:
              - generic [ref=e74]:
                - generic [ref=e75]:
                  - generic [ref=e76]: Motherboard
                  - img [ref=e78]
                - generic [ref=e80]:
                  - generic [ref=e81]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.2) (3Y)
                  - generic [ref=e82]: ฿1,390
                  - generic [ref=e83]:
                    - generic [ref=e84]:
                      - generic [ref=e85]: "Socket:"
                      - generic [ref=e86]: AM4
                    - generic [ref=e87]:
                      - generic [ref=e88]: "ฟอร์มแฟคเตอร์:"
                      - generic [ref=e89]: Micro-ATX
                    - generic [ref=e90]:
                      - generic [ref=e91]: "Max RAM:"
                      - generic [ref=e92]: 64GB
                  - button "นำออก" [ref=e93]:
                    - img [ref=e94]
                    - text: นำออก
            - listitem [ref=e96] [cursor=pointer]:
              - generic [ref=e99]:
                - generic [ref=e100]: RAM
                - generic [ref=e101]: —
            - listitem [ref=e102] [cursor=pointer]:
              - generic [ref=e105]:
                - generic [ref=e106]: GPU (VGA)
                - generic [ref=e107]: —
            - listitem [ref=e108] [cursor=pointer]:
              - generic [ref=e111]:
                - generic [ref=e112]: Storage (SSD)
                - generic [ref=e113]: —
            - listitem [ref=e114] [cursor=pointer]:
              - generic [ref=e117]:
                - generic [ref=e118]: Power Supply
                - generic [ref=e119]: —
            - listitem [ref=e120] [cursor=pointer]:
              - generic [ref=e123]:
                - generic [ref=e124]: Case
                - generic [ref=e125]: —
      - main [ref=e126]:
        - generic [ref=e127]:
          - generic [ref=e128]:
            - generic [ref=e129]:
              - generic [ref=e131]: 🔧
              - generic [ref=e132]:
                - heading "Motherboard" [level=2] [ref=e133]
                - paragraph [ref=e134]: 71 ชิ้น
            - generic [ref=e136]: "?"
          - generic [ref=e137]:
            - generic [ref=e138]:
              - img [ref=e139]
              - textbox "ค้นหา Motherboard..." [ref=e142]
            - generic [ref=e143]:
              - combobox [ref=e144] [cursor=pointer]:
                - option "เรียงตามความนิยม" [selected]
                - 'option "ราคา: ต่ำไปสูง"'
                - 'option "ราคา: สูงไปต่ำ"'
              - generic:
                - img
          - generic [ref=e145]:
            - generic [ref=e146] [cursor=pointer]:
              - generic "คลิกเพื่อยกเลิกการเลือก" [ref=e147]:
                - img [ref=e148]
              - button "ดูรายละเอียดสเปค" [ref=e150]:
                - img [ref=e151]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.2) (3Y)" [ref=e156]
              - generic [ref=e157]:
                - generic [ref=e158]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.2) (3Y)
                - generic [ref=e159]:
                  - generic [ref=e160]: "Socket: AM4"
                  - generic [ref=e161]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e162]: "Max RAM: 64GB"
              - generic [ref=e163]:
                - generic [ref=e164]: ฿1,390
                - button [active] [ref=e165]:
                  - img [ref=e166]
            - generic [ref=e168] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e169]:
                - img [ref=e170]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO A620AM-B EVO (3Y)" [ref=e175]
              - generic [ref=e176]:
                - generic [ref=e177]: MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO A620AM-B EVO (3Y)
                - generic [ref=e178]:
                  - generic [ref=e179]: "Socket: AM5"
                  - generic [ref=e180]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e181]: "Max RAM: 128GB"
              - generic [ref=e182]:
                - generic [ref=e183]: ฿1,990
                - button [ref=e184]:
                  - img [ref=e185]
            - generic [ref=e187] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e188]:
                - img [ref=e189]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM4) MSI A520M-A-PRO (3Y)" [ref=e194]
              - generic [ref=e195]:
                - generic [ref=e196]: MSI MAINBOARD (เมนบอร์ด)(AM4) MSI A520M-A-PRO (3Y)
                - generic [ref=e197]:
                  - generic [ref=e198]: "Socket: AM4"
                  - generic [ref=e199]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e200]: "Max RAM: 64GB"
              - generic [ref=e201]:
                - generic [ref=e202]: ฿1,390
                - button [ref=e203]:
                  - img [ref=e204]
            - generic [ref=e206] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e207]:
                - img [ref=e208]
              - img "ASUS MAINBOARD (เมนบอร์ด)(AM5) ASUS PRIME A620M-K-CSM (3Y)" [ref=e213]
              - generic [ref=e214]:
                - generic [ref=e215]: ASUS MAINBOARD (เมนบอร์ด)(AM5) ASUS PRIME A620M-K-CSM (3Y)
                - generic [ref=e216]:
                  - generic [ref=e217]: "Socket: AM5"
                  - generic [ref=e218]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e219]: "Max RAM: 96GB"
              - generic [ref=e220]:
                - generic [ref=e221]: ฿2,290
                - button [ref=e222]:
                  - img [ref=e223]
            - generic [ref=e225] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e226]:
                - img [ref=e227]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M H DDR4 (REV.1.0) (3Y)" [ref=e232]
              - generic [ref=e233]:
                - generic [ref=e234]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M H DDR4 (REV.1.0) (3Y)
                - generic [ref=e235]:
                  - generic [ref=e236]: "Socket: LGA 1700"
                  - generic [ref=e237]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e238]: "Max RAM: 64GB"
              - generic [ref=e239]:
                - generic [ref=e240]: ฿2,290
                - button [ref=e241]:
                  - img [ref=e242]
            - generic [ref=e244] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e245]:
                - img [ref=e246]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM5) GIGABYTE A620M H (REV.2.2) (3Y)" [ref=e251]
              - generic [ref=e252]:
                - generic [ref=e253]: Gigabyte MAINBOARD (เมนบอร์ด)(AM5) GIGABYTE A620M H (REV.2.2) (3Y)
                - generic [ref=e254]:
                  - generic [ref=e255]: "Socket: AM5"
                  - generic [ref=e256]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e257]: "Max RAM: 128GB"
              - generic [ref=e258]:
                - generic [ref=e259]: ฿1,990
                - button [ref=e260]:
                  - img [ref=e261]
            - generic [ref=e263] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e264]:
                - img [ref=e265]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK A520M-HVS (3Y)" [ref=e270]
              - generic [ref=e271]:
                - generic [ref=e272]: ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK A520M-HVS (3Y)
                - generic [ref=e273]:
                  - generic [ref=e274]: "Socket: AM4"
                  - generic [ref=e275]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e276]: "Max RAM: 64GB"
              - generic [ref=e277]:
                - generic [ref=e278]: ฿1,390
                - button [ref=e279]:
                  - img [ref=e280]
            - generic [ref=e282] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e283]:
                - img [ref=e284]
              - img "ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK H610M-H2/M.2-D5 (3Y)" [ref=e289]
              - generic [ref=e290]:
                - generic [ref=e291]: ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK H610M-H2/M.2-D5 (3Y)
                - generic [ref=e292]:
                  - generic [ref=e293]: "Socket: LGA 1700"
                  - generic [ref=e294]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e295]: "Max RAM: 96GB"
              - generic [ref=e296]:
                - generic [ref=e297]: ฿1,890
                - button [ref=e298]:
                  - img [ref=e299]
            - generic [ref=e301] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e302]:
                - img [ref=e303]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE H810M K (REV 1.0) (3Y)" [ref=e308]
              - generic [ref=e309]:
                - generic [ref=e310]: Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE H810M K (REV 1.0) (3Y)
                - generic [ref=e311]:
                  - generic [ref=e312]: "Socket: LGA 1851"
                  - generic [ref=e313]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e314]: "Max RAM: 128GB"
              - generic [ref=e315]:
                - generic [ref=e316]: ฿2,290
                - button [ref=e317]:
                  - img [ref=e318]
            - generic [ref=e320] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e321]:
                - img [ref=e322]
              - img "MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-E DDR5 (3Y)" [ref=e327]
              - generic [ref=e328]:
                - generic [ref=e329]: MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-E DDR5 (3Y)
                - generic [ref=e330]:
                  - generic [ref=e331]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e332]: "Max RAM: 128 GB"
              - generic [ref=e333]:
                - generic [ref=e334]: ฿2,190
                - button [ref=e335]:
                  - img [ref=e336]
            - generic [ref=e338] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e339]:
                - img [ref=e340]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.1) (3Y)" [ref=e345]
              - generic [ref=e346]:
                - generic [ref=e347]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.1) (3Y)
                - generic [ref=e348]:
                  - generic [ref=e349]: "Socket: AM4"
                  - generic [ref=e350]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e351]: "Max RAM: 64GB"
              - generic [ref=e352]:
                - generic [ref=e353]: ฿1,390
                - button [ref=e354]:
                  - img [ref=e355]
            - generic [ref=e357] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e358]:
                - img [ref=e359]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM5) ASROCK A620AM-HVS (3Y)" [ref=e364]
              - generic [ref=e365]:
                - generic [ref=e366]: ASRock MAINBOARD (เมนบอร์ด)(AM5) ASROCK A620AM-HVS (3Y)
                - generic [ref=e367]:
                  - generic [ref=e368]: "Socket: AM5"
                  - generic [ref=e369]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e370]: "Max RAM: 128GB"
              - generic [ref=e371]:
                - generic [ref=e372]: ฿1,990
                - button [ref=e373]:
                  - img [ref=e374]
            - generic [ref=e376] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e377]:
                - img [ref=e378]
              - img "MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO H610M-S DDR4 (3Y)" [ref=e383]
              - generic [ref=e384]:
                - generic [ref=e385]: MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO H610M-S DDR4 (3Y)
                - generic [ref=e386]:
                  - generic [ref=e387]: "Socket: LGA 1700"
                  - generic [ref=e388]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e389]: "Max RAM: 64GB"
              - generic [ref=e390]:
                - generic [ref=e391]: ฿1,590
                - button [ref=e392]:
                  - img [ref=e393]
            - generic [ref=e395] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e396]:
                - img [ref=e397]
              - img "ASUS MAINBOARD (เมนบอร์ด)(AM4) ASUS PRIME A520M-K (3Y)" [ref=e402]
              - generic [ref=e403]:
                - generic [ref=e404]: ASUS MAINBOARD (เมนบอร์ด)(AM4) ASUS PRIME A520M-K (3Y)
                - generic [ref=e405]:
                  - generic [ref=e406]: "Socket: AM4"
                  - generic [ref=e407]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e408]: "Max RAM: 64GB"
              - generic [ref=e409]:
                - generic [ref=e410]: ฿1,490
                - button [ref=e411]:
                  - img [ref=e412]
            - generic [ref=e414] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e415]:
                - img [ref=e416]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K DDR4 (REV.2.0) (3Y)" [ref=e421]
              - generic [ref=e422]:
                - generic [ref=e423]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K DDR4 (REV.2.0) (3Y)
                - generic [ref=e424]:
                  - generic [ref=e425]: "Socket: LGA 1700"
                  - generic [ref=e426]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e427]: "Max RAM: 64GB"
              - generic [ref=e428]:
                - generic [ref=e429]: ฿1,690
                - button [ref=e430]:
                  - img [ref=e431]
            - generic [ref=e433] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e434]:
                - img [ref=e435]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-E D4-CSM DDR4 (3Y)" [ref=e440]
              - generic [ref=e441]:
                - generic [ref=e442]: ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-E D4-CSM DDR4 (3Y)
                - generic [ref=e443]:
                  - generic [ref=e444]: "Socket: LGA 1700"
                  - generic [ref=e445]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e446]: "Max RAM: 64GB"
              - generic [ref=e447]:
                - generic [ref=e448]: ฿2,090
                - button [ref=e449]:
                  - img [ref=e450]
            - generic [ref=e452] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e453]:
                - img [ref=e454]
              - img "ASUS MAINBOARD (เมนบอร์ด)(AM4) ASUS PRIME A520M-K/CSM (3Y)" [ref=e459]
              - generic [ref=e460]:
                - generic [ref=e461]: ASUS MAINBOARD (เมนบอร์ด)(AM4) ASUS PRIME A520M-K/CSM (3Y)
                - generic [ref=e462]:
                  - generic [ref=e463]: "Socket: AM4"
                  - generic [ref=e464]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e465]: "Max RAM: 64GB"
              - generic [ref=e466]:
                - generic [ref=e467]: ฿1,490
                - button [ref=e468]:
                  - img [ref=e469]
            - generic [ref=e471] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e472]:
                - img [ref=e473]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M H ARGB (REV.1.0) (3Y)" [ref=e478]
              - generic [ref=e479]:
                - generic [ref=e480]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M H ARGB (REV.1.0) (3Y)
                - generic [ref=e481]:
                  - generic [ref=e482]: "Socket: AM4"
                  - generic [ref=e483]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e484]: "Max RAM: 64GB"
              - generic [ref=e485]:
                - generic [ref=e486]: ฿1,690
                - button [ref=e487]:
                  - img [ref=e488]
            - generic [ref=e490] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e491]:
                - img [ref=e492]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-K DDR5 (3Y)" [ref=e497]
              - generic [ref=e498]:
                - generic [ref=e499]: ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-K DDR5 (3Y)
                - generic [ref=e500]:
                  - generic [ref=e501]: "Socket: LGA 1700"
                  - generic [ref=e502]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e503]: "Max RAM: 96GB"
              - generic [ref=e504]:
                - generic [ref=e505]: ฿1,890
                - button [ref=e506]:
                  - img [ref=e507]
            - generic [ref=e509] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e510]:
                - img [ref=e511]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-CS D4 (3Y)" [ref=e516]
              - generic [ref=e517]:
                - generic [ref=e518]: ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-CS D4 (3Y)
                - generic [ref=e519]:
                  - generic [ref=e520]: "Socket: LGA 1700"
                  - generic [ref=e521]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e522]: "Max RAM: 64GB"
              - generic [ref=e523]:
                - generic [ref=e524]: ฿1,790
                - button [ref=e525]:
                  - img [ref=e526]
            - generic [ref=e528] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e529]:
                - img [ref=e530]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K V2 DDR5 (REV.1.0) (3Y)" [ref=e535]
              - generic [ref=e536]:
                - generic [ref=e537]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K V2 DDR5 (REV.1.0) (3Y)
                - generic [ref=e538]:
                  - generic [ref=e539]: "Socket: LGA 1700"
                  - generic [ref=e540]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e541]: "Max RAM: 128GB"
              - generic [ref=e542]:
                - generic [ref=e543]: ฿1,890
                - button [ref=e544]:
                  - img [ref=e545]
            - generic [ref=e547] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e548]:
                - img [ref=e549]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK B550M-HDV" [ref=e554]
              - generic [ref=e555]:
                - generic [ref=e556]: ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK B550M-HDV
                - generic [ref=e557]:
                  - generic [ref=e558]: "Socket: AM4"
                  - generic [ref=e559]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e560]: "Max RAM: 64GB"
              - generic [ref=e561]:
                - generic [ref=e562]: ฿2,190
                - button [ref=e563]:
                  - img [ref=e564]
            - generic [ref=e566] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e567]:
                - img [ref=e568]
              - img "ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK H610M-H2/M.2-D4 (3Y)" [ref=e573]
              - generic [ref=e574]:
                - generic [ref=e575]: ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK H610M-H2/M.2-D4 (3Y)
                - generic [ref=e576]:
                  - generic [ref=e577]: "Socket: LGA 1700"
                  - generic [ref=e578]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e579]: "Max RAM: 64GB"
              - generic [ref=e580]:
                - generic [ref=e581]: ฿1,690
                - button [ref=e582]:
                  - img [ref=e583]
            - generic [ref=e585] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e586]:
                - img [ref=e587]
              - img "Colorful MAINBOARD (เมนบอร์ด)(1700) COLORFUL H610M-D V20A DDR4 (3Y)" [ref=e592]
              - generic [ref=e593]:
                - generic [ref=e594]: Colorful MAINBOARD (เมนบอร์ด)(1700) COLORFUL H610M-D V20A DDR4 (3Y)
                - generic [ref=e595]:
                  - generic [ref=e596]: "Socket: LGA 1700"
                  - generic [ref=e597]: "ฟอร์มแฟคเตอร์: M-ATX"
                  - generic [ref=e598]: "Max RAM: 64GB"
              - generic [ref=e599]:
                - generic [ref=e600]: ฿1,550
                - button [ref=e601]:
                  - img [ref=e602]
            - generic [ref=e604] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e605]:
                - img [ref=e606]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE H810M K (REV 1.0) (3Y)" [ref=e611]
              - generic [ref=e612]:
                - generic [ref=e613]: Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE H810M K (REV 1.0) (3Y)
                - generic [ref=e614]:
                  - generic [ref=e615]: "Socket: LGA 1851"
                  - generic [ref=e616]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e617]: "Max RAM: 128GB"
              - generic [ref=e618]:
                - generic [ref=e619]: ฿2,290
                - button [ref=e620]:
                  - img [ref=e621]
            - generic [ref=e623] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e624]:
                - img [ref=e625]
              - img "MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-E DDR5 (3Y)" [ref=e630]
              - generic [ref=e631]:
                - generic [ref=e632]: MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-E DDR5 (3Y)
                - generic [ref=e633]:
                  - generic [ref=e634]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e635]: "Max RAM: 128 GB"
              - generic [ref=e636]:
                - generic [ref=e637]: ฿2,190
                - button [ref=e638]:
                  - img [ref=e639]
            - generic [ref=e641] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e642]:
                - img [ref=e643]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-E D4-CSM DDR4 (3Y)" [ref=e648]
              - generic [ref=e649]:
                - generic [ref=e650]: ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-E D4-CSM DDR4 (3Y)
                - generic [ref=e651]:
                  - generic [ref=e652]: "Socket: LGA 1700"
                  - generic [ref=e653]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e654]: "Max RAM: 64GB"
              - generic [ref=e655]:
                - generic [ref=e656]: ฿2,090
                - button [ref=e657]:
                  - img [ref=e658]
            - generic [ref=e660] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e661]:
                - img [ref=e662]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M GAMING X DDR5 (REV.1.0) (3Y)" [ref=e667]
              - generic [ref=e668]:
                - generic [ref=e669]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M GAMING X DDR5 (REV.1.0) (3Y)
                - generic [ref=e670]:
                  - generic [ref=e671]: "Socket: LGA 1700"
                  - generic [ref=e672]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e673]: "Max RAM: 256GB"
              - generic [ref=e674]:
                - generic [ref=e675]: ฿3,490
                - button [ref=e676]:
                  - img [ref=e677]
            - generic [ref=e679] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e680]:
                - img [ref=e681]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M D3HP DDR4 (REV.1.0) (3Y)" [ref=e686]
              - generic [ref=e687]:
                - generic [ref=e688]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M D3HP DDR4 (REV.1.0) (3Y)
                - generic [ref=e689]:
                  - generic [ref=e690]: "Socket: LGA 1700"
                  - generic [ref=e691]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e692]: "Max RAM: 128GB"
              - generic [ref=e693]:
                - generic [ref=e694]: ฿2,490
                - button [ref=e695]:
                  - img [ref=e696]
            - generic [ref=e698] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e699]:
                - img [ref=e700]
              - img "Colorful MAINBOARD (เมนบอร์ด)(1700) COLORFUL H610M-D V20A DDR4 (3Y)" [ref=e705]
              - generic [ref=e706]:
                - generic [ref=e707]: Colorful MAINBOARD (เมนบอร์ด)(1700) COLORFUL H610M-D V20A DDR4 (3Y)
                - generic [ref=e708]:
                  - generic [ref=e709]: "Socket: LGA 1700"
                  - generic [ref=e710]: "ฟอร์มแฟคเตอร์: M-ATX"
                  - generic [ref=e711]: "Max RAM: 64GB"
              - generic [ref=e712]:
                - generic [ref=e713]: ฿1,550
                - button [ref=e714]:
                  - img [ref=e715]
            - generic [ref=e717] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e718]:
                - img [ref=e719]
              - img "MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO H610M-S DDR4 (3Y)" [ref=e724]
              - generic [ref=e725]:
                - generic [ref=e726]: MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO H610M-S DDR4 (3Y)
                - generic [ref=e727]:
                  - generic [ref=e728]: "Socket: LGA 1700"
                  - generic [ref=e729]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e730]: "Max RAM: 64GB"
              - generic [ref=e731]:
                - generic [ref=e732]: ฿1,590
                - button [ref=e733]:
                  - img [ref=e734]
            - generic [ref=e736] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e737]:
                - img [ref=e738]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1851) ASUS PRIME B860M-K-CSM (3Y)" [ref=e743]
              - generic [ref=e744]:
                - generic [ref=e745]: ASUS MAINBOARD (เมนบอร์ด)(1851) ASUS PRIME B860M-K-CSM (3Y)
                - generic [ref=e746]:
                  - generic [ref=e747]: "Socket: LGA 1851"
                  - generic [ref=e748]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e749]: "Max RAM: 128GB"
              - generic [ref=e750]:
                - generic [ref=e751]: ฿3,390
                - button [ref=e752]:
                  - img [ref=e753]
            - generic [ref=e755] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e756]:
                - img [ref=e757]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K V2 DDR5 (REV.1.0) (3Y)" [ref=e762]
              - generic [ref=e763]:
                - generic [ref=e764]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K V2 DDR5 (REV.1.0) (3Y)
                - generic [ref=e765]:
                  - generic [ref=e766]: "Socket: LGA 1700"
                  - generic [ref=e767]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e768]: "Max RAM: 128GB"
              - generic [ref=e769]:
                - generic [ref=e770]: ฿1,890
                - button [ref=e771]:
                  - img [ref=e772]
            - generic [ref=e774] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e775]:
                - img [ref=e776]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE B860M D3HP (REV.1.0) (3Y)" [ref=e781]
              - generic [ref=e782]:
                - generic [ref=e783]: Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE B860M D3HP (REV.1.0) (3Y)
                - generic [ref=e784]:
                  - generic [ref=e785]: "Socket: LGA 1851"
                  - generic [ref=e786]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e787]: "Max RAM: 256GB"
              - generic [ref=e788]:
                - generic [ref=e789]: ฿3,290
                - button [ref=e790]:
                  - img [ref=e791]
            - generic [ref=e793] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e794]:
                - img [ref=e795]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M H ARGB (REV.1.0) (3Y)" [ref=e800]
              - generic [ref=e801]:
                - generic [ref=e802]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M H ARGB (REV.1.0) (3Y)
                - generic [ref=e803]:
                  - generic [ref=e804]: "Socket: AM4"
                  - generic [ref=e805]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e806]: "Max RAM: 64GB"
              - generic [ref=e807]:
                - generic [ref=e808]: ฿1,690
                - button [ref=e809]:
                  - img [ref=e810]
            - generic [ref=e812] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e813]:
                - img [ref=e814]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO B850M-G (3Y)" [ref=e819]
              - generic [ref=e820]:
                - generic [ref=e821]: MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO B850M-G (3Y)
                - generic [ref=e822]:
                  - generic [ref=e823]: "Socket: AM5"
                  - generic [ref=e824]: "ฟอร์มแฟคเตอร์: M-ATX"
                  - generic [ref=e825]: "Max RAM: 128GB"
              - generic [ref=e826]:
                - generic [ref=e827]: ฿3,190
                - button [ref=e828]:
                  - img [ref=e829]
            - generic [ref=e831] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e832]:
                - img [ref=e833]
              - img "MSI MAINBOARD (เมนบอร์ด)(1851) MSI PRO H810M-B WIFI6E (3Y)" [ref=e838]
              - generic [ref=e839]:
                - generic [ref=e840]: MSI MAINBOARD (เมนบอร์ด)(1851) MSI PRO H810M-B WIFI6E (3Y)
                - generic [ref=e841]:
                  - generic [ref=e842]: "Socket: LGA 1851"
                  - generic [ref=e843]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e844]: "Max RAM: 128GB"
              - generic [ref=e845]:
                - generic [ref=e846]: ฿2,590
                - button [ref=e847]:
                  - img [ref=e848]
            - generic [ref=e850] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e851]:
                - img [ref=e852]
              - img "ASUS MAINBOARD (เมนบอร์ด) (1700) ASUS PRIME B760M-A" [ref=e857]
              - generic [ref=e858]:
                - generic [ref=e859]: ASUS MAINBOARD (เมนบอร์ด) (1700) ASUS PRIME B760M-A
                - generic [ref=e860]:
                  - generic [ref=e861]: "Socket: LGA 1700"
                  - generic [ref=e862]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e863]: "Max RAM: 128GB"
              - generic [ref=e864]:
                - generic [ref=e865]: ฿2,690
                - button [ref=e866]:
                  - img [ref=e867]
            - generic [ref=e869] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e870]:
                - img [ref=e871]
              - img "ASRock MAINBOARD (เมนบอร์ด) (1700) ASROCK B760M PG LIGHTNING DDR4 (3Y)" [ref=e876]
              - generic [ref=e877]:
                - generic [ref=e878]: ASRock MAINBOARD (เมนบอร์ด) (1700) ASROCK B760M PG LIGHTNING DDR4 (3Y)
                - generic [ref=e879]:
                  - generic [ref=e880]: "Socket: LGA 1700"
                  - generic [ref=e881]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e882]: "Max RAM: 128GB"
              - generic [ref=e883]:
                - generic [ref=e884]: ฿2,490
                - button [ref=e885]:
                  - img [ref=e886]
            - generic [ref=e888] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e889]:
                - img [ref=e890]
              - img "MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-P DDR4 (3Y)" [ref=e895]
              - generic [ref=e896]:
                - generic [ref=e897]: MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-P DDR4 (3Y)
                - generic [ref=e898]:
                  - generic [ref=e899]: "Socket: LGA 1700"
                  - generic [ref=e900]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e901]: "Max RAM: 128GB"
              - generic [ref=e902]:
                - generic [ref=e903]: ฿2,390
                - button [ref=e904]:
                  - img [ref=e905]
            - generic [ref=e907] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e908]:
                - img [ref=e909]
              - img "ASUS MAINBOARD (เมนบอร์ด)(AM5) ASUS PRIME A620M-K-CSM (3Y)" [ref=e914]
              - generic [ref=e915]:
                - generic [ref=e916]: ASUS MAINBOARD (เมนบอร์ด)(AM5) ASUS PRIME A620M-K-CSM (3Y)
                - generic [ref=e917]:
                  - generic [ref=e918]: "Socket: AM5"
                  - generic [ref=e919]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e920]: "Max RAM: 96GB"
              - generic [ref=e921]:
                - generic [ref=e922]: ฿2,290
                - button [ref=e923]:
                  - img [ref=e924]
            - generic [ref=e926] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e927]:
                - img [ref=e928]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE B550M H ARGB (REV. 1.0) (3Y)" [ref=e933]
              - generic [ref=e934]:
                - generic [ref=e935]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE B550M H ARGB (REV. 1.0) (3Y)
                - generic [ref=e936]:
                  - generic [ref=e937]: "Socket: AM4"
                  - generic [ref=e938]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e939]: "Max RAM: 64GB"
              - generic [ref=e940]:
                - generic [ref=e941]: ฿2,390
                - button [ref=e942]:
                  - img [ref=e943]
            - generic [ref=e945] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e946]:
                - img [ref=e947]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.2) (3Y)" [ref=e952]
              - generic [ref=e953]:
                - generic [ref=e954]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.2) (3Y)
                - generic [ref=e955]:
                  - generic [ref=e956]: "Socket: AM4"
                  - generic [ref=e957]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e958]: "Max RAM: 64GB"
              - generic [ref=e959]:
                - generic [ref=e960]: ฿1,390
                - button [ref=e961]:
                  - img [ref=e962]
            - generic [ref=e964] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e965]:
                - img [ref=e966]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM5) ASROCK A620AM-HVS (3Y)" [ref=e971]
              - generic [ref=e972]:
                - generic [ref=e973]: ASRock MAINBOARD (เมนบอร์ด)(AM5) ASROCK A620AM-HVS (3Y)
                - generic [ref=e974]:
                  - generic [ref=e975]: "Socket: AM5"
                  - generic [ref=e976]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e977]: "Max RAM: 128GB"
              - generic [ref=e978]:
                - generic [ref=e979]: ฿1,990
                - button [ref=e980]:
                  - img [ref=e981]
            - generic [ref=e983] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e984]:
                - img [ref=e985]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE B860M D3HP (REV.1.1) (3Y)" [ref=e990]
              - generic [ref=e991]:
                - generic [ref=e992]: Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE B860M D3HP (REV.1.1) (3Y)
                - generic [ref=e993]:
                  - generic [ref=e994]: "Socket: LGA 1851"
                  - generic [ref=e995]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e996]: "Max RAM: 256GB"
              - generic [ref=e997]:
                - generic [ref=e998]: ฿3,290
                - button [ref=e999]:
                  - img [ref=e1000]
            - generic [ref=e1002] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1003]:
                - img [ref=e1004]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM5) ASROCK B650M PG LIGHTNING DDR5 (3Y)" [ref=e1009]
              - generic [ref=e1010]:
                - generic [ref=e1011]: ASRock MAINBOARD (เมนบอร์ด)(AM5) ASROCK B650M PG LIGHTNING DDR5 (3Y)
                - generic [ref=e1012]:
                  - generic [ref=e1013]: "Socket: AM5"
                  - generic [ref=e1014]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1015]: "Max RAM: 256GB"
              - generic [ref=e1016]:
                - generic [ref=e1017]: ฿2,990
                - button [ref=e1018]:
                  - img [ref=e1019]
            - generic [ref=e1021] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1022]:
                - img [ref=e1023]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M H DDR4 (REV.1.0) (3Y)" [ref=e1028]
              - generic [ref=e1029]:
                - generic [ref=e1030]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M H DDR4 (REV.1.0) (3Y)
                - generic [ref=e1031]:
                  - generic [ref=e1032]: "Socket: LGA 1700"
                  - generic [ref=e1033]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1034]: "Max RAM: 64GB"
              - generic [ref=e1035]:
                - generic [ref=e1036]: ฿2,290
                - button [ref=e1037]:
                  - img [ref=e1038]
            - generic [ref=e1040] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1041]:
                - img [ref=e1042]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO A620AM-B EVO (3Y)" [ref=e1047]
              - generic [ref=e1048]:
                - generic [ref=e1049]: MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO A620AM-B EVO (3Y)
                - generic [ref=e1050]:
                  - generic [ref=e1051]: "Socket: AM5"
                  - generic [ref=e1052]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1053]: "Max RAM: 128GB"
              - generic [ref=e1054]:
                - generic [ref=e1055]: ฿1,990
                - button [ref=e1056]:
                  - img [ref=e1057]
            - generic [ref=e1059] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1060]:
                - img [ref=e1061]
              - img "ASUS MAINBOARD (เมนบอร์ด)(AM4) ASUS PRIME A520M-K (3Y)" [ref=e1066]
              - generic [ref=e1067]:
                - generic [ref=e1068]: ASUS MAINBOARD (เมนบอร์ด)(AM4) ASUS PRIME A520M-K (3Y)
                - generic [ref=e1069]:
                  - generic [ref=e1070]: "Socket: AM4"
                  - generic [ref=e1071]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1072]: "Max RAM: 64GB"
              - generic [ref=e1073]:
                - generic [ref=e1074]: ฿1,490
                - button [ref=e1075]:
                  - img [ref=e1076]
            - generic [ref=e1078] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1079]:
                - img [ref=e1080]
              - img "ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK B760M PRO RS DDR5 (3Y)" [ref=e1085]
              - generic [ref=e1086]:
                - generic [ref=e1087]: ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK B760M PRO RS DDR5 (3Y)
                - generic [ref=e1088]:
                  - generic [ref=e1089]: "Socket: LGA 1700"
                  - generic [ref=e1090]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1091]: "Max RAM: 192GB"
              - generic [ref=e1092]:
                - generic [ref=e1093]: ฿3,490
                - button [ref=e1094]:
                  - img [ref=e1095]
            - generic [ref=e1097] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1098]:
                - img [ref=e1099]
              - img "ASUS MAINBOARD (เมนบอร์ด)(AM5) ASUS PRIME B650M A II (3Y)" [ref=e1104]
              - generic [ref=e1105]:
                - generic [ref=e1106]: ASUS MAINBOARD (เมนบอร์ด)(AM5) ASUS PRIME B650M A II (3Y)
                - generic [ref=e1107]:
                  - generic [ref=e1108]: "Socket: AM5"
                  - generic [ref=e1109]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1110]: "Max RAM: 192GB"
              - generic [ref=e1111]:
                - generic [ref=e1112]: ฿2,990
                - button [ref=e1113]:
                  - img [ref=e1114]
            - generic [ref=e1116] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1117]:
                - img [ref=e1118]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM5) GIGABYTE B650M D3HP" [ref=e1123]
              - generic [ref=e1124]:
                - generic [ref=e1125]: Gigabyte MAINBOARD (เมนบอร์ด)(AM5) GIGABYTE B650M D3HP
                - generic [ref=e1126]:
                  - generic [ref=e1127]: "Socket: AM5"
                  - generic [ref=e1128]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1129]: "Max RAM: 192GB"
              - generic [ref=e1130]:
                - generic [ref=e1131]: ฿2,990
                - button [ref=e1132]:
                  - img [ref=e1133]
            - generic [ref=e1135] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1136]:
                - img [ref=e1137]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE H810M GAMING WIFI6 (REV 1.0) (3Y)" [ref=e1142]
              - generic [ref=e1143]:
                - generic [ref=e1144]: Gigabyte MAINBOARD (เมนบอร์ด)(1851) GIGABYTE H810M GAMING WIFI6 (REV 1.0) (3Y)
                - generic [ref=e1145]:
                  - generic [ref=e1146]: "Socket: LGA 1851"
                  - generic [ref=e1147]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1148]: "Max RAM: 128GB"
              - generic [ref=e1149]:
                - generic [ref=e1150]: ฿2,990
                - button [ref=e1151]:
                  - img [ref=e1152]
            - generic [ref=e1154] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1155]:
                - img [ref=e1156]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK B550M PHANTOM GAMING 4 (3Y)" [ref=e1161]
              - generic [ref=e1162]:
                - generic [ref=e1163]: ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK B550M PHANTOM GAMING 4 (3Y)
                - generic [ref=e1164]:
                  - generic [ref=e1165]: "Socket: AM4"
                  - generic [ref=e1166]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1167]: "Max RAM: 128GB"
              - generic [ref=e1168]:
                - generic [ref=e1169]: ฿2,490
                - button [ref=e1170]:
                  - img [ref=e1171]
            - generic [ref=e1173] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1174]:
                - img [ref=e1175]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M D3HP DDR5 (REV.1.0) (3Y)" [ref=e1180]
              - generic [ref=e1181]:
                - generic [ref=e1182]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE B760M D3HP DDR5 (REV.1.0) (3Y)
                - generic [ref=e1183]:
                  - generic [ref=e1184]: "Socket: LGA 1700"
                  - generic [ref=e1185]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1186]: "Max RAM: 256GB"
              - generic [ref=e1187]:
                - generic [ref=e1188]: ฿2,690
                - button [ref=e1189]:
                  - img [ref=e1190]
            - generic [ref=e1192] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1193]:
                - img [ref=e1194]
              - img "Colorful MAINBOARD (เมนบอร์ด)(1700) COLORFUL BATTLE-AX B760M-T WIFI V21A DDR4 (3Y)" [ref=e1199]
              - generic [ref=e1200]:
                - generic [ref=e1201]: Colorful MAINBOARD (เมนบอร์ด)(1700) COLORFUL BATTLE-AX B760M-T WIFI V21A DDR4 (3Y)
                - generic [ref=e1202]:
                  - generic [ref=e1203]: "Socket: LGA 1700"
                  - generic [ref=e1204]: "ฟอร์มแฟคเตอร์: M-ATX"
                  - generic [ref=e1205]: "Max RAM: 64GB"
              - generic [ref=e1206]:
                - generic [ref=e1207]: ฿2,690
                - button [ref=e1208]:
                  - img [ref=e1209]
            - generic [ref=e1211] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1212]:
                - img [ref=e1213]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K DDR4 (REV.2.0) (3Y)" [ref=e1218]
              - generic [ref=e1219]:
                - generic [ref=e1220]: Gigabyte MAINBOARD (เมนบอร์ด)(1700) GIGABYTE H610M K DDR4 (REV.2.0) (3Y)
                - generic [ref=e1221]:
                  - generic [ref=e1222]: "Socket: LGA 1700"
                  - generic [ref=e1223]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1224]: "Max RAM: 64GB"
              - generic [ref=e1225]:
                - generic [ref=e1226]: ฿1,690
                - button [ref=e1227]:
                  - img [ref=e1228]
            - generic [ref=e1230] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1231]:
                - img [ref=e1232]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-K DDR5 (3Y)" [ref=e1237]
              - generic [ref=e1238]:
                - generic [ref=e1239]: ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-K DDR5 (3Y)
                - generic [ref=e1240]:
                  - generic [ref=e1241]: "Socket: LGA 1700"
                  - generic [ref=e1242]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1243]: "Max RAM: 96GB"
              - generic [ref=e1244]:
                - generic [ref=e1245]: ฿1,890
                - button [ref=e1246]:
                  - img [ref=e1247]
            - generic [ref=e1249] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1250]:
                - img [ref=e1251]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM5) MSI B650M GAMING WIFI (3Y)" [ref=e1256]
              - generic [ref=e1257]:
                - generic [ref=e1258]: MSI MAINBOARD (เมนบอร์ด)(AM5) MSI B650M GAMING WIFI (3Y)
                - generic [ref=e1259]:
                  - generic [ref=e1260]: "Socket: AM5"
                  - generic [ref=e1261]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1262]: "Max RAM: 128GB"
              - generic [ref=e1263]:
                - generic [ref=e1264]: ฿3,190
                - button [ref=e1265]:
                  - img [ref=e1266]
            - generic [ref=e1268] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1269]:
                - img [ref=e1270]
              - img "MSI MAINBOARD (เมนบอร์ด)(1851) MSI PRO H810M-C EX (3Y)" [ref=e1275]
              - generic [ref=e1276]:
                - generic [ref=e1277]: MSI MAINBOARD (เมนบอร์ด)(1851) MSI PRO H810M-C EX (3Y)
                - generic [ref=e1278]:
                  - generic [ref=e1279]: "Socket: LGA 1851"
                  - generic [ref=e1280]: "ฟอร์มแฟคเตอร์: M-ATX"
                  - generic [ref=e1281]: "Max RAM: 128GB"
              - generic [ref=e1282]:
                - generic [ref=e1283]: ฿2,290
                - button [ref=e1284]:
                  - img [ref=e1285]
            - generic [ref=e1287] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1288]:
                - img [ref=e1289]
              - img "MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-P DDR5 (3Y)" [ref=e1294]
              - generic [ref=e1295]:
                - generic [ref=e1296]: MSI MAINBOARD (เมนบอร์ด)(1700) MSI PRO B760M-P DDR5 (3Y)
                - generic [ref=e1297]:
                  - generic [ref=e1298]: "Socket: LGA 1700"
                  - generic [ref=e1299]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1300]: "Max RAM: 192GB"
              - generic [ref=e1301]:
                - generic [ref=e1302]: ฿2,390
                - button [ref=e1303]:
                  - img [ref=e1304]
            - generic [ref=e1306] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1307]:
                - img [ref=e1308]
              - img "ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK B760M PG LIGHTNING DDR5" [ref=e1313]
              - generic [ref=e1314]:
                - generic [ref=e1315]: ASRock MAINBOARD (เมนบอร์ด)(1700) ASROCK B760M PG LIGHTNING DDR5
                - generic [ref=e1316]:
                  - generic [ref=e1317]: "Socket: LGA 1700"
                  - generic [ref=e1318]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1319]: "Max RAM: 192GB"
              - generic [ref=e1320]:
                - generic [ref=e1321]: ฿2,590
                - button [ref=e1322]:
                  - img [ref=e1323]
            - generic [ref=e1325] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1326]:
                - img [ref=e1327]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-CS D4 (3Y)" [ref=e1332]
              - generic [ref=e1333]:
                - generic [ref=e1334]: ASUS MAINBOARD (เมนบอร์ด)(1700) ASUS PRIME H610M-CS D4 (3Y)
                - generic [ref=e1335]:
                  - generic [ref=e1336]: "Socket: LGA 1700"
                  - generic [ref=e1337]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1338]: "Max RAM: 64GB"
              - generic [ref=e1339]:
                - generic [ref=e1340]: ฿1,790
                - button [ref=e1341]:
                  - img [ref=e1342]
            - generic [ref=e1344] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1345]:
                - img [ref=e1346]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM4) MSI A520M-A-PRO (3Y)" [ref=e1351]
              - generic [ref=e1352]:
                - generic [ref=e1353]: MSI MAINBOARD (เมนบอร์ด)(AM4) MSI A520M-A-PRO (3Y)
                - generic [ref=e1354]:
                  - generic [ref=e1355]: "Socket: AM4"
                  - generic [ref=e1356]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1357]: "Max RAM: 64GB"
              - generic [ref=e1358]:
                - generic [ref=e1359]: ฿1,390
                - button [ref=e1360]:
                  - img [ref=e1361]
            - generic [ref=e1363] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1364]:
                - img [ref=e1365]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1851) ASUS H810M-A-WIFI-CSM (3Y)" [ref=e1370]
              - generic [ref=e1371]:
                - generic [ref=e1372]: ASUS MAINBOARD (เมนบอร์ด)(1851) ASUS H810M-A-WIFI-CSM (3Y)
                - generic [ref=e1373]:
                  - generic [ref=e1374]: "Socket: LGA 1851"
                  - generic [ref=e1375]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1376]: "Max RAM: 128GB"
              - generic [ref=e1377]:
                - generic [ref=e1378]: ฿2,890
                - button [ref=e1379]:
                  - img [ref=e1380]
            - generic [ref=e1382] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1383]:
                - img [ref=e1384]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK B550M-HDV" [ref=e1389]
              - generic [ref=e1390]:
                - generic [ref=e1391]: ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK B550M-HDV
                - generic [ref=e1392]:
                  - generic [ref=e1393]: "Socket: AM4"
                  - generic [ref=e1394]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1395]: "Max RAM: 64GB"
              - generic [ref=e1396]:
                - generic [ref=e1397]: ฿2,190
                - button [ref=e1398]:
                  - img [ref=e1399]
            - generic [ref=e1401] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1402]:
                - img [ref=e1403]
              - img "ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK A520M-HVS (3Y)" [ref=e1408]
              - generic [ref=e1409]:
                - generic [ref=e1410]: ASRock MAINBOARD (เมนบอร์ด)(AM4) ASROCK A520M-HVS (3Y)
                - generic [ref=e1411]:
                  - generic [ref=e1412]: "Socket: AM4"
                  - generic [ref=e1413]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1414]: "Max RAM: 64GB"
              - generic [ref=e1415]:
                - generic [ref=e1416]: ฿1,390
                - button [ref=e1417]:
                  - img [ref=e1418]
            - generic [ref=e1420] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1421]:
                - img [ref=e1422]
              - img "MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO B650M-B" [ref=e1427]
              - generic [ref=e1428]:
                - generic [ref=e1429]: MSI MAINBOARD (เมนบอร์ด)(AM5) MSI PRO B650M-B
                - generic [ref=e1430]:
                  - generic [ref=e1431]: "Socket: AM5"
                  - generic [ref=e1432]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1433]: "Max RAM: 128GB"
              - generic [ref=e1434]:
                - generic [ref=e1435]: ฿2,490
                - button [ref=e1436]:
                  - img [ref=e1437]
            - generic [ref=e1439] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1440]:
                - img [ref=e1441]
              - img "ASUS MAINBOARD (เมนบอร์ด)(1851) ASUS H810M-A-CSM (3Y)" [ref=e1446]
              - generic [ref=e1447]:
                - generic [ref=e1448]: ASUS MAINBOARD (เมนบอร์ด)(1851) ASUS H810M-A-CSM (3Y)
                - generic [ref=e1449]:
                  - generic [ref=e1450]: "Socket: LGA 1851"
                  - generic [ref=e1451]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1452]: "Max RAM: 128GB"
              - generic [ref=e1453]:
                - generic [ref=e1454]: ฿2,490
                - button [ref=e1455]:
                  - img [ref=e1456]
            - generic [ref=e1458] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1459]:
                - img [ref=e1460]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM5) GIGABYTE A620M H (REV.2.2) (3Y)" [ref=e1465]
              - generic [ref=e1466]:
                - generic [ref=e1467]: Gigabyte MAINBOARD (เมนบอร์ด)(AM5) GIGABYTE A620M H (REV.2.2) (3Y)
                - generic [ref=e1468]:
                  - generic [ref=e1469]: "Socket: AM5"
                  - generic [ref=e1470]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1471]: "Max RAM: 128GB"
              - generic [ref=e1472]:
                - generic [ref=e1473]: ฿1,990
                - button [ref=e1474]:
                  - img [ref=e1475]
            - generic [ref=e1477] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e1478]:
                - img [ref=e1479]
              - img "Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.1) (3Y)" [ref=e1484]
              - generic [ref=e1485]:
                - generic [ref=e1486]: Gigabyte MAINBOARD (เมนบอร์ด)(AM4) GIGABYTE A520M K V2 (REV.1.1) (3Y)
                - generic [ref=e1487]:
                  - generic [ref=e1488]: "Socket: AM4"
                  - generic [ref=e1489]: "ฟอร์มแฟคเตอร์: Micro-ATX"
                  - generic [ref=e1490]: "Max RAM: 64GB"
              - generic [ref=e1491]:
                - generic [ref=e1492]: ฿1,390
                - button [ref=e1493]:
                  - img [ref=e1494]
    - generic:
      - button "เปิดแชตบอต SpecAI" [ref=e1496] [cursor=pointer]:
        - img [ref=e1499]
      - generic:
        - generic:
          - generic:
            - generic:
              - generic: 🤖
            - generic:
              - generic: SpecAI
              - generic: ออนไลน์ · พร้อมช่วยเหลือ
          - button:
            - img
        - generic:
          - generic:
            - generic: 🤖
            - generic:
              - generic: สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI ผู้ช่วยส่วนตัวของคุณ ต้องการให้ผมจัดสเปคคอมพิวเตอร์แบบไหนครับ?
        - generic:
          - generic:
            - generic:
              - button "📎"
              - textbox "พิมพ์เป้าหมาย เช่น เน้นเล่นเกม..."
              - button:
                - img
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Builder Compatibility', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('/build');
  7   |     await expect(page.locator('.category-list-wrap')).toBeVisible({ timeout: 15000 });
  8   |   });
  9   | 
  10  |   test('displays product grid when clicking a category', async ({ page }) => {
  11  |     const cpuCategory = page.locator('.category-item', { hasText: 'CPU' });
  12  |     await cpuCategory.click();
  13  | 
  14  |     await expect(page.locator('.product-grid')).toBeVisible({ timeout: 10000 });
  15  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  16  |   });
  17  | 
  18  |   test('selecting matching CPU and Mobo shows compatibility pass', async ({ page }) => {
  19  |     // Select CPU category and choose first AMD CPU (AM5 socket)
  20  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  21  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  22  | 
  23  |     // Pick first CPU (should be AMD Ryzen with AM5 socket)
  24  |     await page.locator('.product-card .add-btn').first().click();
  25  |     await expect(page.locator('.product-card.selected')).toBeVisible();
  26  | 
  27  |     // Select Mobo category
  28  |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  29  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  30  | 
  31  |     // The first mobo (ASROCK B550M Pro4) also has AM5 socket => should show pass
  32  |     await page.locator('.product-card .add-btn').first().click();
  33  | 
  34  |     // Check for compatibility success alert
  35  |     await expect(page.locator('.alert-box.alert-success')).toBeVisible({ timeout: 5000 });
  36  |     await expect(page.locator('.alert-text strong')).toHaveText('เข้ากันได้ 100%');
  37  |   });
  38  | 
  39  |   test('selecting mismatched CPU and Mobo shows compatibility warning', async ({ page }) => {
  40  |     // Select CPU, pick Intel LGA1700 CPU
  41  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  42  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  43  | 
  44  |     const cpuCards = page.locator('.product-card');
  45  |     const cpuCount = await cpuCards.count();
  46  | 
  47  |     let selectedIntel = false;
  48  |     for (let i = 0; i < cpuCount; i++) {
  49  |       const name = await cpuCards.nth(i).locator('.product-name').textContent();
  50  |       if (name && name.includes('Intel')) {
  51  |         await cpuCards.nth(i).locator('.add-btn').click();
  52  |         selectedIntel = true;
  53  |         break;
  54  |       }
  55  |     }
  56  |     expect(selectedIntel).toBe(true);
  57  | 
  58  |     // Select Mobo and pick one with AM5 (first one is AM5)
  59  |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  60  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  61  |     await page.locator('.product-card .add-btn').first().click();
  62  | 
  63  |     // Socket mismatch warning should appear
  64  |     await expect(page.locator('.alert-box.alert-danger')).toBeVisible({ timeout: 5000 });
  65  |     await expect(page.locator('.mixed-report-list li.issue')).toBeVisible();
  66  |     await expect(page.locator('.mixed-report-list li.issue').first()).toContainText('ซ็อกเก็ตไม่ตรง');
  67  |   });
  68  | 
  69  |   test('selecting RAM with mismatched type shows warning', async ({ page }) => {
  70  |     // Pick an AMD CPU
  71  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  72  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  73  |     await page.locator('.product-card .add-btn').first().click();
  74  | 
  75  |     // Pick an AM5 mobo (first one, which is DDR5)
  76  |     await page.locator('.category-item', { hasText: 'Motherboard' }).click();
  77  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  78  |     await page.locator('.product-card .add-btn').first().click();
  79  | 
  80  |     // Pick a DDR4 RAM (first RAM is DDR4)
> 81  |     await page.locator('.category-item', { hasText: 'RAM' }).click();
      |                                                              ^ Error: locator.click: Error: strict mode violation: locator('.category-item').filter({ hasText: 'RAM' }) resolved to 2 elements:
  82  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  83  |     await page.locator('.product-card .add-btn').first().click();
  84  | 
  85  |     // Mobo is DDR5 but RAM is DDR4 => warning
  86  |     await expect(page.locator('.alert-box.alert-danger')).toBeVisible({ timeout: 5000 });
  87  |     await expect(page.locator('.mixed-report-list li.issue')).toContainText('ประเภท RAM ไม่ตรง');
  88  |   });
  89  | 
  90  |   test('total price updates as components are selected', async ({ page }) => {
  91  |     await expect(page.locator('.total-price-box')).toBeVisible();
  92  | 
  93  |     await page.locator('.category-item', { hasText: 'CPU' }).click();
  94  |     await expect(page.locator('.product-card').first()).toBeVisible({ timeout: 10000 });
  95  |     await page.locator('.product-card .add-btn').first().click();
  96  | 
  97  |     const priceText = await page.locator('.total-value').textContent();
  98  |     const priceNum = parseInt(priceText.replace(/[^0-9]/g, ''));
  99  |     expect(priceNum).toBeGreaterThan(0);
  100 |   });
  101 | 
  102 | });
  103 | 
```