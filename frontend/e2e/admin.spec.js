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
    await page.getByRole('tab', { name: /คลังสินค้า/ }).click();
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
    await page.getByRole('tab', { name: /จัดการบทความ/ }).click();
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
    await page.getByRole('tab', { name: /จัดการสมาชิก/ }).click();
    const memberRow = page.getByRole('row', { name: /Member One/ });
    await memberRow.getByText('ปรับสิทธิ์').click();
    await page.getByText('ตกลง').click();
    await expect(memberRow).toContainText('admin');
    await memberRow.getByText('ลบ').click();
    await page.getByText('ตกลง').click();
    await expect(page.getByRole('row', { name: /Member One/ })).toHaveCount(0);

    await page.getByRole('tab', { name: /รายการสั่งซื้อ/ }).click();
    await page.getByRole('row', { name: /ORD-1/ }).locator('select').selectOption('shipped');
    await expect(page.getByRole('row', { name: /ORD-1/ })).toContainText('จัดส่งแล้ว');
    expect(state.requests.some(item => item.path === '/auth/users/2/role' && item.body.role === 'admin')).toBe(true);
    expect(state.requests.some(item => item.method === 'DELETE' && item.path === '/auth/users/2')).toBe(true);
    expect(state.requests.some(item => item.path === '/orders/ORD-1/status' && item.body.status === 'shipped')).toBe(true);
  });

  test('keeps product input for retry after error, then expires and clears the session', async ({ page }) => {
    const state = await useAdminFixture(page, { productFailure: { status: 500, message: 'temporary write failure' } });
    await openAdmin(page);
    await page.getByRole('tab', { name: /คลังสินค้า/ }).click();
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

test.describe('Admin responsive workflows', () => {
  test('desktop article titles keep table-cell geometry without a blank column gap', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 800 });
    await useAdminFixture(page);
    await openAdmin(page);
    await page.getByRole('tab', { name: /จัดการบทความ/ }).click();

    const row = page.getByRole('row', { name: /Existing Article/ });
    const titleCell = row.locator('td').nth(2);
    const dateCell = row.locator('td').nth(3);
    await expect(titleCell).toHaveCSS('display', 'table-cell');

    const titleBounds = await titleCell.boundingBox();
    const dateBounds = await dateCell.boundingBox();
    expect(Math.abs(dateBounds.x - (titleBounds.x + titleBounds.width))).toBeLessThanOrEqual(2);
  });

  test('desktop filters orders locally and keeps the table header visible while scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    const orders = Array.from({ length: 18 }, (_, index) => ({
      id: `ORD-${index + 1}`,
      customer_name: index === 11 ? 'Target Customer' : `Customer ${index + 1}`,
      assembly_type: 'standard',
      total_price: 9990,
      status: index % 2 ? 'pending' : 'assembling',
      created_at: '2026-08-20',
      build_items: {}
    }));
    const state = await useAdminFixture(page, { orders });
    await openAdmin(page);
    await page.getByRole('tab', { name: /รายการสั่งซื้อ/ }).click();

    const requestCount = state.requests.length;
    await page.locator('[data-test="orders-search"]').fill('Target Customer');
    await expect(page.locator('[data-test="orders-result-count"]')).toContainText('1 รายการ');
    await expect(page.getByRole('row', { name: /ORD-12/ })).toBeVisible();
    expect(state.requests.length).toBe(requestCount);

    await page.locator('[data-test="orders-table-region"]').evaluate(element => { element.scrollTop = 220; });
    await expect(page.locator('[data-test="orders-table-region"] thead')).toHaveCSS('position', 'sticky');
  });

  test('mobile product search keeps the matching card actionable without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await useAdminFixture(page, {
      catalog: {
        cpu: [
          { id: 1, name: 'Existing CPU', price: 3900, socket: 'AM4' },
          { id: 2, name: 'Mobile Target CPU', price: 5900, socket: 'AM5' }
        ],
        mobo: [], ram: [], gpu: [], storage: [], psu: [], case: []
      }
    });
    await openAdmin(page);
    await page.getByRole('tab', { name: /คลังสินค้า/ }).click();
    await page.locator('[data-test="products-search"]').fill('Mobile Target');

    const card = page.locator('[data-test="product-card-2"]');
    await expect(card).toBeVisible();
    await expect(page.locator('[data-test="product-card-1"]')).toHaveCount(0);
    await expect(card.getByRole('button', { name: 'แก้ไข' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  });

  test('tablet operations toolbar stays inside the viewport and exposes keyboard focus', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await useAdminFixture(page);
    await openAdmin(page);
    await page.getByRole('tab', { name: /จัดการบทความ/ }).click();

    const toolbar = page.getByRole('search', { name: 'ค้นหาและกรองบทความ' });
    const bounds = await toolbar.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(768);
    await page.locator('[data-test="articles-search"]').focus();
    await expect(page.locator('[data-test="articles-search"]')).toBeFocused();
    await expect(page.locator('[data-test="articles-search"]')).toHaveCSS('outline-style', 'solid');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(768);
  });

  test('mobile uses sticky tabs, actionable cards, and a viewport-contained dialog', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await useAdminFixture(page);
    await openAdmin(page);

    const tabs = page.getByRole('tablist', { name: 'ส่วนจัดการระบบ' });
    await expect(tabs).toHaveCSS('position', 'sticky');
    await page.getByRole('tab', { name: /คลังสินค้า/ }).click();
    await expect(page.locator('[data-test="product-card-1"]')).toBeVisible();
    await expect(page.locator('[data-test="inventory-table-region"]')).toBeHidden();

    await page.locator('[data-test="add-product"]').click();
    const modal = page.locator('[data-test="product-modal"] .admin-modal');
    const box = await modal.boundingBox();
    expect(box.x).toBe(0);
    expect(box.width).toBe(320);
    await expect(modal.locator('.admin-modal__footer')).toHaveCSS('position', 'sticky');

    await page.locator('[data-test="product-name"]').fill('Mobile Fixture CPU');
    await page.locator('[data-test="product-modal"] input[type="number"]').fill('4590');
    await page.locator('[data-test="save-product"]').click();
    await expect(page.locator('[data-test="product-card-101"]')).toContainText('Mobile Fixture CPU');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  });

  test('tablet keeps collections inside keyboard-scrollable table regions', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await useAdminFixture(page);
    await openAdmin(page);

    await expect(page.getByRole('tablist', { name: 'ส่วนจัดการระบบ' })).toHaveCSS('position', 'sticky');
    await page.getByRole('tab', { name: /คลังสินค้า/ }).click();
    const region = page.locator('[data-test="inventory-table-region"]');
    await expect(region).toBeVisible();
    await expect(page.locator('[data-test="product-card-1"]')).toBeHidden();
    await region.focus();
    await expect(region).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(768);
  });

  test('desktop retains the compact sidebar and full table presentation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await useAdminFixture(page);
    await openAdmin(page);

    await expect(page.locator('.admin-layout')).toHaveCSS('grid-template-columns', /\d+px \d+px/);
    await expect(page.getByRole('tablist', { name: 'ส่วนจัดการระบบ' })).toHaveCSS('position', 'static');
    await page.getByRole('tab', { name: /จัดการสมาชิก/ }).click();
    await expect(page.locator('[data-test="users-table-region"]')).toBeVisible();
    await expect(page.locator('[data-test="user-card-2"]')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
  });
});
