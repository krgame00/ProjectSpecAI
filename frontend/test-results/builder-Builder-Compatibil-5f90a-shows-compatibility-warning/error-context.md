# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: builder.spec.js >> Builder Compatibility >> selecting mismatched CPU and Mobo shows compatibility warning
- Location: e2e\builder.spec.js:39:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
          - generic [ref=e22]: ฿0
          - generic [ref=e23]: อัปเดตตามเวลาจริง (Real-time)
          - button "🛒 ดำเนินการสั่งซื้อ" [disabled] [ref=e24]:
            - generic [ref=e25]: 🛒
            - generic [ref=e26]: ดำเนินการสั่งซื้อ
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: เลือกหมวดหมู่ฮาร์ดแวร์
            - generic [ref=e30]: 0/7
          - list [ref=e31]:
            - listitem [ref=e32] [cursor=pointer]:
              - generic [ref=e35]:
                - generic [ref=e36]: CPU
                - generic [ref=e37]: —
            - listitem [ref=e38] [cursor=pointer]:
              - generic [ref=e41]:
                - generic [ref=e42]: Motherboard
                - generic [ref=e43]: —
            - listitem [ref=e44] [cursor=pointer]:
              - generic [ref=e47]:
                - generic [ref=e48]: RAM
                - generic [ref=e49]: —
            - listitem [ref=e50] [cursor=pointer]:
              - generic [ref=e53]:
                - generic [ref=e54]: GPU (VGA)
                - generic [ref=e55]: —
            - listitem [ref=e56] [cursor=pointer]:
              - generic [ref=e59]:
                - generic [ref=e60]: Storage (SSD)
                - generic [ref=e61]: —
            - listitem [ref=e62] [cursor=pointer]:
              - generic [ref=e65]:
                - generic [ref=e66]: Power Supply
                - generic [ref=e67]: —
            - listitem [ref=e68] [cursor=pointer]:
              - generic [ref=e71]:
                - generic [ref=e72]: Case
                - generic [ref=e73]: —
      - main [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e79]: 🧠
              - generic [ref=e80]:
                - heading "CPU" [level=2] [ref=e81]
                - paragraph [ref=e82]: 36 ชิ้น
            - generic [ref=e84]: "?"
          - generic [ref=e85]:
            - generic [ref=e86]:
              - img [ref=e87]
              - textbox "ค้นหา CPU..." [ref=e90]
            - generic [ref=e91]:
              - combobox [ref=e92] [cursor=pointer]:
                - option "เรียงตามความนิยม" [selected]
                - 'option "ราคา: ต่ำไปสูง"'
                - 'option "ราคา: สูงไปต่ำ"'
              - generic:
                - img
          - generic [ref=e93]:
            - generic [ref=e94] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e95]:
                - img [ref=e96]
              - img "AMD Ryzen 5 8400F" [ref=e101]
              - generic [ref=e102]:
                - generic [ref=e103]: AMD Ryzen 5 8400F
                - generic [ref=e104]:
                  - generic [ref=e105]: "Socket: AM5"
                  - generic [ref=e106]: "Cores: 6"
                  - generic [ref=e107]: "Threads: 12"
                  - generic [ref=e108]: "TDP: 65W"
              - generic [ref=e109]:
                - generic [ref=e110]: ฿3,990
                - button [ref=e111]:
                  - img [ref=e112]
            - generic [ref=e114] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e115]:
                - img [ref=e116]
              - img "INTEL CORE i3 14100" [ref=e121]
              - generic [ref=e122]:
                - generic [ref=e123]: INTEL CORE i3 14100
                - generic [ref=e124]:
                  - generic [ref=e125]: "Socket: LGA 1700"
                  - generic [ref=e126]: "Cores: 4"
                  - generic [ref=e127]: "Threads: 8"
                  - generic [ref=e128]: "TDP: 60W"
              - generic [ref=e129]:
                - generic [ref=e130]: ฿4,990
                - button [ref=e131]:
                  - img [ref=e132]
            - generic [ref=e134] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e135]:
                - img [ref=e136]
              - img "AMD Ryzen 5 5500GT" [ref=e141]
              - generic [ref=e142]:
                - generic [ref=e143]: AMD Ryzen 5 5500GT
                - generic [ref=e144]:
                  - generic [ref=e145]: "Socket: AM4"
                  - generic [ref=e146]: "Cores: 6"
                  - generic [ref=e147]: "Threads: 12"
                  - generic [ref=e148]: "TDP: 65W"
              - generic [ref=e149]:
                - generic [ref=e150]: ฿4,290
                - button [ref=e151]:
                  - img [ref=e152]
            - generic [ref=e154] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e155]:
                - img [ref=e156]
              - img "INTEL CORE i5 14400F" [ref=e161]
              - generic [ref=e162]:
                - generic [ref=e163]: INTEL CORE i5 14400F
                - generic [ref=e164]:
                  - generic [ref=e165]: "Socket: LGA 1700"
                  - generic [ref=e166]: "Cores: 10 (6P+4E)"
                  - generic [ref=e167]: "Threads: 16"
                  - generic [ref=e168]: "TDP: 65W"
              - generic [ref=e169]:
                - generic [ref=e170]: ฿5,790
                - button [ref=e171]:
                  - img [ref=e172]
            - generic [ref=e174] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e175]:
                - img [ref=e176]
              - img "INTEL ULTRA 5 225" [ref=e181]
              - generic [ref=e182]:
                - generic [ref=e183]: INTEL ULTRA 5 225
                - generic [ref=e184]:
                  - generic [ref=e185]: "Socket: LGA 1851"
                  - generic [ref=e186]: "Cores: 10 (6P+4E)"
                  - generic [ref=e187]: "Threads: 10"
                  - generic [ref=e188]: "TDP: 65W"
              - generic [ref=e189]:
                - generic [ref=e190]: ฿5,990
                - button [ref=e191]:
                  - img [ref=e192]
            - generic [ref=e194] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e195]:
                - img [ref=e196]
              - img "AMD Ryzen 7 9850X3D" [ref=e201]
              - generic [ref=e202]:
                - generic [ref=e203]: AMD Ryzen 7 9850X3D
                - generic [ref=e204]:
                  - generic [ref=e205]: "Socket: AM5"
                  - generic [ref=e206]: "Cores: 8"
                  - generic [ref=e207]: "Threads: 16"
                  - generic [ref=e208]: "TDP: 120W"
              - generic [ref=e209]:
                - generic [ref=e210]: ฿19,590
                - button [ref=e211]:
                  - img [ref=e212]
            - generic [ref=e214] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e215]:
                - img [ref=e216]
              - img "AMD Ryzen 5 7500F" [ref=e221]
              - generic [ref=e222]:
                - generic [ref=e223]: AMD Ryzen 5 7500F
                - generic [ref=e224]:
                  - generic [ref=e225]: "Socket: AM5"
                  - generic [ref=e226]: "Cores: 6"
                  - generic [ref=e227]: "Threads: 12"
                  - generic [ref=e228]: "TDP: 65W"
              - generic [ref=e229]:
                - generic [ref=e230]: ฿5,490
                - button [ref=e231]:
                  - img [ref=e232]
            - generic [ref=e234] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e235]:
                - img [ref=e236]
              - img "AMD Ryzen 7 9800X3D" [ref=e241]
              - generic [ref=e242]:
                - generic [ref=e243]: AMD Ryzen 7 9800X3D
                - generic [ref=e244]:
                  - generic [ref=e245]: "Socket: AM5"
                  - generic [ref=e246]: "Cores: 8"
                  - generic [ref=e247]: "Threads: 16"
                  - generic [ref=e248]: "TDP: 120W"
              - generic [ref=e249]:
                - generic [ref=e250]: ฿17,990
                - button [ref=e251]:
                  - img [ref=e252]
            - generic [ref=e254] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e255]:
                - img [ref=e256]
              - img "AMD RYZEN THREADRIPPER PRO 7995WX" [ref=e261]
              - generic [ref=e262]:
                - generic [ref=e263]: AMD RYZEN THREADRIPPER PRO 7995WX
                - generic [ref=e264]:
                  - generic [ref=e265]: "Socket: sTR5"
                  - generic [ref=e266]: "Cores: 96"
                  - generic [ref=e267]: "Threads: 192"
                  - generic [ref=e268]: "TDP: 350W"
              - generic [ref=e269]:
                - generic [ref=e270]: ฿419,990
                - button [ref=e271]:
                  - img [ref=e272]
            - generic [ref=e274] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e275]:
                - img [ref=e276]
              - img "INTEL ULTRA 5 225F" [ref=e281]
              - generic [ref=e282]:
                - generic [ref=e283]: INTEL ULTRA 5 225F
                - generic [ref=e284]:
                  - generic [ref=e285]: "Socket: LGA 1851"
                  - generic [ref=e286]: "Cores: 10 (6P+4E)"
                  - generic [ref=e287]: "Threads: 10"
                  - generic [ref=e288]: "TDP: 65W"
              - generic [ref=e289]:
                - generic [ref=e290]: ฿4,990
                - button [ref=e291]:
                  - img [ref=e292]
            - generic [ref=e294] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e295]:
                - img [ref=e296]
              - img "INTEL CORE i5 12400F" [ref=e301]
              - generic [ref=e302]:
                - generic [ref=e303]: INTEL CORE i5 12400F
                - generic [ref=e304]:
                  - generic [ref=e305]: "Socket: LGA 1700"
                  - generic [ref=e306]: "Cores: 6 (6P)"
                  - generic [ref=e307]: "Threads: 12"
                  - generic [ref=e308]: "TDP: 65W"
              - generic [ref=e309]:
                - generic [ref=e310]: ฿4,790
                - button [ref=e311]:
                  - img [ref=e312]
            - generic [ref=e314] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e315]:
                - img [ref=e316]
              - img "AMD Ryzen 7 5800XT" [ref=e321]
              - generic [ref=e322]:
                - generic [ref=e323]: AMD Ryzen 7 5800XT
                - generic [ref=e324]:
                  - generic [ref=e325]: "Socket: AM4"
                  - generic [ref=e326]: "Cores: 8"
                  - generic [ref=e327]: "Threads: 16"
                  - generic [ref=e328]: "TDP: 105W"
              - generic [ref=e329]:
                - generic [ref=e330]: ฿7,990
                - button [ref=e331]:
                  - img [ref=e332]
            - generic [ref=e334] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e335]:
                - img [ref=e336]
              - img "AMD Ryzen 5 5600" [ref=e341]
              - generic [ref=e342]:
                - generic [ref=e343]: AMD Ryzen 5 5600
                - generic [ref=e344]:
                  - generic [ref=e345]: "Socket: AM4"
                  - generic [ref=e346]: "Cores: 6"
                  - generic [ref=e347]: "Threads: 12"
                  - generic [ref=e348]: "TDP: 65W"
              - generic [ref=e349]:
                - generic [ref=e350]: ฿4,390
                - button [ref=e351]:
                  - img [ref=e352]
            - generic [ref=e354] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e355]:
                - img [ref=e356]
              - img "AMD Ryzen 5 5500" [ref=e361]
              - generic [ref=e362]:
                - generic [ref=e363]: AMD Ryzen 5 5500
                - generic [ref=e364]:
                  - generic [ref=e365]: "Socket: AM4"
                  - generic [ref=e366]: "Cores: 6"
                  - generic [ref=e367]: "Threads: 12"
                  - generic [ref=e368]: "TDP: 65W"
              - generic [ref=e369]:
                - generic [ref=e370]: ฿3,190
                - button [ref=e371]:
                  - img [ref=e372]
            - generic [ref=e374] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e375]:
                - img [ref=e376]
              - img "AMD Ryzen 5 9600X" [ref=e381]
              - generic [ref=e382]:
                - generic [ref=e383]: AMD Ryzen 5 9600X
                - generic [ref=e384]:
                  - generic [ref=e385]: "Socket: AM5"
                  - generic [ref=e386]: "Cores: 6"
                  - generic [ref=e387]: "Threads: 12"
                  - generic [ref=e388]: "TDP: 65W"
              - generic [ref=e389]:
                - generic [ref=e390]: ฿8,590
                - button [ref=e391]:
                  - img [ref=e392]
            - generic [ref=e394] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e395]:
                - img [ref=e396]
              - img "AMD CPU (ซีพียู) AMD AM5 RYZEN 7 7800X3D 4.2 GHz 8C 16T" [ref=e401]
              - generic [ref=e402]:
                - generic [ref=e403]: AMD CPU (ซีพียู) AMD AM5 RYZEN 7 7800X3D 4.2 GHz 8C 16T
                - generic [ref=e404]:
                  - generic [ref=e405]: "Socket: AM5"
                  - generic [ref=e406]: "Cores: 8"
                  - generic [ref=e407]: "Threads: 16"
              - generic [ref=e408]:
                - generic [ref=e409]: ฿15,190
                - button [ref=e410]:
                  - img [ref=e411]
            - generic [ref=e413] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e414]:
                - img [ref=e415]
              - img "AMD Ryzen 5 8500G" [ref=e420]
              - generic [ref=e421]:
                - generic [ref=e422]: AMD Ryzen 5 8500G
                - generic [ref=e423]:
                  - generic [ref=e424]: "Socket: AM5"
                  - generic [ref=e425]: "Cores: 6"
                  - generic [ref=e426]: "Threads: 12"
                  - generic [ref=e427]: "TDP: 65W"
              - generic [ref=e428]:
                - generic [ref=e429]: ฿5,490
                - button [ref=e430]:
                  - img [ref=e431]
            - generic [ref=e433] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e434]:
                - img [ref=e435]
              - img "INTEL CORE i7" [ref=e440]
              - generic [ref=e441]:
                - generic [ref=e442]: INTEL CORE i7
                - generic [ref=e443]:
                  - generic [ref=e444]: "Socket: LGA 1700"
                  - generic [ref=e445]: "Cores: 20 (8P+12E)"
                  - generic [ref=e446]: "Threads: 28"
                  - generic [ref=e447]: "TDP: 125W"
              - generic [ref=e448]:
                - generic [ref=e449]: ฿11,990
                - button [ref=e450]:
                  - img [ref=e451]
            - generic [ref=e453] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e454]:
                - img [ref=e455]
              - img "AMD Ryzen 7 9700X" [ref=e460]
              - generic [ref=e461]:
                - generic [ref=e462]: AMD Ryzen 7 9700X
                - generic [ref=e463]:
                  - generic [ref=e464]: "Socket: AM5"
                  - generic [ref=e465]: "Cores: 8"
                  - generic [ref=e466]: "Threads: 16"
                  - generic [ref=e467]: "TDP: 65W"
              - generic [ref=e468]:
                - generic [ref=e469]: ฿12,290
                - button [ref=e470]:
                  - img [ref=e471]
            - generic [ref=e473] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e474]:
                - img [ref=e475]
              - img "AMD Ryzen 9 9950X3D" [ref=e480]
              - generic [ref=e481]:
                - generic [ref=e482]: AMD Ryzen 9 9950X3D
                - generic [ref=e483]:
                  - generic [ref=e484]: "Socket: AM5"
                  - generic [ref=e485]: "Cores: 16"
                  - generic [ref=e486]: "Threads: 32"
                  - generic [ref=e487]: "TDP: 170W"
              - generic [ref=e488]:
                - generic [ref=e489]: ฿26,990
                - button [ref=e490]:
                  - img [ref=e491]
            - generic [ref=e493] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e494]:
                - img [ref=e495]
              - img "AMD Ryzen 7 9800X3D" [ref=e500]
              - generic [ref=e501]:
                - generic [ref=e502]: AMD Ryzen 7 9800X3D
                - generic [ref=e503]:
                  - generic [ref=e504]: "Socket: AM5"
                  - generic [ref=e505]: "Cores: 8"
                  - generic [ref=e506]: "Threads: 16"
                  - generic [ref=e507]: "TDP: 120W"
              - generic [ref=e508]:
                - generic [ref=e509]: ฿17,990
                - button [ref=e510]:
                  - img [ref=e511]
            - generic [ref=e513] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e514]:
                - img [ref=e515]
              - img "AMD Ryzen 7 9850X3D" [ref=e520]
              - generic [ref=e521]:
                - generic [ref=e522]: AMD Ryzen 7 9850X3D
                - generic [ref=e523]:
                  - generic [ref=e524]: "Socket: AM5"
                  - generic [ref=e525]: "Cores: 8"
                  - generic [ref=e526]: "Threads: 16"
                  - generic [ref=e527]: "TDP: 120W"
              - generic [ref=e528]:
                - generic [ref=e529]: ฿19,590
                - button [ref=e530]:
                  - img [ref=e531]
            - generic [ref=e533] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e534]:
                - img [ref=e535]
              - img "INTEL ULTRA 5 225F" [ref=e540]
              - generic [ref=e541]:
                - generic [ref=e542]: INTEL ULTRA 5 225F
                - generic [ref=e543]:
                  - generic [ref=e544]: "Socket: LGA 1851"
                  - generic [ref=e545]: "Cores: 10 (6P+4E)"
                  - generic [ref=e546]: "Threads: 10"
                  - generic [ref=e547]: "TDP: 65W"
              - generic [ref=e548]:
                - generic [ref=e549]: ฿4,990
                - button [ref=e550]:
                  - img [ref=e551]
            - generic [ref=e553] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e554]:
                - img [ref=e555]
              - img "AMD Ryzen 5 9600X" [ref=e560]
              - generic [ref=e561]:
                - generic [ref=e562]: AMD Ryzen 5 9600X
                - generic [ref=e563]:
                  - generic [ref=e564]: "Socket: AM5"
                  - generic [ref=e565]: "Cores: 6"
                  - generic [ref=e566]: "Threads: 12"
                  - generic [ref=e567]: "TDP: 65W"
              - generic [ref=e568]:
                - generic [ref=e569]: ฿8,590
                - button [ref=e570]:
                  - img [ref=e571]
            - generic [ref=e573] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e574]:
                - img [ref=e575]
              - img "AMD Ryzen 5 7500F" [ref=e580]
              - generic [ref=e581]:
                - generic [ref=e582]: AMD Ryzen 5 7500F
                - generic [ref=e583]:
                  - generic [ref=e584]: "Socket: AM5"
                  - generic [ref=e585]: "Cores: 6"
                  - generic [ref=e586]: "Threads: 12"
                  - generic [ref=e587]: "TDP: 65W"
              - generic [ref=e588]:
                - generic [ref=e589]: ฿5,490
                - button [ref=e590]:
                  - img [ref=e591]
            - generic [ref=e593] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e594]:
                - img [ref=e595]
              - img "AMD Ryzen 9 9950X3D" [ref=e600]
              - generic [ref=e601]:
                - generic [ref=e602]: AMD Ryzen 9 9950X3D
                - generic [ref=e603]:
                  - generic [ref=e604]: "Socket: AM5"
                  - generic [ref=e605]: "Cores: 16"
                  - generic [ref=e606]: "Threads: 32"
                  - generic [ref=e607]: "TDP: 170W"
              - generic [ref=e608]:
                - generic [ref=e609]: ฿26,990
                - button [ref=e610]:
                  - img [ref=e611]
            - generic [ref=e613] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e614]:
                - img [ref=e615]
              - img "AMD Ryzen 7 9700X" [ref=e620]
              - generic [ref=e621]:
                - generic [ref=e622]: AMD Ryzen 7 9700X
                - generic [ref=e623]:
                  - generic [ref=e624]: "Socket: AM5"
                  - generic [ref=e625]: "Cores: 8"
                  - generic [ref=e626]: "Threads: 16"
                  - generic [ref=e627]: "TDP: 65W"
              - generic [ref=e628]:
                - generic [ref=e629]: ฿12,290
                - button [ref=e630]:
                  - img [ref=e631]
            - generic [ref=e633] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e634]:
                - img [ref=e635]
              - img "INTEL CORE i7" [ref=e640]
              - generic [ref=e641]:
                - generic [ref=e642]: INTEL CORE i7
                - generic [ref=e643]:
                  - generic [ref=e644]: "Socket: LGA 1700"
                  - generic [ref=e645]: "Cores: 20 (8P+12E)"
                  - generic [ref=e646]: "Threads: 28"
                  - generic [ref=e647]: "TDP: 125W"
              - generic [ref=e648]:
                - generic [ref=e649]: ฿11,990
                - button [ref=e650]:
                  - img [ref=e651]
            - generic [ref=e653] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e654]:
                - img [ref=e655]
              - img "AMD Ryzen 5 8500G" [ref=e660]
              - generic [ref=e661]:
                - generic [ref=e662]: AMD Ryzen 5 8500G
                - generic [ref=e663]:
                  - generic [ref=e664]: "Socket: AM5"
                  - generic [ref=e665]: "Cores: 6"
                  - generic [ref=e666]: "Threads: 12"
                  - generic [ref=e667]: "TDP: 65W"
              - generic [ref=e668]:
                - generic [ref=e669]: ฿5,490
                - button [ref=e670]:
                  - img [ref=e671]
            - generic [ref=e673] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e674]:
                - img [ref=e675]
              - img "AMD Ryzen 5 5600" [ref=e680]
              - generic [ref=e681]:
                - generic [ref=e682]: AMD Ryzen 5 5600
                - generic [ref=e683]:
                  - generic [ref=e684]: "Socket: AM4"
                  - generic [ref=e685]: "Cores: 6"
                  - generic [ref=e686]: "Threads: 12"
                  - generic [ref=e687]: "TDP: 65W"
              - generic [ref=e688]:
                - generic [ref=e689]: ฿4,390
                - button [ref=e690]:
                  - img [ref=e691]
            - generic [ref=e693] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e694]:
                - img [ref=e695]
              - img "INTEL ULTRA 5 225" [ref=e700]
              - generic [ref=e701]:
                - generic [ref=e702]: INTEL ULTRA 5 225
                - generic [ref=e703]:
                  - generic [ref=e704]: "Socket: LGA 1851"
                  - generic [ref=e705]: "Cores: 10 (6P+4E)"
                  - generic [ref=e706]: "Threads: 10"
                  - generic [ref=e707]: "TDP: 65W"
              - generic [ref=e708]:
                - generic [ref=e709]: ฿5,990
                - button [ref=e710]:
                  - img [ref=e711]
            - generic [ref=e713] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e714]:
                - img [ref=e715]
              - img "AMD CPU (ซีพียู) AMD AM5 RYZEN 7 7800X3D 4.2 GHz 8C 16T" [ref=e720]
              - generic [ref=e721]:
                - generic [ref=e722]: AMD CPU (ซีพียู) AMD AM5 RYZEN 7 7800X3D 4.2 GHz 8C 16T
                - generic [ref=e723]:
                  - generic [ref=e724]: "Socket: AM5"
                  - generic [ref=e725]: "Cores: 8"
                  - generic [ref=e726]: "Threads: 16"
              - generic [ref=e727]:
                - generic [ref=e728]: ฿15,190
                - button [ref=e729]:
                  - img [ref=e730]
            - generic [ref=e732] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e733]:
                - img [ref=e734]
              - img "AMD Ryzen 5 5500" [ref=e739]
              - generic [ref=e740]:
                - generic [ref=e741]: AMD Ryzen 5 5500
                - generic [ref=e742]:
                  - generic [ref=e743]: "Socket: AM4"
                  - generic [ref=e744]: "Cores: 6"
                  - generic [ref=e745]: "Threads: 12"
                  - generic [ref=e746]: "TDP: 65W"
              - generic [ref=e747]:
                - generic [ref=e748]: ฿3,190
                - button [ref=e749]:
                  - img [ref=e750]
            - generic [ref=e752] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e753]:
                - img [ref=e754]
              - img "AMD RYZEN THREADRIPPER PRO 7995WX" [ref=e759]
              - generic [ref=e760]:
                - generic [ref=e761]: AMD RYZEN THREADRIPPER PRO 7995WX
                - generic [ref=e762]:
                  - generic [ref=e763]: "Socket: sTR5"
                  - generic [ref=e764]: "Cores: 96"
                  - generic [ref=e765]: "Threads: 192"
                  - generic [ref=e766]: "TDP: 350W"
              - generic [ref=e767]:
                - generic [ref=e768]: ฿419,990
                - button [ref=e769]:
                  - img [ref=e770]
            - generic [ref=e772] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e773]:
                - img [ref=e774]
              - img "AMD Ryzen 7 5800XT" [ref=e779]
              - generic [ref=e780]:
                - generic [ref=e781]: AMD Ryzen 7 5800XT
                - generic [ref=e782]:
                  - generic [ref=e783]: "Socket: AM4"
                  - generic [ref=e784]: "Cores: 8"
                  - generic [ref=e785]: "Threads: 16"
                  - generic [ref=e786]: "TDP: 105W"
              - generic [ref=e787]:
                - generic [ref=e788]: ฿7,990
                - button [ref=e789]:
                  - img [ref=e790]
            - generic [ref=e792] [cursor=pointer]:
              - button "ดูรายละเอียดสเปค" [ref=e793]:
                - img [ref=e794]
              - img "INTEL CORE i5 12400F" [ref=e799]
              - generic [ref=e800]:
                - generic [ref=e801]: INTEL CORE i5 12400F
                - generic [ref=e802]:
                  - generic [ref=e803]: "Socket: LGA 1700"
                  - generic [ref=e804]: "Cores: 6 (6P)"
                  - generic [ref=e805]: "Threads: 12"
                  - generic [ref=e806]: "TDP: 65W"
              - generic [ref=e807]:
                - generic [ref=e808]: ฿4,790
                - button [ref=e809]:
                  - img [ref=e810]
    - generic:
      - button "เปิดแชตบอต SpecAI" [ref=e812] [cursor=pointer]:
        - img [ref=e815]
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
> 56  |     expect(selectedIntel).toBe(true);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
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
  81  |     await page.locator('.category-item', { hasText: 'RAM' }).click();
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