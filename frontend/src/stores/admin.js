import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'
import { useToastStore } from './toast'
import { adminErrorMessage, adminRequest } from '../services/adminApi'

const fail = (toast, error, fallback) => {
  if (!error?.sessionExpired) toast.error(adminErrorMessage(error, fallback))
  return false
}

export const useAdminStore = defineStore('admin', {
  state: () => ({ orders: [], users: [] }),
  actions: {
    async fetchOrders() {
      try {
        const result = await adminRequest('/orders')
        this.orders = result?.data || result || []
        return true
      } catch (error) {
        return fail(useToastStore(), error, 'โหลดรายการสั่งซื้อไม่สำเร็จ')
      }
    },
    async updateOrderStatus(orderId, status) {
      const toast = useToastStore()
      try {
        await adminRequest(`/orders/${orderId}/status`, { method: 'PUT', body: { status } })
        const order = this.orders.find(item => item.id === orderId)
        if (order) order.status = status
        toast.success(`อัปเดตสถานะออเดอร์ ${orderId} สำเร็จ`)
        return true
      } catch (error) {
        return fail(toast, error, 'อัปเดตสถานะออเดอร์ไม่สำเร็จ')
      }
    },
    async saveProduct({ category, product }) {
      const toast = useToastStore()
      try {
        const isNew = product.id == null
        const payload = { ...product, category }
        if (isNew) delete payload.id
        const result = await adminRequest(isNew ? '/hardware' : `/hardware/${product.id}`, {
          method: isNew ? 'POST' : 'PUT', body: payload
        })
        const saved = result?.product || result
        const catalog = useCatalogStore().hardwareList
        if (saved && Array.isArray(catalog[category])) {
          const index = catalog[category].findIndex(item => item.id === saved.id)
          if (index === -1) catalog[category].push(saved)
          else catalog[category][index] = saved
        }
        toast.success(isNew ? 'เพิ่มสินค้าใหม่สำเร็จ' : 'บันทึกการแก้ไขสินค้าสำเร็จ')
        return saved
      } catch (error) {
        return fail(toast, error, 'บันทึกสินค้าไม่สำเร็จ')
      }
    },
    async deleteProduct({ category, productId }) {
      const toast = useToastStore()
      try {
        await adminRequest(`/hardware/${productId}`, { method: 'DELETE' })
        const catalog = useCatalogStore().hardwareList
        if (Array.isArray(catalog[category])) {
          catalog[category] = catalog[category].filter(item => item.id !== productId)
        }
        toast.success('ลบสินค้าออกจากระบบสำเร็จ')
        return true
      } catch (error) {
        return fail(toast, error, 'ลบสินค้าไม่สำเร็จ')
      }
    },
    async fetchUsers() {
      try {
        const result = await adminRequest('/auth/users')
        this.users = result?.data || result || []
        return true
      } catch (error) {
        return fail(useToastStore(), error, 'โหลดสมาชิกไม่สำเร็จ')
      }
    },
    async syncPrices(category = null, limit = 200) {
      const toast = useToastStore()
      try {
        const data = await adminRequest('/hardware/sync-prices', { method: 'POST', body: { category, limit } })
        toast.success(`ซิงก์ราคาเสร็จ: อัปเดต ${data?.updated || 0} รายการ จากทั้งหมด ${data?.checked || 0} รายการ`)
        return data
      } catch (error) {
        fail(toast, error, 'ซิงก์ราคาไม่สำเร็จ')
        return null
      }
    },
    async toggleUserRole(user) {
      const toast = useToastStore()
      const role = user.role === 'admin' ? 'customer' : 'admin'
      try {
        const result = await adminRequest(`/auth/users/${user.id}/role`, { method: 'PUT', body: { role } })
        user.role = result?.user?.role || result?.role || role
        toast.success('เปลี่ยนสิทธิ์ผู้ใช้งานสำเร็จ')
        return true
      } catch (error) {
        return fail(toast, error, 'เปลี่ยนสิทธิ์ผู้ใช้งานไม่สำเร็จ')
      }
    },
    async deleteUser(id) {
      const toast = useToastStore()
      try {
        await adminRequest(`/auth/users/${id}`, { method: 'DELETE' })
        this.users = this.users.filter(user => user.id !== id)
        toast.success('ลบบัญชีผู้ใช้งานสำเร็จ')
        return true
      } catch (error) {
        return fail(toast, error, 'ลบบัญชีผู้ใช้งานไม่สำเร็จ')
      }
    }
  }
})
