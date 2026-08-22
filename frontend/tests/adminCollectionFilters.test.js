import { describe, expect, test } from 'vitest'
import {
  filterArticles,
  filterOrders,
  filterProducts,
  filterUsers
} from '../src/utils/adminCollectionFilters'

describe('Admin collection filters', () => {
  test('combines trimmed order search and status without mutating the source', () => {
    const orders = [
      { id: 'ORD-1', customer_name: 'Admin Ploy', status: 'assembling' },
      { id: 'ORD-2', customer_name: 'Checkout User', status: 'pending' }
    ]

    expect(filterOrders(orders, { query: '  ploy ', status: 'assembling' })).toEqual([orders[0]])
    expect(orders).toHaveLength(2)
  })

  test('matches product ID, name, and visible summary specification', () => {
    const products = [
      { id: 11038, name: 'AMD Ryzen 5 8400F', socket: 'AM5' },
      { id: 11041, name: 'Intel Core i3 14100', socket: 'LGA1700' }
    ]

    expect(filterProducts(products, { query: '11038' })).toEqual([products[0]])
    expect(filterProducts(products, { query: 'lga1700' })).toEqual([products[1]])
  })

  test('filters articles by title and exact ISO date', () => {
    const articles = [
      { id: 7, title: 'DDR5 vs DDR4', date: '2026-06-28' },
      { id: 8, title: 'SSD PCIe Gen 5', date: '2026-06-29' }
    ]

    expect(filterArticles(articles, { query: 'ddr5', date: '2026-06-28' })).toEqual([articles[0]])
    expect(filterArticles(articles, { query: '', date: '2026-06-29' })).toEqual([articles[1]])
  })

  test('matches users case-insensitively and filters role', () => {
    const users = [
      { id: 1, name: 'Admin Ploy', email: 'admin@test.local', role: 'admin' },
      { id: 2, name: 'Member One', email: 'member@test.local', role: 'customer' }
    ]

    expect(filterUsers(users, { query: 'MEMBER@TEST', role: 'customer' })).toEqual([users[1]])
    expect(filterUsers(undefined, { query: 'member', role: 'customer' })).toEqual([])
  })
})
