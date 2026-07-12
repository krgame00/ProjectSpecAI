import { defineStore } from 'pinia'
import { useBuilderStore } from './builder'
import { useCatalogStore } from './catalog'

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai-production.up.railway.app/api/v1' : 'http://localhost:3000/api/v1')

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    isOpen: false,
    isTyping: false,
    history: [
      { role: 'bot', text: 'สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI ผู้ช่วยส่วนตัวของคุณ ต้องการให้ผมจัดสเปคคอมพิวเตอร์แบบไหนครับ?' }
    ]
  }),
  actions: {
    toggle() {
      this.isOpen = !this.isOpen
    },
    open() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    addMessage(role, text, extra = {}) {
      this.history.push({ role, text, ...extra })
    },
    clear() {
      this.history = [{ role: 'bot', text: 'สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI ผู้ช่วยส่วนตัวของคุณ ต้องการให้ผมจัดสเปคคอมพิวเตอร์แบบไหนครับ?' }]
    },
    async sendMessage(payload) {
      const text = typeof payload === 'string' ? payload : payload.text
      const image = typeof payload === 'object' ? payload.image : null

      this.addMessage('user', text, image?.data ? { image: `data:${image.mimeType};base64,${image.data}` } : {})
      this.isTyping = true

      setTimeout(() => {
        this.isTyping = false
        this.processBotResponse(text, image)
      }, 100)
    },
    async processBotResponse(text, image = null) {
      try {
        let sessionId = localStorage.getItem('chatbot_session_id')
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          localStorage.setItem('chatbot_session_id', sessionId)
        }

        const response = await fetch(`${API_BASE}/chatbot/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, image, sessionId })
        })

        if (!response.ok) throw new Error('API request failed')

        const botMsgIndex = this.history.length
        this.addMessage('bot', '', { recommended_build: null, sources: [] })

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          let currentEvent = 'message'

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.substring(7).trim()
            } else if (line.startsWith('data: ')) {
              const dataStr = line.substring(6).trim()
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr)
                  if (currentEvent === 'session') {
                    localStorage.setItem('chatbot_session_id', data.sessionId)
                  } else if (currentEvent === 'message' || currentEvent === 'text') {
                    if (data.text) {
                      this.history[botMsgIndex].text += data.text
                    }
                  } else if (currentEvent === 'build_data') {
                    this.history[botMsgIndex].recommended_build = data.build_data
                  } else if (currentEvent === 'sources') {
                    this.history[botMsgIndex].sources = data.sources
                  } else if (currentEvent === 'error') {
                    console.error('SSE Error:', data.error)
                    if (this.history[botMsgIndex].text === '') {
                      this.history[botMsgIndex].text = `⚠️ ${data.error}`
                    } else {
                      this.history[botMsgIndex].text += `\n\n⚠️ ${data.error}`
                    }
                  } else if (currentEvent === 'clear') {
                    this.history[botMsgIndex].text = ''
                    this.history[botMsgIndex].sources = []
                    this.history[botMsgIndex].recommended_build = null
                  }
                } catch (err) {}
              }
            }
          }
        }
      } catch (error) {
        console.error('Chatbot API Error:', error)
        this.addMessage('bot', 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ระบบ AI ได้ในขณะนี้ กรุณาตรวจสอบว่ารันระบบหลังบ้าน (Node.js) แล้ว ⚠️', { recommended_build: null })
      }
    },
    applyBuild(buildObject) {
      if (!buildObject) return

      const builderStore = useBuilderStore()
      const catalogStore = useCatalogStore()

      Object.keys(buildObject).forEach(catId => {
        const itemId = buildObject[catId]
        if (itemId) {
          builderStore.setItem(catId, itemId)
        }
      })

      let calculatedTotal = 0
      const catalog = catalogStore.getCategorizedHardware
      Object.keys(buildObject).forEach(catId => {
        const itemId = buildObject[catId]
        if (itemId && catalog[catId]) {
          const item = catalog[catId].find(i => i.id === itemId)
          if (item) calculatedTotal += item.price
        }
      })

      this.addMessage('bot', `✅ <strong>จัดสเปคลงตะกร้าเรียบร้อยแล้วครับ!</strong> ราคารวมทั้งหมด ฿${calculatedTotal.toLocaleString()} บาท สามารถตรวจสอบรายละเอียดและปรับแก้เพิ่มเติมได้ที่หน้าจอหลักครับ`)
    }
  }
})
