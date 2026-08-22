import { test, expect } from '@playwright/test';

const admin = { id: 1, name: 'Admin Fixture', email: 'admin@test.local', role: 'admin', created_at: '2026-01-01' };

async function useAdminFixture(page, overrides = {}) {
  const state = {
    catalog: { cpu: [{ id: 1, name: 'Existing CPU', price: 3900, image: '/images/cpu.png', specifications: { Socket: 'AM4', Cores: '6', Threads: '12', TDP: '65W' } }], mobo: [], ram: [], gpu: [], storage: [], psu: [], case: [] },
    articles: [{ id: 10, title: 'Existing Article', content: 'Before', image: '/cover.png', date: '2026-08-20' }],
    users: [admin, { id: 2, name: 'Member One', email: 'member@test.local', role: 'customer', created_at: '2026-02-01' }],
    orders: [{ id: 'ORD-1', customer_name: 'Fixture Customer', assembly_type: 'standard', total_price: 9990, status: 'pending', created_at: '2026-08-20', build_items: {} }],
    requests: [], nextProductId: 101, nextArticleId: 201, ...overrides
  };
  await page.addInitScript(user => {
    localStorage.setItem('token', 'fixture-admin-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, admin);
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');
    const method = request.method();
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    let body = null;
    if (!['GET', 'DELETE'].includes(method)) body = request.postDataJSON();
    state.requests.push({ method, path, body, headers: request.headers() });

    if (method === 'GET' && path === '/hardware/catalog') return json(200, state.catalog);
    if (method === 'GET' && path === '/articles') return json(200, state.articles);
    if (method === 'GET' && path === '/orders') return json(200, { data: state.orders, total: state.orders.length, page: 1, limit: 20 });
    if (method === 'GET' && path === '/auth/users') return json(200, { data: state.users });

    if (path === '/hardware' && method === 'POST') {
      if (state.productFailure) {
        const failure = state.productFailure;
        state.productFailure = null;
        return json(failure.status, { error: failure.message });
      }
      const product = { ...body, id: state.nextProductId++ };
      state.catalog[body.category].push(product);
      return json(201, { success: true, product });
    }
    if (/^\/hardware\/\d+$/.test(path) && method === 'PUT') {
      const id = Number(path.split('/').pop());
      const product = { ...body, id };
      const list = state.catalog[body.category];
      list[list.findIndex(item => item.id === id)] = product;
      return json(200, { success: true, product });
    }
    if (/^\/hardware\/\d+$/.test(path) && method === 'DELETE') {
      const id = Number(path.split('/').pop());
      state.catalog.cpu = state.catalog.cpu.filter(item => item.id !== id);
      return json(200, { success: true });
    }
    if (path === '/articles' && method === 'POST') {
      const article = { ...body, id: state.nextArticleId++ };
      state.articles.push(article);
      return json(201, { success: true, article });
    }
    if (/^\/articles\/\d+$/.test(path) && method === 'PUT') {
      const id = Number(path.split('/').pop());
      const article = { ...body, id };
      state.articles[state.articles.findIndex(item => item.id === id)] = article;
      return json(200, { success: true, article });
    }
    if (/^\/articles\/\d+$/.test(path) && method === 'DELETE') {
      const id = Number(path.split('/').pop());
      state.articles = state.articles.filter(item => item.id !== id);
      return json(200, { success: true });
    }
    if (/^\/auth\/users\/\d+\/role$/.test(path) && method === 'PUT') {
      const id = Number(path.split('/')[3]);
      state.users.find(item => item.id === id).role = body.role;
      return json(200, { success: true, role: body.role });
    }
    if (/^\/auth\/users\/\d+$/.test(path) && method === 'DELETE') {
      const id = Number(path.split('/').pop());
      state.users = state.users.filter(item => item.id !== id);
      return json(200, { success: true });
    }
    if (/^\/orders\/[^/]+\/status$/.test(path) && method === 'PUT') {
      state.orders[0].status = body.status;
      return json(200, { success: true, status: body.status });
    }
    return json(404, { error: `Unhandled fixture request ${method} ${path}` });
  });
  return state;
}

async function openAdmin(page) {
  await page.goto('/admin');
  await expect(page.locator('.admin-layout')).toBeVisible();
}

test.describe('Admin CRUD with API fixtures', () => {
  test('creates, edits and deletes a product using real mutation payloads', async ({ page }) => {
    const state = await useAdminFixture(page);
    await openAdmin(page);
    await page.getByText('⚙️ คลังสินค้า').click();
    await page.getByText('+ เพิ่มสินค้า').click();
    await page.locator('[data-test="product-name"]').fill('Fixture CPU');
    await page.locator('[data-test="product-modal"] input[type="number"]').fill('4990');
    await page.locator('[data-test="save-product"]').click();
    await expect(page.getByRole('row', { name: /Fixture CPU/ })).toBeVisible();
    expect(state.requests.find(item => item.method === 'POST' && item.path === '/hardware').body)
      .toMatchObject({ category: 'cpu', name: 'Fixture CPU', price: 4990 });
    expect(state.requests.find(item => item.method === 'POST' && item.path === '/hardware').body).not.toHaveProperty('id');

    const row = page.getByRole('row', { name: /Fixture CPU/ });
    await row.getByText('แก้ไข').click();
    await page.locator('[data-test="product-name"]').fill('Fixture CPU Updated');
    await page.locator('[data-test="save-product"]').click();
    await expect(page.getByRole('row', { name: /Fixture CPU Updated/ })).toBeVisible();
    expect(state.requests.some(item => item.method === 'PUT' && item.path === '/hardware/101')).toBe(true);

    await page.getByRole('row', { name: /Fixture CPU Updated/ }).getByText('ลบ').click();
    await page.getByText('ตกลง').click();
    await expect(page.getByRole('row', { name: /Fixture CPU Updated/ })).toHaveCount(0);
    expect(state.requests.some(item => item.method === 'DELETE' && item.path === '/hardware/101')).toBe(true);
  });

  test('creates, edits and deletes an article and renders canonical fields', async ({ page }) => {
    const state = await useAdminFixture(page);
    await openAdmin(page);
    await page.getByText('📰 จัดการบทความ').click();
    await page.getByText('+ เพิ่มบทความ').click();
    await page.getByPlaceholder('ระบุหัวข้อบทความที่น่าสนใจ...').fill('Fixture Article');
    await page.getByPlaceholder('พิมพ์เนื้อหาที่นี่...').fill('Article content');
    await page.locator('[data-test="save-article"]').click();
    await expect(page.getByRole('row', { name: /Fixture Article/ })).toBeVisible();
    expect(state.requests.some(item => item.method === 'POST' && item.path === '/articles')).toBe(true);

    await page.getByRole('row', { name: /Fixture Article/ }).getByText('แก้ไข').click();
    await page.getByPlaceholder('ระบุหัวข้อบทความที่น่าสนใจ...').fill('Fixture Article Updated');
    await page.locator('[data-test="save-article"]').click();
    await expect(page.getByRole('row', { name: /Fixture Article Updated/ })).toBeVisible();
    await page.getByRole('row', { name: /Fixture Article Updated/ }).getByText('ลบ').click();
    await page.getByText('ตกลง').click();
    await expect(page.getByRole('row', { name: /Fixture Article Updated/ })).toHaveCount(0);
    expect(state.requests.some(item => item.method === 'PUT' && item.path === '/articles/201')).toBe(true);
    expect(state.requests.some(item => item.method === 'DELETE' && item.path === '/articles/201')).toBe(true);
  });

  test('changes member role, deletes member and updates order status only after responses', async ({ page }) => {
    const state = await useAdminFixture(page);
    await openAdmin(page);
    await page.getByText('👥 จัดการสมาชิก').click();
    const memberRow = page.getByRole('row', { name: /Member One/ });
    await memberRow.getByText('ปรับสิทธิ์').click();
    await page.getByText('ตกลง').click();
    await expect(memberRow).toContainText('admin');
    await memberRow.getByText('ลบ').click();
    await page.getByText('ตกลง').click();
    await expect(page.getByRole('row', { name: /Member One/ })).toHaveCount(0);

    await page.getByText('📦 รายการสั่งซื้อ').click();
    await page.getByRole('row', { name: /ORD-1/ }).locator('select').selectOption('shipped');
    await expect(page.getByRole('row', { name: /ORD-1/ })).toContainText('จัดส่งแล้ว');
    expect(state.requests.some(item => item.path === '/auth/users/2/role' && item.body.role === 'admin')).toBe(true);
    expect(state.requests.some(item => item.method === 'DELETE' && item.path === '/auth/users/2')).toBe(true);
    expect(state.requests.some(item => item.path === '/orders/ORD-1/status' && item.body.status === 'shipped')).toBe(true);
  });

  test('keeps product input for retry after error, then expires and clears the session', async ({ page }) => {
    const state = await useAdminFixture(page, { productFailure: { status: 500, message: 'temporary write failure' } });
    await openAdmin(page);
    await page.getByText('⚙️ คลังสินค้า').click();
    await page.getByText('+ เพิ่มสินค้า').click();
    await page.locator('[data-test="product-name"]').fill('Retry Product');
    await page.locator('[data-test="product-modal"] input[type="number"]').fill('4500');
    await page.locator('[data-test="save-product"]').click();
    await expect(page.locator('[data-test="product-name"]')).toHaveValue('Retry Product');
    await expect(page.getByText('temporary write failure')).toBeVisible();
    state.productFailure = { status: 403, message: 'expired' };
    await page.locator('[data-test="save-product"]').click();
    await expect(page).toHaveURL(/\/\?login=required$/);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
    await expect(page.getByText(/Session Admin หมดอายุ/)).toBeVisible();
  });
});
