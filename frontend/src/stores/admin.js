import { defineStore } from 'pinia'
import { useCatalogStore } from './catalog'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1'

function authHeaders() {
  const token = localStorage.getItem('token')
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
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ status })
        })
        if (res.ok) {
          const idx = this.orders.findIndex(o => o.id === orderId)
          if (idx !== -1) this.orders[idx].status = status
        }
      } catch (err) {
        console.error('Failed to update order status:', err)
      }
    },
    async saveProduct(payload) {
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
        } else {
          const err = await res.json()
          alert(`Error saving product: ${err.message || 'Unknown error'}`)
        }
      } catch (err) {
        console.error('Save product error:', err)
      }
    },
    async deleteProduct(payload) {
      try {
        const { productId } = payload
        const res = await fetch(`${API_BASE}/hardware/${productId}`, {
          method: 'DELETE',
          headers: authHeaders()
        })
        if (res.ok) {
          const catalogStore = useCatalogStore()
          await catalogStore.fetchCatalog()
        } else {
          const err = await res.json()
          alert(`Error deleting product: ${err.message || 'Unknown error'}`)
        }
      } catch (err) {
        console.error('Delete product error:', err)
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
