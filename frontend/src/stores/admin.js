import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'
import { useToastStore } from './toast'

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? 'https://projectspecai-production.up.railway.app/api/v1' : 'http://localhost:3001/api/v1')

function authHeaders() {
  const token = typeof localStorage !== 'undefined' && localStorage.getItem ? localStorage.getItem('token') : null
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    orders: [],
    users: []
  }),
  actions: {
    async fetchOrders() {
      try {
        const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() })
        if (res.ok) {
          const result = await res.json()
          this.orders = result.data || result
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      }
    },
    async updateOrderStatus(orderId, status) {
      const toast = useToastStore()
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ status })
        })
        if (res.ok) {
          const idx = this.orders.findIndex(o => o.id === orderId)
          if (idx !== -1) this.orders[idx].status = status
          toast.success(`อัปเดตสถานะออเดอร์ ${orderId} เป็น ${status} สำเร็จ`)
        } else {
          toast.error('อัปเดตสถานะออเดอร์ไม่สำเร็จ')
        }
      } catch (err) {
        console.error('Failed to update order status:', err)
        toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะออเดอร์')
      }
    },
    async saveProduct(payload) {
      const toast = useToastStore()
      try {
        const { category, data } = payload
        const method = data.id ? 'PUT' : 'POST'
        const url = data.id ? `${API_BASE}/hardware/${data.id}` : `${API_BASE}/hardware`
        
        // Add category if creating new
        if (!data.id) data.category = category;

        const res = await fetch(url, {
          method,
          headers: authHeaders(),
          body: JSON.stringify(data)
        })
        if (res.ok) {
          const catalogStore = useCatalogStore()
          await catalogStore.fetchCatalog()
          toast.success(data.id ? 'บันทึกการแก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าใหม่สำเร็จ')
        } else {
          const err = await res.json()
          toast.error(`บันทึกสินค้าไม่สำเร็จ: ${err.error || err.message || 'Unknown error'}`)
        }
      } catch (err) {
        console.error('Save product error:', err)
        toast.error('เกิดข้อผิดพลาดในการบันทึกสินค้า')
      }
    },
    async deleteProduct(payload) {
      const toast = useToastStore()
      try {
        const { productId } = payload
        const res = await fetch(`${API_BASE}/hardware/${productId}`, {
          method: 'DELETE',
          headers: authHeaders()
        })
        if (res.ok) {
          const catalogStore = useCatalogStore()
          await catalogStore.fetchCatalog()
          toast.success('ลบสินค้าออกจากระบบสำเร็จ')
        } else {
          const err = await res.json()
          toast.error(`ลบสินค้าไม่สำเร็จ: ${err.error || err.message || 'Unknown error'}`)
        }
      } catch (err) {
        console.error('Delete product error:', err)
        toast.error('เกิดข้อผิดพลาดในการลบสินค้า')
      }
    },
    async fetchUsers() {
          try {
            const res = await fetch(`${API_BASE}/auth/users`, { headers: authHeaders() })
            if (res.ok) {
              const result = await res.json()
              this.users = result.data || result
            }
          } catch (err) {
            console.error('Failed to fetch users:', err)
          }
        },
        async syncPrices(category = null, limit = 200) {
          const toast = useToastStore()
          try {
            const res = await fetch(`${API_BASE}/hardware/sync-prices`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ category, limit })
            })
            const data = await res.json()
            if (res.ok) {
              toast.success(`ซิงก์ราคาเสร็จ: อัปเดต ${data.updated || 0} รายการ จากทั้งหมด ${data.checked || 0} รายการ`)
              return data
            }
            toast.error(`ซิงก์ราคาไม่สำเร็จ: ${data.error || 'Unknown error'}`)
            return null
          } catch (err) {
            console.error('Failed to sync prices:', err)
            toast.error('เกิดข้อผิดพลาดในการซิงก์ราคา (เซิร์ฟเวอร์อาจไม่พร้อม)')
            return null
          }
        },
    async toggleUserRole(user) {
      const newRole = user.role === 'admin' ? 'customer' : 'admin'
      try {
        const res = await fetch(`${API_BASE}/auth/users/${user.id}/role`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ role: newRole })
        })
        if (res.ok) user.role = newRole
      } catch (err) {
        console.error('Toggle role error:', err)
      }
    },
    async deleteUser(id) {
      try {
        const res = await fetch(`${API_BASE}/auth/users/${id}`, {
          method: 'DELETE',
          headers: authHeaders()
        })
        if (res.ok) {
          this.users = this.users.filter(u => u.id !== id)
        }
      } catch (err) {
        console.error('Delete user error:', err)
      }
    }
  }
})
