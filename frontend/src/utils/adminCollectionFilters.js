const normalize = value => String(value ?? '').trim().toLocaleLowerCase('th-TH')

const includesQuery = (query, fields) => {
  const term = normalize(query)
  return !term || fields.some(field => normalize(field).includes(term))
}

export const filterOrders = (orders = [], { query = '', status = 'all' } = {}) =>
  orders.filter(order =>
    (status === 'all' || order.status === status) &&
    includesQuery(query, [order.id, order.customer_name, order.customer])
  )

export const filterProducts = (products = [], { query = '' } = {}) =>
  products.filter(product => includesQuery(query, [
    product.id,
    product.name,
    product.socket,
    product.type,
    product.wattage,
    product.form_factor,
    product.capacity,
    product.memory_type
  ]))

export const filterArticles = (articles = [], { query = '', date = '' } = {}) =>
  articles.filter(article =>
    (!date || article.date === date) &&
    includesQuery(query, [article.id, article.title])
  )

export const filterUsers = (users = [], { query = '', role = 'all' } = {}) =>
  users.filter(user =>
    (role === 'all' || user.role === role) &&
    includesQuery(query, [user.id, user.name, user.email])
  )
