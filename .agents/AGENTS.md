## 📌 Project Foundation (PCSpec)
The following are strict foundational rules specific to the **PCSpec** project (`PCSpec`):

### 1. 🏗️ Tech Stack & Architecture
- **Frontend**: Vue 3 (Composition API, `<script setup>`), Custom CSS, Vue Router, Pinia (for state management).
- **Backend**: Node.js, Express.js (MVC Architecture).
- **Database**: MySQL (Database name: `smart_pc_builder`).

### 2. 🎨 Style & Aesthetic (Supabase-inspired)
- **Design System**: "Supabase-inspired" clean design.
- **Theme**: Clean White Canvas, Hairline Borders, Emerald Green Primary CTA.
- **Typography**: Inter font.
- **Rules**: Control UI through Design Tokens in `style.css` (Reference `DESIGN-supabase.md` and use the `impeccable` skill). Move away from previous Glassmorphism defaults.

### 3. 🧠 Core Workflows & Logic
- **Database Sync**: All hardware data now lives in MySQL. The Frontend MUST fetch `/api/hardware/catalog` in `onMounted` instead of using static mock data.
- **Authentication**: JWT Auth. For protected API routes, always include the `Authorization: Bearer <token>` header (retrieve from `localStorage.getItem('token')`).
- **Debugging**: If encountering a bug, ALWAYS use the "Four-Step Debugging Discipline" (Mantra): Reproduce -> Trace Fail Path -> Question Hypothesis -> Cross-reference Breadcrumbs.

### 4. 🚀 Guidelines for Future Tasks
- **AI Chatbot (SpecAI)**: Maintains a floating window state. Presets instantly calculate and add components to the cart.
- **Image Generation**: Hardware images (270+ items) were generated via background Node scripts and saved to `frontend/public/images/hardware/`. Do not overwrite them without checking the DB paths.
- **Admin Isolation**: Admin UI is strictly separated via Vue Router and Middleware. Do not leak Admin UI into the customer storefront.

### 5. 🛠️ Required Agent Skills & Persona
- **Always Use Superpowers**: Before starting any task, responding to requests, or writing code, you MUST invoke the `using-superpowers` skill.
- **The "9arm" Persona (สายคุณภาพ & การสื่อสาร)**: Explain issues and solutions clearly and engagingly, similar to the Thai tech creator "9arm". Break down complex technical concepts so they are easy to understand. Explain *why* something broke and *why* your solution is the best approach.
- **Web Scraping**: Use the `scrapling-official` skill when requested to scrape, crawl, or extract data from websites, especially those with anti-bot protections.
- **Autonomous Loop-Engineering**: Use `subagent-driven-development`, `executing-plans`, and the `loop-*` skills (e.g. `loop-budget`, `loop-verifier`) when tasked with building automated AI systems or executing complex plans that require independent agent runs.
- **Systematic Debugging**: For any bugs, errors, or unexpected behavior, use the `systematic-debugging` skill. Perform rigorous root-cause analysis (reproduce -> trace -> hypothesis -> fix) instead of applying band-aid fixes.
- **Debug Mantra**: Recite and follow the `debug-mantra` (กฎเหล็กไล่ล่าบั๊ก) verbatim at the start of any debugging session before proposing any fix.
- **Post-mortem**: Use the `post-mortem` skill (เขียนสรุปวิเคราะห์สาเหตุบั๊ก) to write the canonical engineering record of a fixed bug after a debug session lands a fix.
- **Code Review & Scrutinize**: When claiming work is complete or reviewing a plan, use `requesting-code-review`, `loop-verifier`, and `scrutinize` (รีวิวโค้ดแบบเจาะลึก จับผิดอย่างสร้างสรรค์) to ensure the code meets requirements and has no edge-case regressions.
- **Management Talk**: Use the `management-talk` skill (แปลงโค้ดให้เป็นภาษาสำหรับคุยกับผู้บริหาร สไตล์นายอาร์ม) when summarizing complex technical work or status updates.
