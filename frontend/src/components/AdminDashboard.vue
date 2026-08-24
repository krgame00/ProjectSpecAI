<template>
  <div class="container admin-view">
    <header class="admin-heading">
      <h2 style="font-size: var(--text-2xl); color: var(--accent); text-shadow: var(--accent-glow);">ระบบจัดการหลังบ้าน (Admin Panel)</h2>
      <p style="color: var(--muted);">ภาพรวมร้านค้า การสั่งซื้อ สินค้าคงคลัง และบทความ</p>
    </header>

    <div class="admin-layout">
      <aside class="admin-sidebar">
        <ul class="admin-menu admin-tabs" role="tablist" aria-label="ส่วนจัดการระบบ">
          <li v-for="tab in adminTabs" :key="tab.id" role="presentation">
            <button
              type="button"
              role="tab"
              :id="`admin-tab-${tab.id}`"
              :aria-controls="`admin-panel-${tab.id}`"
              :aria-selected="adminTab === tab.id"
              :class="{ active: adminTab === tab.id }"
              @click="selectAdminTab(tab.id)"
            >
              <span aria-hidden="true">{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          </li>
        </ul>
        <div class="admin-return" style="padding: 1rem; margin-top: auto; border-top: 1px solid var(--hairline-cool);">
          <button class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" @click="$router.push('/')">
            <span aria-hidden="true">⬅️</span><span class="admin-return__label">กลับหน้าร้านค้า</span>
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <!-- Dashboard Tab -->
        <div v-if="adminTab === 'dashboard'" id="admin-panel-dashboard" role="tabpanel" aria-labelledby="admin-tab-dashboard">
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-title">ยอดขายรวม (Gross Revenue)</div>
              <div class="stat-val">฿{{ totalSales.toLocaleString() }}</div>
              <div class="stat-insight positive">↑ 12% เทียบกับเดือนที่แล้ว</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">คำสั่งซื้อทั้งหมด (Total Orders)</div>
              <div class="stat-val">{{ orders.length }}</div>
              <div class="stat-insight">ยอดซื้อเฉลี่ย ฿{{ orders.length ? Math.floor(totalSales / orders.length).toLocaleString() : 0 }}/บิล</div>
            </div>
            <div class="stat-card">
              <div class="stat-title">รอจัดประกอบ (Pending Assembly)</div>
              <div class="stat-val" style="color: var(--warning);">{{ pendingAssemblies }}</div>
              <div class="stat-insight alert">ต้องดำเนินการโดยด่วน</div>
            </div>
          </div>
          
          <div class="admin-card admin-chart-card">
            <h3 style="margin-bottom: 1.5rem; color: var(--ink);">สถิติยอดขาย 7 วันย้อนหลัง</h3>
            <div class="admin-chart">
              <Bar :data="chartData" :options="chartOptions" v-if="chartData.labels" />
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="adminTab === 'users'" id="admin-panel-users" role="tabpanel" aria-labelledby="admin-tab-users" class="admin-card">
          <header class="operations-header">
            <div>
              <h3>จัดการสมาชิก</h3>
              <p class="operations-description">ค้นหาบัญชี ตรวจสอบสิทธิ์ และจัดการสมาชิกในระบบ</p>
            </div>
            <output class="operations-count" data-test="users-result-count" aria-live="polite">{{ filteredUsers.length }} รายการ</output>
          </header>
          <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองสมาชิก">
            <label class="operations-search">
              <span>ค้นหาสมาชิก</span>
              <input v-model="userQuery" data-test="users-search" class="form-control" type="search" placeholder="ชื่อ อีเมล หรือ ID">
            </label>
            <label class="operations-filter">
              <span>สิทธิ์</span>
              <select v-model="userRole" data-test="users-role-filter" class="form-control">
                <option value="all">ทุกสิทธิ์</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </label>
            <button v-if="userQuery || userRole !== 'all'" data-test="users-reset" class="btn btn-outline" type="button" @click="resetUserFilters">ล้างตัวกรอง</button>
          </div>
          <div class="admin-table-region" data-test="users-table-region" tabindex="0" aria-label="ตารางสมาชิก เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>สถานะ (Role)</th>
                <th>วันที่สมัคร</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['status-badge', user.role === 'admin' ? 'completed' : 'pending']">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ new Date(user.created_at).toLocaleDateString('th-TH') }}</td>
                <td>
                  <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="btn btn-outline btn-sm" @click="toggleUserRole(user)" :disabled="user.id === currentUser.id || pendingUserId === user.id">
                      ปรับสิทธิ์
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="deleteUser(user.id)" :disabled="user.id === currentUser.id || pendingUserId === user.id">
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          <div class="admin-mobile-list" aria-label="รายชื่อสมาชิก">
            <article v-for="user in filteredUsers" :key="'user-card-'+user.id" class="admin-mobile-card" :data-test="`user-card-${user.id}`">
              <div class="admin-mobile-card__heading">
                <strong>{{ user.name }}</strong>
                <span class="admin-mobile-card__id">#{{ user.id }}</span>
              </div>
              <dl class="admin-mobile-card__facts">
                <div><dt>อีเมล</dt><dd>{{ user.email || '-' }}</dd></div>
                <div><dt>สิทธิ์</dt><dd><span :class="['status-badge', user.role === 'admin' ? 'completed' : 'pending']">{{ user.role }}</span></dd></div>
                <div><dt>วันที่สมัคร</dt><dd>{{ new Date(user.created_at).toLocaleDateString('th-TH') }}</dd></div>
              </dl>
              <div class="admin-actions">
                <button class="btn btn-outline" @click="toggleUserRole(user)" :disabled="user.id === currentUser.id || pendingUserId === user.id">ปรับสิทธิ์</button>
                <button class="btn btn-outline-danger" @click="deleteUser(user.id)" :disabled="user.id === currentUser.id || pendingUserId === user.id">ลบ</button>
              </div>
            </article>
          </div>
          <p v-if="users.length === 0" class="admin-empty" data-test="users-empty">ยังไม่มีสมาชิกในระบบ</p>
          <div v-else-if="filteredUsers.length === 0" class="admin-empty admin-no-results" data-test="users-no-results">
            <p>ไม่พบสมาชิกที่ตรงกับตัวกรอง</p>
            <button class="btn btn-outline" type="button" @click="resetUserFilters">ล้างตัวกรอง</button>
          </div>
        </div>

        <!-- Admin Profile Tab -->
        <div v-if="adminTab === 'profile'" id="admin-panel-profile" role="tabpanel" aria-labelledby="admin-tab-profile">
          <ProfileView embedded />
        </div>

        <!-- Orders Tab -->
        <div v-if="adminTab === 'orders'" id="admin-panel-orders" role="tabpanel" aria-labelledby="admin-tab-orders" class="admin-card hairline-grid">
          <header class="operations-header">
            <div>
              <h3>รายการสั่งซื้อ</h3>
              <p class="operations-description">ติดตามคำสั่งซื้อและอัปเดตสถานะงานประกอบ</p>
            </div>
            <output class="operations-count" data-test="orders-result-count" aria-live="polite">{{ filteredOrders.length }} รายการ</output>
          </header>
          <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองคำสั่งซื้อ">
            <label class="operations-search">
              <span>ค้นหาคำสั่งซื้อ</span>
              <input v-model="orderQuery" data-test="orders-search" class="form-control" type="search" placeholder="หมายเลขออเดอร์หรือลูกค้า">
            </label>
            <label class="operations-filter">
              <span>สถานะ</span>
              <select v-model="orderStatus" data-test="orders-status-filter" class="form-control">
                <option value="all">ทุกสถานะ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="assembling">กำลังประกอบ</option>
                <option value="shipped">จัดส่งแล้ว</option>
              </select>
            </label>
            <button v-if="orderQuery || orderStatus !== 'all'" data-test="orders-reset" class="btn btn-outline" type="button" @click="resetOrderFilters">ล้างตัวกรอง</button>
          </div>
          <div class="admin-table-region" data-test="orders-table-region" tabindex="0" aria-label="ตารางคำสั่งซื้อ เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
          <table class="data-table hairline-grid">
            <thead>
              <tr class="font-mono">
                <th>หมายเลข (ID)</th>
                <th>ลูกค้า (CUSTOMER)</th>
                <th>รูปแบบประกอบ (ASSEMBLY)</th>
                <th>ยอดสุทธิ (TOTAL)</th>
                <th>สถานะ (STATUS)</th>
                <th>จัดการ (ACTION)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id">
                <td style="font-family: var(--font-mono); font-weight: 600;">
                  {{ order.id }}
                  <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; font-weight: normal;">
                    {{ new Date(order.created_at || order.date).toLocaleDateString('th-TH') }}
                  </div>
                </td>
                <td>{{ order.customer_name || order.customer }}</td>
                <td>
                  <span v-if="order.assembly_type === 'none' || order.assembly === 'none'">ประกอบเอง</span>
                  <span v-else-if="order.assembly_type === 'standard' || order.assembly === 'standard'" style="color: var(--accent);">มาตรฐาน</span>
                  <span v-else-if="order.assembly_type === 'premium' || order.assembly === 'premium'" style="color: var(--warning);">พรีเมียม</span>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 600;">฿{{ (order.total_price || order.total || 0).toLocaleString() }}</td>
                <td>
                  <span :class="['badge', 'badge-' + order.status]">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <select class="form-control" style="padding: 0.25rem 0.5rem; width: auto; background: var(--canvas); color: var(--ink); height: 32px;" :value="order.status" :disabled="pendingOrderId === order.id" @change="updateOrderStatus(order, $event)">
                      <option value="pending" style="background: var(--canvas); color: var(--ink);">รอดำเนินการ</option>
                      <option value="assembling" style="background: var(--canvas); color: var(--ink);">กำลังประกอบ</option>
                      <option value="shipped" style="background: var(--canvas); color: var(--ink);">จัดส่งแล้ว</option>
                    </select>
                    <button class="btn btn-outline btn-sm" style="height: 32px; display: flex; align-items: center; justify-content: center;" @click="openOrderModal(order)">
                      📄 รายละเอียด
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          <div class="admin-mobile-list" aria-label="รายการคำสั่งซื้อ">
            <article v-for="order in filteredOrders" :key="'order-card-'+order.id" class="admin-mobile-card" :data-test="`order-card-${order.id}`">
              <div class="admin-mobile-card__heading">
                <strong>{{ order.id }}</strong>
                <span class="badge" :class="'badge-' + order.status">{{ getStatusLabel(order.status) }}</span>
              </div>
              <dl class="admin-mobile-card__facts">
                <div><dt>ลูกค้า</dt><dd>{{ order.customer_name || order.customer }}</dd></div>
                <div><dt>ยอดสุทธิ</dt><dd>฿{{ (order.total_price || order.total || 0).toLocaleString() }}</dd></div>
                <div><dt>วันที่</dt><dd>{{ new Date(order.created_at || order.date).toLocaleDateString('th-TH') }}</dd></div>
              </dl>
              <div class="admin-actions admin-actions--stack">
                <label class="sr-only" :for="`order-status-${order.id}`">สถานะคำสั่งซื้อ {{ order.id }}</label>
                <select :id="`order-status-${order.id}`" class="form-control" :value="order.status" :disabled="pendingOrderId === order.id" @change="updateOrderStatus(order, $event)">
                  <option value="pending">รอดำเนินการ</option>
                  <option value="assembling">กำลังประกอบ</option>
                  <option value="shipped">จัดส่งแล้ว</option>
                </select>
                <button class="btn btn-outline" @click="openOrderModal(order)">📄 รายละเอียด</button>
              </div>
            </article>
          </div>
          <p v-if="orders.length === 0" class="admin-empty" data-test="orders-empty">ยังไม่มีคำสั่งซื้อในระบบ</p>
          <div v-else-if="filteredOrders.length === 0" class="admin-empty admin-no-results" data-test="orders-no-results">
            <p>ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</p>
            <button class="btn btn-outline" type="button" @click="resetOrderFilters">ล้างตัวกรอง</button>
          </div>
        </div>

        <!-- Inventory Tab -->
        <div v-if="adminTab === 'inventory'" id="admin-panel-inventory" role="tabpanel" aria-labelledby="admin-tab-inventory" class="admin-card admin-section-card">
          <header class="operations-header">
            <div>
              <h3>จัดการสินค้า</h3>
              <p class="operations-description">ดูแลแคตตาล็อก สเปก และราคาสินค้าแยกตามหมวดหมู่</p>
            </div>
            <output class="operations-count" data-test="products-result-count" aria-live="polite">{{ filteredProducts.length }} รายการ</output>
          </header>
          <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองสินค้า">
            <label class="operations-search">
              <span>ค้นหาสินค้า</span>
              <input v-model="productQuery" data-test="products-search" class="form-control" type="search" placeholder="ชื่อ ID หรือสเปก">
            </label>
            <label class="operations-filter">
              <span>หมวดหมู่</span>
              <select class="form-control admin-category-select" v-model="inventoryCategory">
                <option v-for="cat in categories" :key="'inv-'+cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </label>
            <button v-if="productQuery" data-test="products-reset" class="btn btn-outline" type="button" @click="resetProductFilters">ล้างตัวกรอง</button>
            <div class="operations-actions">
              <button class="btn btn-outline" @click="handleSyncPrices" :disabled="isSyncingPrices">
                <span v-if="isSyncingPrices" class="spinner-small"></span>
                <span v-else aria-hidden="true">🔄</span>
                {{ isSyncingPrices ? 'กำลังซิงก์ราคา…' : 'ซิงก์ราคาล่าสุด' }}
              </button>
              <button class="btn btn-primary" data-test="add-product" @click="openProductModal()">+ เพิ่มสินค้า</button>
            </div>
          </div>
          <div class="admin-table-region" data-test="inventory-table-region" tabindex="0" aria-label="ตารางสินค้า เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>สเปคเบื้องต้น</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredProducts" :key="'inv-item-'+item.id">
                <td style="font-family: var(--font-mono); color: var(--muted);">{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td style="font-family: var(--font-mono); font-weight: 600;">฿{{ item.price.toLocaleString() }}</td>
                <td style="font-size: var(--text-xs); color: var(--muted);">
                  {{ item.socket || item.type || item.wattage ? (item.socket || item.type || item.wattage+'W') : '-' }}
                </td>
                <td>
                  <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.5rem;" @click="openProductModal(item)">แก้ไข</button>
                  <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--error-bg); color: var(--error); border: 1px solid var(--error);" @click="deleteProduct(item.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          <div class="admin-mobile-list" aria-label="รายการสินค้า">
            <article v-for="item in filteredProducts" :key="'product-card-'+item.id" class="admin-mobile-card" :data-test="`product-card-${item.id}`">
              <div class="admin-mobile-card__heading">
                <strong>{{ item.name }}</strong>
                <span class="admin-mobile-card__id">#{{ item.id }}</span>
              </div>
              <dl class="admin-mobile-card__facts">
                <div><dt>ราคา</dt><dd>฿{{ item.price.toLocaleString() }}</dd></div>
                <div><dt>สเปค</dt><dd>{{ item.socket || item.type || (item.wattage ? item.wattage + 'W' : '-') }}</dd></div>
              </dl>
              <div class="admin-actions">
                <button class="btn btn-outline" @click="openProductModal(item)">แก้ไข</button>
                <button class="btn btn-outline-danger" @click="deleteProduct(item.id)">ลบ</button>
              </div>
            </article>
          </div>
          <p v-if="!catalog[inventoryCategory] || catalog[inventoryCategory].length === 0" class="admin-empty" data-test="products-empty">ยังไม่มีสินค้าในหมวดนี้</p>
          <div v-else-if="filteredProducts.length === 0" class="admin-empty admin-no-results" data-test="products-no-results">
            <p>ไม่พบสินค้าที่ตรงกับคำค้นหา</p>
            <button class="btn btn-outline" type="button" @click="resetProductFilters">ล้างตัวกรอง</button>
          </div>
        </div>

        <!-- Articles Tab -->
        <div v-if="adminTab === 'articles'" id="admin-panel-articles" role="tabpanel" aria-labelledby="admin-tab-articles" class="admin-card admin-section-card">
          <header class="operations-header">
            <div>
              <h3>จัดการบทความ</h3>
              <p class="operations-description">ค้นหา ตรวจสอบวันที่เผยแพร่ และดูแลเนื้อหาความรู้</p>
            </div>
            <output class="operations-count" data-test="articles-result-count" aria-live="polite">{{ filteredArticles.length }} รายการ</output>
          </header>
          <div class="operations-toolbar" role="search" aria-label="ค้นหาและกรองบทความ">
            <label class="operations-search">
              <span>ค้นหาบทความ</span>
              <input v-model="articleQuery" data-test="articles-search" class="form-control" type="search" placeholder="หัวข้อหรือ ID">
            </label>
            <label class="operations-filter">
              <span>วันที่เผยแพร่</span>
              <input v-model="articleDate" data-test="articles-date-filter" class="form-control" type="date">
            </label>
            <button v-if="articleQuery || articleDate" data-test="articles-reset" class="btn btn-outline" type="button" @click="resetArticleFilters">ล้างตัวกรอง</button>
            <div class="operations-actions">
              <button class="btn btn-primary" data-test="add-article" @click="openArticleModal()">+ เพิ่มบทความ</button>
            </div>
          </div>
          <div class="admin-table-region" data-test="articles-table-region" tabindex="0" aria-label="ตารางบทความ เลื่อนแนวนอนเพื่อดูข้อมูลเพิ่มเติม">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ภาพปก</th>
                <th>หัวข้อ</th>
                <th>วันที่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in filteredArticles" :key="'art-'+article.id">
                <td style="font-family: var(--font-mono); color: var(--muted);">{{ article.id }}</td>
                <td><img :src="article.image" :alt="`ภาพปก ${article.title}`" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" /></td>
                <td><span class="article-title-text">{{ article.title }}</span></td>
                <td>{{ article.date }}</td>
                <td>
                  <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.5rem;" @click="openArticleModal(article)">แก้ไข</button>
                  <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--error-bg); color: var(--error); border: 1px solid var(--error);" @click="deleteArticle(article.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          <div class="admin-mobile-list" aria-label="รายการบทความ">
            <article v-for="article in filteredArticles" :key="'article-card-'+article.id" class="admin-mobile-card" :data-test="`article-card-${article.id}`">
              <div class="admin-mobile-card__heading">
                <strong>{{ article.title }}</strong>
                <span class="admin-mobile-card__id">#{{ article.id }}</span>
              </div>
              <div class="admin-mobile-card__media">
                <img v-if="article.image" :src="article.image" :alt="`ภาพปก ${article.title}`">
                <span v-else aria-hidden="true">📰</span>
                <time :datetime="article.date">{{ article.date }}</time>
              </div>
              <div class="admin-actions">
                <button class="btn btn-outline" @click="openArticleModal(article)">แก้ไข</button>
                <button class="btn btn-outline-danger" @click="deleteArticle(article.id)">ลบ</button>
              </div>
            </article>
          </div>
          <p v-if="!articles || articles.length === 0" class="admin-empty" data-test="articles-empty">ยังไม่มีบทความในระบบ</p>
          <div v-else-if="filteredArticles.length === 0" class="admin-empty admin-no-results" data-test="articles-no-results">
            <p>ไม่พบบทความที่ตรงกับตัวกรอง</p>
            <button class="btn btn-outline" type="button" @click="resetArticleFilters">ล้างตัวกรอง</button>
          </div>
        </div>
      </main>
    </div>

    <!-- Order Details Modal -->
    <div class="modal-overlay" v-if="showOrderModal" @click.self="showOrderModal = false">
      <div class="modal-content glass-panel admin-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title" style="max-width: 600px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 id="order-modal-title" style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem;">
            <span>📄</span> 
            รายละเอียดคำสั่งซื้อ {{ selectedOrder?.id }}
          </h3>
          <button class="close-btn" aria-label="ปิดรายละเอียดคำสั่งซื้อ" @click="showOrderModal = false">✕</button>
        </div>
        <div class="modal-body admin-modal__body" style="max-height: 70vh; overflow-y: auto; padding: 1.5rem;">
          <div class="order-meta-grid" style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--ink-mute);">
            <div><strong>ลูกค้า:</strong> {{ selectedOrder?.customer_name || selectedOrder?.customer }}</div>
            <div><strong>รูปแบบประกอบ:</strong> {{ selectedOrder?.assembly_type || selectedOrder?.assembly }}</div>
            <div><strong>เบอร์โทร:</strong> {{ selectedOrder?.customer_phone || '-' }}</div>
            <div><strong>ยอดสุทธิ:</strong> ฿{{ (selectedOrder?.total_price || selectedOrder?.total || 0).toLocaleString() }}</div>
            <div style="grid-column: 1 / -1;"><strong>ที่อยู่:</strong> {{ selectedOrder?.customer_address || '-' }}</div>
          </div>
          
          <h4 style="margin-bottom: 1rem; color: var(--ink); border-bottom: 1px solid var(--hairline-cool); padding-bottom: 0.5rem;">รายการสินค้าที่สั่งซื้อ</h4>
          <div v-if="selectedOrder?.build_items && Object.keys(selectedOrder.build_items).length > 0" style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div v-for="(itemId, category) in selectedOrder.build_items" :key="category" style="display: flex; align-items: center; gap: 1rem; background: var(--canvas-soft); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--hairline-cool);">
              <div style="width: 40px; height: 40px; background: var(--canvas); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; padding: 0.25rem;">
                <img v-if="getHardwareItem(category, itemId)?.image" :src="getHardwareItem(category, itemId).image" style="width: 100%; height: 100%; object-fit: contain;">
                <span v-else>📦</span>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.7rem; color: var(--ink-mute); text-transform: uppercase;">{{ category }}</div>
                <div style="font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ getHardwareItem(category, itemId)?.name || 'ไม่พบข้อมูลสินค้า (ID: ' + itemId + ')' }}
                </div>
              </div>
              <div style="font-weight: 600; font-family: var(--font-mono);">
                ฿{{ (getHardwareItem(category, itemId)?.price || 0).toLocaleString() }}
              </div>
            </div>
          </div>
          <div v-else style="text-align: center; color: var(--muted); padding: 1rem;">ไม่มีข้อมูลรายการชิ้นส่วน</div>
        </div>
        <div class="admin-modal__footer" style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" @click="showOrderModal = false">ปิด</button>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" data-test="product-modal" v-if="showProductModal" @click.self="!isSavingProduct && (showProductModal = false)">
      <div class="modal-content glass-panel admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 id="product-modal-title" style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📦</span> 
            {{ editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ในคลัง' }}
          </h3>
          <button class="close-btn" aria-label="ปิดฟอร์มสินค้า" @click="showProductModal = false">✕</button>
        </div>
        <div class="modal-body admin-modal__body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div class="admin-form-grid">
            <div class="form-group" style="margin: 0;">
              <label>รหัสสินค้า (ID)</label>
              <input type="text" class="form-control" v-model="productForm.id" disabled placeholder="ระบบจะสร้าง ID ให้อัตโนมัติ" style="background: rgba(0,0,0,0.1);">
            </div>
            <div class="form-group" style="margin: 0;">
              <label>ราคา (บาท)</label>
              <div style="position: relative;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--accent);">฿</span>
                <input type="number" class="form-control" v-model.number="productForm.price" style="padding-left: 2rem;">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>ชื่อสินค้า</label>
            <input type="text" data-test="product-name" class="form-control" v-model="productForm.name" placeholder="ระบุชื่อสินค้าแบบเต็ม...">
          </div>

          <div class="form-group">
            <label>รูปภาพ (URL)</label>
            <div class="admin-media-field">
              <input type="text" class="form-control" v-model="productForm.image" placeholder="ระบุ URL รูปภาพ (เช่น /images/cpu.png)" style="flex: 1;" @input="productImgError = false">
              <div style="width: 80px; height: 80px; border-radius: var(--radius-sm); border: 1px dashed var(--hairline-strong); overflow: hidden; background: var(--canvas-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <template v-if="productForm.image">
                  <div v-if="productImgError" style="font-size: 0.7rem; color: var(--danger); text-align: center; padding: 0.2rem;">
                    ⚠️<br>โหลดไม่สำเร็จ
                  </div>
                  <img v-else :src="productForm.image" style="width: 100%; height: 100%; object-fit: cover;" @error="productImgError = true">
                </template>
                <div v-else style="font-size: 1.5rem; color: var(--ink-mute-2);">🖼️</div>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <label style="display: flex; justify-content: space-between;">
              <span>รายละเอียดสเปค (JSON)</span>
              <span style="font-size: 0.75rem; color: var(--muted); font-weight: normal;">(เช่น Socket: AM4)</span>
            </label>
            <div style="background: var(--canvas-soft); border: 1px solid var(--hairline); border-radius: var(--radius-sm); padding: 1rem;">
              <div v-for="(spec, index) in productForm.specList" :key="index" class="admin-spec-row">
                <input type="text" class="form-control" v-model="spec.key" placeholder="Key" style="flex: 1; padding: 0.4rem; font-size: 0.85rem;">
                <input type="text" class="form-control" v-model="spec.value" placeholder="Value" style="flex: 2; padding: 0.4rem; font-size: 0.85rem;">
                <button class="btn btn-outline-danger" style="padding: 0.4rem 0.6rem;" @click="removeSpec(index)">✕</button>
              </div>
              <button class="btn btn-outline" style="width: 100%; margin-top: 0.5rem; font-size: 0.85rem; border-style: dashed;" @click="addSpec">+ เพิ่มข้อมูลสเปค</button>
            </div>
          </div>
        </div>
        <div class="admin-modal__footer" style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 1rem; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" :disabled="isSavingProduct" @click="showProductModal = false">ยกเลิก</button>
          <button class="btn btn-primary" data-test="save-product" :disabled="isSavingProduct" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveProduct">{{ isSavingProduct ? 'กำลังบันทึก…' : '💾 บันทึกสินค้า' }}</button>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <div class="modal-overlay" data-test="article-modal" v-if="showArticleModal" @click.self="!isSavingArticle && (showArticleModal = false)">
      <div class="modal-content glass-panel admin-modal" role="dialog" aria-modal="true" aria-labelledby="article-modal-title" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 id="article-modal-title" style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📝</span> 
            {{ editingArticle ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}
          </h3>
          <button class="close-btn" aria-label="ปิดฟอร์มบทความ" @click="showArticleModal = false">✕</button>
        </div>
        <div class="modal-body admin-modal__body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div class="form-group">
            <label>หัวข้อบทความ</label>
            <input type="text" class="form-control" v-model="articleForm.title" style="font-size: 1.1rem; font-weight: 600;" placeholder="ระบุหัวข้อบทความที่น่าสนใจ...">
          </div>

          <div class="admin-form-grid admin-form-grid--article">
            <div class="form-group" style="margin: 0;">
              <label>วันที่อัปเดต</label>
              <input type="date" class="form-control" v-model="articleForm.date">
            </div>
            <div class="form-group" style="margin: 0;">
              <label>ภาพปก (อัปโหลดรูปภาพ)</label>
              <div class="admin-media-field">
                <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                  <input type="file" accept="image/*" class="form-control" @change="uploadArticleImage" :disabled="isUploadingArticleImage" style="padding-top: 0.5rem;">
                  <small v-if="isUploadingArticleImage" style="color: var(--primary);">กำลังอัปโหลด...</small>
                  <input type="text" class="form-control" v-model="articleForm.image" placeholder="หรือวาง URL รูปภาพ" style="font-size: 0.8rem; padding: 0.4rem;" @input="articleImgError = false">
                </div>
                <div style="width: 80px; height: 80px; border-radius: var(--radius-sm); border: 1px dashed var(--hairline-strong); overflow: hidden; background: var(--canvas-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <template v-if="articleForm.image">
                    <div v-if="articleImgError" style="font-size: 0.7rem; color: var(--danger); text-align: center; padding: 0.2rem;">
                      ⚠️<br>โหลดไม่สำเร็จ
                    </div>
                    <img v-else :src="articleForm.image" style="width: 100%; height: 100%; object-fit: cover;" @error="articleImgError = true">
                  </template>
                  <div v-else style="font-size: 1.5rem; color: var(--ink-mute-2);">🖼️</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <label>เนื้อหาบทความ</label>
            <textarea class="form-control" style="height: 250px; line-height: 1.6; font-size: 0.95rem; background: var(--canvas-soft);" v-model="articleForm.content" placeholder="พิมพ์เนื้อหาที่นี่..."></textarea>
          </div>
        </div>
        <div class="admin-modal__footer" style="padding: 1.5rem; border-top: 1px solid var(--hairline); display: flex; justify-content: flex-end; gap: 1rem; background: var(--canvas-soft);">
          <button class="btn btn-outline" :disabled="isSavingArticle" @click="showArticleModal = false">ยกเลิก</button>
          <button class="btn btn-primary" data-test="save-article" :disabled="isSavingArticle" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveArticle">{{ isSavingArticle ? 'กำลังบันทึก…' : '🚀 เผยแพร่บทความ' }}</button>
        </div>
      </div>
    </div>
    <!-- Confirm Modal -->
    <div class="modal-overlay" v-if="confirmModal.show" @click.self="closeConfirm" style="z-index: 3000;">
      <div class="modal-content glass-panel admin-modal admin-modal--confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" style="max-width: 400px; padding: 2.5rem 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem; line-height: 1;">
          <span v-if="confirmModal.type === 'danger'">⚠️</span>
          <span v-else>❓</span>
        </div>
        <h3 id="confirm-modal-title" style="margin-bottom: 0.75rem; color: var(--ink); font-size: 1.25rem;">ยืนยันการทำรายการ</h3>
        <p style="color: var(--ink-mute); margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5;">{{ confirmModal.message }}</p>
        
        <div class="admin-confirm-actions">
          <button class="btn btn-outline" style="flex: 1; padding: 0.5rem 1rem;" @click="closeConfirm">ยกเลิก</button>
          <button class="btn" style="flex: 1; padding: 0.5rem 1rem; font-weight: 600;" 
            :class="confirmModal.type === 'danger' ? 'btn-danger' : 'btn-primary'" 
            :disabled="isConfirming" @click="executeConfirm">
            ตกลง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import ProfileView from '../views/ProfileView.vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useAdminStore } from '../stores/admin';
import { useToastStore } from '../stores/toast';
import { useCatalogStore } from '../stores/catalog';
import { useArticleStore } from '../stores/article';
import { adminRequest, API_BASE } from '../services/adminApi';
import {
  filterArticles,
  filterOrders,
  filterProducts,
  filterUsers
} from '../utils/adminCollectionFilters';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const adminStore = useAdminStore();
const articleStore = useArticleStore();
const toast = useToastStore();
const users = computed(() => adminStore.users);

const isUploadingArticleImage = ref(false);

const uploadArticleImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingArticleImage.value = true;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const data = await adminRequest('/upload', { method: 'POST', body: formData });
    if (data?.success) {
      const baseUrl = API_BASE.replace('/api/v1', '');
      articleForm.image = baseUrl + data.url;
      articleImgError.value = false;
      toast.success('อัปโหลดรูปภาพสำเร็จ');
    } else {
      toast.error('อัปโหลดรูปล้มเหลว: ' + (data?.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    if (!error?.sessionExpired) toast.error(error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่ออัปโหลดรูปภาพ');
  } finally {
    isUploadingArticleImage.value = false;
  }
};

const props = defineProps({
  orders: Array, categories: Array, catalog: Object, articles: Array, currentUser: Object
});
const adminTab = ref('dashboard');
const orderQuery = ref('');
const orderStatus = ref('all');
const productQuery = ref('');
const articleQuery = ref('');
const articleDate = ref('');
const userQuery = ref('');
const userRole = ref('all');
const adminTabs = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard ภาพรวม' },
  { id: 'orders', icon: '📦', label: 'รายการสั่งซื้อ (Orders)' },
  { id: 'inventory', icon: '⚙️', label: 'คลังสินค้า (Inventory)' },
  { id: 'articles', icon: '📰', label: 'จัดการบทความ (Articles)' },
  { id: 'users', icon: '👥', label: 'จัดการสมาชิก (Users)' },
  { id: 'profile', icon: '👤', label: 'ข้อมูลโปรไฟล์แอดมิน' }
];

// Chart Data (Mock 7-day revenue)
const chartData = ref({
  labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
  datasets: [{
    label: 'ยอดขาย (บาท)',
    backgroundColor: '#3ecf8e',
    borderRadius: 4,
    data: [15000, 24000, 18500, 32000, 45000, 60000, 46000]
  }]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#9a9a9a' } },
    x: { grid: { display: false }, ticks: { color: '#9a9a9a' } }
  }
};

// Users State
const fetchUsers = async () => {
  await adminStore.fetchUsers();
};

const selectAdminTab = (tabId) => {
  adminTab.value = tabId;
  if (tabId === 'users') fetchUsers();
};

const pendingUserId = ref(null);
const pendingOrderId = ref(null);
const toggleUserRole = (user) => {
  showConfirm(`คุณแน่ใจว่าต้องการเปลี่ยนสิทธิ์ของ ${user.name} หรือไม่?`, async () => {
    pendingUserId.value = user.id;
    try { return await adminStore.toggleUserRole(user); }
    finally { pendingUserId.value = null; }
  }, 'warning');
};

const deleteUser = (id) => {
  showConfirm('คุณแน่ใจว่าต้องการลบบัญชีนี้? การกระทำนี้ไม่สามารถยกเลิกได้!', async () => {
    pendingUserId.value = id;
    try { return await adminStore.deleteUser(id); }
    finally { pendingUserId.value = null; }
  }, 'danger');
};

onMounted(() => { fetchUsers(); });

const inventoryCategory = ref('cpu');
const filteredOrders = computed(() => filterOrders(props.orders || [], {
  query: orderQuery.value,
  status: orderStatus.value
}));
const filteredProducts = computed(() => filterProducts(
  props.catalog?.[inventoryCategory.value] || [],
  { query: productQuery.value }
));
const filteredArticles = computed(() => filterArticles(props.articles || [], {
  query: articleQuery.value,
  date: articleDate.value
}));
const filteredUsers = computed(() => filterUsers(users.value || [], {
  query: userQuery.value,
  role: userRole.value
}));

const resetOrderFilters = () => {
  orderQuery.value = '';
  orderStatus.value = 'all';
};
const resetProductFilters = () => { productQuery.value = ''; };
const resetArticleFilters = () => {
  articleQuery.value = '';
  articleDate.value = '';
};
const resetUserFilters = () => {
  userQuery.value = '';
  userRole.value = 'all';
};

// --- Price Sync (Phase 4.3) ---
const isSyncingPrices = ref(false);
const handleSyncPrices = async () => {
  if (isSyncingPrices.value) return;
  isSyncingPrices.value = true;
  try {
    const result = await adminStore.syncPrices(null, 200);
    if (result && result.updated > 0) {
      const catalogStore = useCatalogStore();
      await catalogStore.fetchCatalog();
    }
  } finally {
    isSyncingPrices.value = false;
  }
};

const totalSales = computed(() => props.orders.reduce((sum, ord) => sum + (ord.total_price || ord.total || 0), 0));
const pendingAssemblies = computed(() => props.orders.filter(o => o.status === 'pending' || o.status === 'assembling').length);

const getStatusLabel = (status) => {
  const map = { pending: 'รอดำเนินการ', assembling: 'กำลังประกอบ', shipped: 'จัดส่งแล้ว' };
  return map[status] || status;
};

const updateOrderStatus = async (order, event) => {
  const nextStatus = event.target.value;
  pendingOrderId.value = order.id;
  const success = await adminStore.updateOrderStatus(order.id, nextStatus);
  if (!success) event.target.value = order.status;
  pendingOrderId.value = null;
};

// --- Order Details Modal ---
const showOrderModal = ref(false);
const selectedOrder = ref(null);

const openOrderModal = (order) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};

const getHardwareItem = (category, itemId) => {
  if (!props.catalog || !props.catalog[category]) return null;
  // Fallback to checking by string if DB uses ID mismatch (e.g. string vs int)
  return props.catalog[category].find(item => item.id == itemId);
};

// --- Product CRUD ---
const showProductModal = ref(false);
const editingProduct = ref(null);
const productImgError = ref(false);
const productForm = reactive({ id: null, name: '', price: 0, image: '', specList: [] });
const isSavingProduct = ref(false);

const openProductModal = (product = null) => {
  productImgError.value = false;
  
  // Smart Spec Templates (Preload keys based on category)
  const templates = {
    cpu: ['Socket', 'Cores', 'Threads', 'Base Clock', 'Boost Clock', 'TDP'],
    mobo: ['Socket', 'Form Factor', 'Chipset', 'Memory Type', 'Max Memory'],
    ram: ['Type', 'Capacity', 'Speed', 'CAS Latency'],
    gpu: ['GPU', 'VRAM', 'Base Clock', 'Boost Clock', 'Length', 'TDP'],
    storage: ['Capacity', 'Interface', 'Form Factor', 'Read Speed', 'Write Speed'],
    psu: ['Wattage', 'Form Factor', 'Efficiency', 'Modular'],
    case: ['Form Factor', 'Max GPU Length', 'Max CPU Cooler Height', 'Type']
  };
  
  const categoryKeys = templates[inventoryCategory.value] || ['Specification'];

  if (product) {
    editingProduct.value = product;
    productForm.id = product.id;
    productForm.name = product.name;
    productForm.price = product.price;
    productForm.image = product.image || '';
    
    // Parse JSON object to array of {key, value} for UI, ensuring preset keys are included
    const specs = { ...(product.specifications || {}) };
    const typedByCategory = {
      cpu: { Socket: product.socket, Cores: product.cores, Threads: product.threads, TDP: product.tdp },
      mobo: { Socket: product.socket, 'Form Factor': product.formFactor, 'Memory Type': product.ramType },
      ram: { Type: product.type, Capacity: product.capacityGb, Speed: product.busSpeed },
      gpu: { GPU: product.chipset, VRAM: product.vramGb, Length: product.lengthMm, TDP: product.tdp },
      storage: { Type: product.type, Capacity: product.capacityGb, 'Read Speed': product.readSpeedMbs, 'Write Speed': product.writeSpeedMbs },
      psu: { Wattage: product.wattage, Efficiency: product.efficiencyRating },
      case: { 'Form Factor': product.formFactorSupport, 'Max GPU Length': product.maxGpuLength }
    };
    Object.entries(typedByCategory[inventoryCategory.value] || {}).forEach(([key, value]) => {
      if ((specs[key] === undefined || specs[key] === '') && value != null) specs[key] = value;
    });
    const mergedSpecs = categoryKeys.map(key => ({
      key, 
      value: specs[key] !== undefined ? String(specs[key]) : ''
    }));

    // Add any existing keys that are not in the templates
    Object.entries(specs).forEach(([key, value]) => {
      if (!categoryKeys.includes(key)) {
        mergedSpecs.push({ key, value: String(value) });
      }
    });
    
    productForm.specList = mergedSpecs;
  } else {
    editingProduct.value = null;
    productForm.id = null;
    productForm.name = '';
    productForm.price = 0;
    productForm.image = `/images/${inventoryCategory.value}.png`;
    
    productForm.specList = categoryKeys.map(key => ({ key, value: '' }));
  }
  showProductModal.value = true;
};

const addSpec = () => productForm.specList.push({ key: '', value: '' });
const removeSpec = (index) => productForm.specList.splice(index, 1);

const saveProduct = async () => {
  if (isSavingProduct.value) return;
  // Convert specList array back to JSON object
  const specObj = {};
  productForm.specList.forEach(item => {
    if (item.key.trim()) specObj[item.key.trim()] = item.value;
  });

  isSavingProduct.value = true;
  let saved = false;
  try {
    saved = await adminStore.saveProduct({
      category: inventoryCategory.value,
      product: {
        id: productForm.id,
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        specifications: specObj
      }
    });
  } finally { isSavingProduct.value = false; }
  if (saved) showProductModal.value = false;
};

const deleteProduct = (id) => {
  showConfirm('ยืนยันการลบสินค้านี้?', () => {
    return adminStore.deleteProduct({
      category: inventoryCategory.value,
      productId: id
    });
  }, 'danger');
};

// --- Article CRUD ---
const showArticleModal = ref(false);
const editingArticle = ref(null);
const articleImgError = ref(false);
const articleForm = reactive({ id: 0, title: '', date: '', image: '', content: '' });
const isSavingArticle = ref(false);

const openArticleModal = (article = null) => {
  articleImgError.value = false;
  if (article) {
    editingArticle.value = article;
    articleForm.id = article.id;
    articleForm.title = article.title;
    articleForm.date = article.date;
    articleForm.image = article.image || '';
    articleForm.content = article.content || '';
  } else {
    editingArticle.value = null;
    articleForm.id = null;
    articleForm.title = '';
    articleForm.date = new Date().toISOString().split('T')[0];
    articleForm.image = 'https://placehold.co/600x400/1e1e2e/00e5ff?text=Article';
    articleForm.content = '';
  }
  showArticleModal.value = true;
};

const saveArticle = async () => {
  if (isSavingArticle.value) return;
  isSavingArticle.value = true;
  let saved = false;
  try { saved = await articleStore.saveArticle({ ...articleForm }); }
  finally { isSavingArticle.value = false; }
  if (saved) showArticleModal.value = false;
};

const deleteArticle = (id) => {
  showConfirm('ยืนยันการลบบทความนี้?', () => {
    return articleStore.deleteArticle(id);
  }, 'danger');
};

// --- Custom Confirm Modal ---
const confirmModal = reactive({
  show: false,
  message: '',
  onConfirm: null,
  type: 'danger'
});
const isConfirming = ref(false);

const showConfirm = (message, onConfirmCallback, type = 'danger') => {
  confirmModal.message = message;
  confirmModal.onConfirm = onConfirmCallback;
  confirmModal.type = type;
  confirmModal.show = true;
};

const closeConfirm = () => {
  confirmModal.show = false;
  confirmModal.onConfirm = null;
};

const executeConfirm = async () => {
  if (!confirmModal.onConfirm || isConfirming.value) return;
  isConfirming.value = true;
  try { await confirmModal.onConfirm(); }
  finally {
    isConfirming.value = false;
    closeConfirm();
  }
};
</script>

<style scoped>
.admin-view { 
  padding-top: 2rem; 
  padding-bottom: 5rem;
  min-height: 100vh;
  /* Night Mode Theme Overrides */
  --canvas: var(--canvas-night);
  --canvas-soft: var(--canvas-night-soft);
  --ink: var(--on-dark);
  --ink-mute: #a0a0a0;
  --hairline: #333333;
  --hairline-cool: #2a2a2a;
  background-color: #111111;
  color: var(--ink);
}
.admin-heading { margin-bottom: 2rem; }
.admin-heading p { margin: 0.35rem 0 0; }
.admin-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: var(--space-lg); align-items: start; }
.admin-main { min-width: 0; }

.admin-sidebar { 
  background: var(--canvas); border-radius: var(--radius-lg); 
  border: 1px solid var(--hairline); overflow: hidden; padding: 0.5rem 0 0 0; 
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; min-height: 500px;
  position: sticky; top: 1rem;
}
.admin-menu { list-style: none; margin: 0; padding: 0; }
.admin-menu li { border-bottom: 1px solid var(--hairline-cool); }
.admin-menu li:last-child { border-bottom: none; }
.admin-menu button {
  width: 100%; padding: 1rem 1.5rem; cursor: pointer; border: 1px solid transparent;
  background: transparent; transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
  display: flex; align-items: center; gap: 0.75rem; text-align: left;
  font: inherit; font-size: var(--text-sm); font-weight: 500; color: var(--ink-mute);
}
.admin-menu button:hover { background: var(--canvas-soft); color: var(--ink); }
.admin-menu button.active { background: var(--canvas-soft); border-color: var(--hairline-strong); color: var(--primary-deep); font-weight: 600;}

.admin-card {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.admin-section-card { padding: 0; }
.admin-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.admin-toolbar__actions, .admin-actions { display: flex; align-items: center; gap: 0.75rem; }
.admin-category-select { width: 200px; }
.operations-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
  padding: 1.5rem 1.5rem 1rem;
}
.operations-header h3 { margin: 0; color: var(--ink); font-size: var(--text-lg); line-height: 1.35; }
.operations-description { margin: 0.35rem 0 0; color: var(--ink-mute); font-size: var(--text-sm); line-height: 1.55; }
.operations-count {
  flex: 0 0 auto; padding: 0.35rem 0.7rem; border: 1px solid var(--hairline);
  border-radius: var(--radius-pill); color: var(--primary-deep); background: var(--canvas-soft);
  font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600;
}
.operations-toolbar {
  display: grid; grid-template-columns: minmax(14rem, 1fr) minmax(10rem, auto) auto minmax(0, auto);
  align-items: end; gap: 0.75rem; padding: 0 1.5rem 1.25rem;
}
.operations-search, .operations-filter { display: grid; gap: 0.4rem; min-width: 0; }
.operations-search > span, .operations-filter > span { color: var(--ink-mute); font-size: var(--text-xs); font-weight: 600; }
.operations-search .form-control, .operations-filter .form-control { width: 100%; min-height: 40px; }
.operations-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; }
.operations-actions .btn, .operations-toolbar > .btn { min-height: 40px; white-space: nowrap; }
.admin-table-region { max-width: 100%; max-height: min(66vh, 720px); overflow: auto; border-top: 1px solid var(--hairline-cool); }
.admin-mobile-list { display: none; padding: 1rem; }
.admin-mobile-card { padding: 1rem; border: 1px solid var(--hairline-cool); background: var(--canvas-soft); }
.admin-mobile-card + .admin-mobile-card { margin-top: 0.75rem; }
.admin-mobile-card__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.admin-mobile-card__heading strong { overflow-wrap: anywhere; }
.admin-mobile-card__id { color: var(--ink-mute); font-family: var(--font-mono); font-size: var(--text-xs); }
.admin-mobile-card__facts { display: grid; gap: 0.75rem; margin: 1rem 0; }
.admin-mobile-card__facts div { display: grid; grid-template-columns: minmax(5rem, 0.4fr) 1fr; gap: 0.75rem; }
.admin-mobile-card__facts dt { color: var(--ink-mute); }
.admin-mobile-card__facts dd { margin: 0; overflow-wrap: anywhere; }
.admin-mobile-card__media { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; color: var(--ink-mute); }
.admin-mobile-card__media img { width: 64px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); }
.admin-empty { margin: 0; padding: 2rem 1rem; text-align: center; color: var(--ink-mute); }
.admin-no-results { display: grid; justify-items: center; gap: 0.85rem; border-top: 1px solid var(--hairline-cool); }
.admin-no-results p { margin: 0; }
.admin-chart-card { margin-top: 2rem; padding: 2rem; }
.admin-chart { height: clamp(240px, 32vw, 320px); }
.order-meta-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.5rem; }
.admin-media-field { display: flex; gap: 1rem; align-items: flex-start; }
.admin-media-field > * { min-width: 0; }
.admin-spec-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.admin-confirm-actions { display: flex; justify-content: center; gap: 1rem; }

.stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
.stat-card { 
  padding: 1.5rem; border-radius: var(--radius-lg); text-align: left; 
  background: var(--canvas); border: 1px solid var(--hairline); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 0.5rem;
}
.stat-title { color: var(--ink-mute); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-val { font-size: var(--text-3xl); font-weight: 700; color: var(--ink); font-family: var(--font-sans); }
.stat-insight { font-size: 0.8rem; color: var(--ink-mute-2); font-weight: 500; }
.stat-insight.positive { color: var(--primary-deep); }
.stat-insight.alert { color: var(--warning); }

.data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.data-table th, .data-table td { padding: 0.85rem 1rem; font-size: var(--text-sm); border-bottom: 1px solid var(--hairline-cool); vertical-align: middle; }
.data-table thead { position: sticky; top: 0; z-index: 3; }
.data-table th { font-weight: 600; color: var(--ink-mute); background: var(--canvas-soft); letter-spacing: 0.025em; font-size: 0.75rem; white-space: nowrap; }
.data-table tr:hover td { background: var(--canvas-soft); }
.data-table td { color: var(--ink); }
#admin-panel-articles .data-table th:nth-child(3),
#admin-panel-articles .data-table td:nth-child(3) { width: 50%; }
#admin-panel-articles .data-table td:nth-child(3) { max-width: 34rem; }
.article-title-text {
  display: -webkit-box; overflow: hidden; overflow-wrap: anywhere;
  -webkit-box-orient: vertical; -webkit-line-clamp: 2;
}

.badge { display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em; }
.status-badge.pending { background: var(--warning-alpha); color: var(--warning); border: 1px solid var(--warning-border); }
.status-badge.assembling { background: var(--primary-alpha); color: var(--primary-deep); border: 1px solid var(--primary-border); }
.status-badge.completed { background: var(--success-alpha); color: var(--success); border: 1px solid var(--success-border); }

/* Modal specific overrides */
.modal-overlay { 
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
  background: var(--overlay); backdrop-filter: blur(4px); 
  display: flex; align-items: center; justify-content: center; 
  z-index: 2000; 
}
.modal-content {
  width: 100%; max-width: 700px;
  background: var(--canvas-night);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}
.admin-modal { display: flex; flex-direction: column; max-height: calc(100dvh - 2rem); }
.admin-modal__body { min-height: 0; flex: 1 1 auto; }
.admin-modal__footer { flex: 0 0 auto; }
.admin-form-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.5rem; margin-bottom: 1rem; }
.admin-form-grid--article { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--hairline-cool); background: rgba(0,0,0,0.2); }
.modal-body { padding: 2rem; max-height: 75vh; overflow-y: auto; }
.close-btn { background: none; border: none; font-size: 1.25rem; color: var(--ink-mute); cursor: pointer; transition: color var(--transition-fast); }
.close-btn:hover { color: var(--danger); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--ink-mute); font-weight: 500;}

.btn-danger { background: var(--error-bg, #441111); color: var(--error, #ff4444); border: 1px solid var(--error, #ff4444); }
.btn-danger:hover { background: var(--error, #ff4444); color: #fff; }

.admin-tabs button:focus-visible,
.admin-table-region:focus-visible,
.operations-toolbar .form-control:focus-visible,
.operations-toolbar .btn:focus-visible,
.admin-mobile-card .btn:focus-visible,
.admin-modal .btn:focus-visible,
.admin-modal .form-control:focus-visible,
.close-btn:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
}

@media (max-width: 1024px) {
  .admin-layout { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .admin-sidebar {
    top: 0; z-index: 50; min-height: 0; padding: 0;
    display: grid; grid-template-columns: minmax(0, 1fr) auto;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    overflow: visible;
  }
  .admin-tabs {
    position: sticky; top: 0; z-index: 51;
    display: flex; min-width: 0; overflow-x: auto; overscroll-behavior-inline: contain;
    scrollbar-width: thin; background: var(--canvas);
  }
  .admin-menu li { flex: 0 0 auto; border: 0; }
  .admin-menu button { width: auto; min-height: 48px; padding: 0.75rem 1rem; white-space: nowrap; }
  .admin-return { margin: 0 !important; padding: 0.35rem !important; border: 0 !important; background: var(--canvas); }
  .admin-return .btn { min-height: 44px; white-space: nowrap; }
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .operations-toolbar { grid-template-columns: minmax(12rem, 1fr) minmax(10rem, 0.65fr) auto; }
  .operations-actions { grid-column: 1 / -1; justify-content: flex-start; }
  .admin-toolbar { align-items: flex-start; flex-wrap: wrap; }
  .admin-toolbar__actions { flex-wrap: wrap; justify-content: flex-end; }
  .admin-table-region .data-table { min-width: 760px; }
  .admin-table-region .data-table th:first-child,
  .admin-table-region .data-table td:first-child { position: sticky; left: 0; z-index: 1; background: var(--canvas); }
  .admin-table-region .data-table th:first-child { background: var(--canvas-soft); z-index: 2; }
}

@media (max-width: 640px) {
  .admin-view { padding-top: 1rem; padding-bottom: 3rem; }
  .admin-heading { margin-bottom: 1rem; }
  .admin-heading h2 { font-size: clamp(1.25rem, 6vw, var(--text-2xl)) !important; line-height: 1.25; }
  .admin-heading p { font-size: var(--text-sm); }
  .admin-menu button { min-height: 44px; padding: 0.65rem 0.85rem; }
  .admin-return__label { display: none; }
  .admin-return .btn { width: 44px !important; padding: 0; }
  .stat-grid { grid-template-columns: minmax(0, 1fr); }
  .stat-card { padding: 1rem; }
  .stat-val { font-size: var(--text-2xl); }
  .admin-chart-card { margin-top: 1rem; padding: 1rem; }
  .admin-chart { height: clamp(220px, 80vw, 280px); }
  .admin-section-card { padding: 0; }
  .operations-header { align-items: center; padding: 1rem; gap: 0.75rem; }
  .operations-description { font-size: var(--text-xs); }
  .operations-count { padding-inline: 0.6rem; }
  .operations-toolbar { grid-template-columns: minmax(0, 1fr); padding: 0 1rem 1rem; }
  .operations-actions { grid-column: auto; display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }
  .operations-actions .btn, .operations-toolbar > .btn { width: 100%; min-height: 44px; }
  .admin-toolbar { flex-direction: column; align-items: stretch; margin: 0; padding: 1rem; }
  .admin-toolbar__actions { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }
  .admin-toolbar__actions .btn, .admin-category-select { width: 100%; min-height: 44px; }
  .admin-table-region { display: none; }
  .admin-mobile-list { display: block; }
  .admin-mobile-card { border-radius: var(--radius-md); }
  .admin-mobile-card__facts div { grid-template-columns: minmax(4.5rem, 0.4fr) minmax(0, 1fr); }
  .admin-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .admin-actions--stack { grid-template-columns: minmax(0, 1fr); }
  .admin-actions .btn, .admin-actions .form-control { width: 100%; min-height: 44px; }
  .modal-overlay { padding: 0; align-items: stretch; }
  .admin-modal:not(.admin-modal--confirm) {
    width: 100dvw; height: 100dvh; max-width: none !important; max-height: none;
    border: 0; border-radius: 0;
  }
  .admin-modal--confirm { width: calc(100dvw - 2rem); max-height: calc(100dvh - 2rem); margin: auto; padding: 1.5rem 1rem !important; }
  .modal-header { position: sticky; top: 0; z-index: 2; padding: 1rem !important; }
  .modal-header h3 { min-width: 0; font-size: 1rem !important; line-height: 1.35; }
  .close-btn { min-width: 44px; min-height: 44px; flex: 0 0 44px; }
  .admin-modal__body { max-height: none !important; padding: 1rem !important; }
  .admin-modal__footer {
    position: sticky; bottom: 0; z-index: 2; padding: 0.75rem 1rem !important;
    display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .admin-modal__footer .btn { width: 100%; min-height: 44px; padding-inline: 0.75rem !important; }
  .admin-form-grid, .admin-form-grid--article { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .order-meta-grid { grid-template-columns: minmax(0, 1fr); }
  .admin-media-field { align-items: stretch; gap: 0.75rem; }
  .admin-spec-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) 44px; }
  .admin-spec-row .btn { min-height: 44px; padding: 0 !important; }
  .admin-confirm-actions { gap: 0.75rem; }
  .admin-confirm-actions .btn { min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .admin-view *, .admin-view *::before, .admin-view *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
