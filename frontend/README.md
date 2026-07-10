# PCSpec — Smart PC Builder (Frontend)

ระบบจัดสเปคคอมพิวเตอร์อัจฉริยะพร้อม AI แนะนำ (Vue 3 + Vite)

## Setup

```bash
npm install
# ตั้งค่า API endpoint ใน .env
# VITE_API_BASE=http://localhost:3000/api/v1
```

## Dev

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npx vitest run
```

## Tech Stack

- Vue 3.5 + Vue Router 4 + Pinia 3
- Vite 8 + Chart.js
- Vitest + @vue/test-utils

## Structure

```
src/
├── stores/     # Pinia stores (auth, builder, catalog, admin, chatbot, article)
├── views/      # Page-level components
├── components/ # Reusable components
└── router/     # Vue Router config
```
