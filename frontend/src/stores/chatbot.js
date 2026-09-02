import { defineStore } from 'pinia'
import { useBuilderStore } from './builder'
import { useCatalogStore } from './catalog'
import { useAuthStore } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1')

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    isOpen: false,
    isTyping: false,
    isStreaming: false,
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
    async clear() {
      const sessionId = localStorage.getItem('chatbot_session_id')
      const authStore = useAuthStore()
      if (sessionId && authStore.token) {
        try {
          await fetch(`${API_BASE}/chatbot/clear`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authStore.token}`
            },
            body: JSON.stringify({ sessionId })
          })
        } catch (e) {}
      }
      localStorage.removeItem('chatbot_session_id')
      this.history = [{ role: 'bot', text: 'สวัสดีครับ! ยินดีต้อนรับสู่เว็บไซต์ ForgeLabs! ผมคือ SpecAI ผู้ช่วยส่วนตัวของคุณ ต้องการให้ผมจัดสเปคคอมพิวเตอร์แบบไหนครับ?' }]
    },
    async sendMessage(payload) {
      const text = typeof payload === 'string' ? payload : payload.text
      const image = typeof payload === 'object' ? payload.image : null

      this.addMessage('user', text, image?.data ? { image: `data:${image.mimeType};base64,${image.data}` } : {})
      this.isTyping = true
      this.isStreaming = false

      await this.processBotResponse(text, image)
    },
    async processBotResponse(text, image = null, retriedSession = false) {
      try {
        const authStore = useAuthStore()
        if (!authStore.token) {
          this.isTyping = false
          this.isStreaming = false
          this.addMessage('bot', 'กรุณาเข้าสู่ระบบก่อนใช้งานแชตบอต')
          return
        }

        const sessionId = localStorage.getItem('chatbot_session_id')
        const requestBody = { text, image }
        if (sessionId) requestBody.sessionId = sessionId

        const response = await fetch(`${API_BASE}/chatbot/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}`
          },
          body: JSON.stringify(requestBody)
        })

        if (response.status === 401) {
          this.isTyping = false
          this.isStreaming = false
          authStore.logout()
          localStorage.removeItem('chatbot_session_id')
          this.addMessage('bot', 'การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')
          return
        }

        if (response.status === 404) {
          localStorage.removeItem('chatbot_session_id')
          if (!retriedSession) {
            return this.processBotResponse(text, image, true)
          }
          this.isTyping = false
          this.isStreaming = false
          this.addMessage('bot', 'ไม่พบเซสชันแชต กรุณาลองส่งข้อความอีกครั้ง')
          return
        }

        if (!response.ok) throw new Error('API request failed')

        let botMsgIndex = -1

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let currentEvent = 'message'

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

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
                      if (botMsgIndex === -1) {
                        this.isTyping = false
                        this.isStreaming = true
                        botMsgIndex = this.history.length
                        this.addMessage('bot', data.text, { recommended_build: null, sources: [], isStreaming: true })
                      } else {
                        this.history[botMsgIndex].text += data.text
                      }
                    }
                  } else if (currentEvent === 'build_data') {
                    if (botMsgIndex !== -1) {
                      this.history[botMsgIndex].recommended_build = data.build_data
                    }
                  } else if (currentEvent === 'sources') {
                    if (botMsgIndex !== -1) {
                      this.history[botMsgIndex].sources = data.sources
                    }
                  } else if (currentEvent === 'error') {
                    console.error('SSE Error:', data.error)
                    this.isTyping = false
                    if (botMsgIndex === -1) {
                      botMsgIndex = this.history.length
                      this.addMessage('bot', `⚠️ ${data.error}`, { recommended_build: null, sources: [] })
                    } else {
                      this.history[botMsgIndex].text += `\n\n⚠️ ${data.error}`
                    }
                  } else if (currentEvent === 'clear') {
                    if (botMsgIndex !== -1) {
                      this.history[botMsgIndex].text = ''
                      this.history[botMsgIndex].sources = []
                      this.history[botMsgIndex].recommended_build = null
                    }
                  }
                } catch (err) {}
                currentEvent = 'message'
              }
            }
          }
        }

        if (botMsgIndex !== -1 && this.history[botMsgIndex]) {
          this.history[botMsgIndex].isStreaming = false
        }
      } catch (error) {
        console.error('Chatbot API Error:', error)
        this.addMessage('bot', 'ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ระบบ AI ได้ในขณะนี้ กรุณาตรวจสอบว่ารันระบบหลังบ้าน (Node.js) แล้ว ⚠️', { recommended_build: null })
      } finally {
        this.isTyping = false
        this.isStreaming = false
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

      this.addMessage('bot', `✅ **จัดสเปคลงตะกร้าเรียบร้อยแล้วครับ!** ราคารวมทั้งหมด ฿${calculatedTotal.toLocaleString()} บาท สามารถตรวจสอบรายละเอียดและปรับแก้เพิ่มเติมได้ที่หน้าจอหลักครับ`)
    }
  }
})
