<template>
  <div class="container admin-view">
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: var(--text-2xl); color: var(--accent); text-shadow: var(--accent-glow);">ระบบจัดการหลังบ้าน (Admin Panel)</h2>
      <p style="color: var(--muted);">ภาพรวมร้านค้า การสั่งซื้อ สินค้าคงคลัง และบทความ</p>
    </div>

    <div class="admin-layout">
      <aside class="admin-sidebar">
        <ul class="admin-menu">
          <li :class="{active: adminTab === 'dashboard'}" @click="adminTab = 'dashboard'">📊 Dashboard ภาพรวม</li>
          <li :class="{active: adminTab === 'orders'}" @click="adminTab = 'orders'">📦 รายการสั่งซื้อ (Orders)</li>
          <li :class="{active: adminTab === 'inventory'}" @click="adminTab = 'inventory'">⚙️ คลังสินค้า (Inventory)</li>
          <li :class="{active: adminTab === 'articles'}" @click="adminTab = 'articles'">📰 จัดการบทความ (Articles)</li>
          <li :class="{active: adminTab === 'users'}" @click="fetchUsers(); adminTab = 'users'">👥 จัดการสมาชิก (Users)</li>
          <li :class="{active: adminTab === 'profile'}" @click="adminTab = 'profile'">👤 ข้อมูลโปรไฟล์แอดมิน</li>
        </ul>
        <div style="padding: 1rem; margin-top: auto; border-top: 1px solid var(--hairline-cool);">
          <button class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" @click="$router.push('/')">
            ⬅️ กลับหน้าร้านค้า
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <!-- Dashboard Tab -->
        <div v-if="adminTab === 'dashboard'">
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
          
          <div class="admin-card" style="margin-top: 2rem; padding: 2rem;">
            <h3 style="margin-bottom: 1.5rem; color: var(--ink);">สถิติยอดขาย 7 วันย้อนหลัง</h3>
            <div style="height: 300px;">
              <Bar :data="chartData" :options="chartOptions" v-if="chartData.labels" />
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="adminTab === 'users'" class="admin-card">
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
              <tr v-for="user in users" :key="user.id">
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
                    <button class="btn btn-outline btn-sm" @click="toggleUserRole(user)" :disabled="user.id === currentUser.id">
                      ปรับสิทธิ์
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="deleteUser(user.id)" :disabled="user.id === currentUser.id">
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Admin Profile Tab -->
        <div v-if="adminTab === 'profile'">
          <ProfileView />
        </div>

        <!-- Orders Tab -->
        <div v-if="adminTab === 'orders'" class="admin-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>หมายเลข (ID)</th>
                <th>ลูกค้า (Customer)</th>
                <th>รูปแบบประกอบ</th>
                <th>ยอดสุทธิ (Total)</th>
                <th>สถานะ (Status)</th>
                <th>จัดการ (Action)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
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
                    <select class="form-control" style="padding: 0.25rem 0.5rem; width: auto; background: var(--canvas); color: var(--ink); height: 32px;" :value="order.status" @change="$emit('update-order-status', order.id, $event.target.value)">
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
              <tr v-if="orders.length === 0">
                <td colspan="6" style="text-align: center; color: var(--muted); padding: 2rem;">ยังไม่มีคำสั่งซื้อในระบบ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Inventory Tab -->
        <div v-if="adminTab === 'inventory'" class="admin-card" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3>จัดการสินค้าในระบบ</h3>
            <div style="display: flex; gap: 1rem;">
              <select class="form-control" style="width: 200px;" v-model="inventoryCategory">
                <option v-for="cat in categories" :key="'inv-'+cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <button class="btn btn-primary" @click="openProductModal()">+ เพิ่มสินค้า</button>
            </div>
          </div>
          <table class="data-table" v-if="catalog[inventoryCategory]">
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
              <tr v-for="item in catalog[inventoryCategory]" :key="'inv-item-'+item.id">
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

        <!-- Articles Tab -->
        <div v-if="adminTab === 'articles'" class="admin-card" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3>จัดการบทความ</h3>
            <button class="btn btn-primary" @click="openArticleModal()">+ เพิ่มบทความ</button>
          </div>
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
              <tr v-for="article in articles" :key="'art-'+article.id">
                <td style="font-family: var(--font-mono); color: var(--muted);">{{ article.id }}</td>
                <td><img :src="article.image" style="width: 50px; height: 30px; object-fit: cover; border-radius: 4px;" /></td>
                <td>{{ article.title }}</td>
                <td>{{ article.date }}</td>
                <td>
                  <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-right: 0.5rem;" @click="openArticleModal(article)">แก้ไข</button>
                  <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--error-bg); color: var(--error); border: 1px solid var(--error);" @click="deleteArticle(article.id)">ลบ</button>
                </td>
              </tr>
              <tr v-if="!articles || articles.length === 0">
                <td colspan="5" style="text-align: center; color: var(--muted); padding: 2rem;">ยังไม่มีบทความในระบบ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Order Details Modal -->
    <div class="modal-overlay" v-if="showOrderModal" @click.self="showOrderModal = false">
      <div class="modal-content glass-panel" style="max-width: 600px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem;">
            <span>📄</span> 
            รายละเอียดคำสั่งซื้อ {{ selectedOrder?.id }}
          </h3>
          <button class="close-btn" @click="showOrderModal = false">✕</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 1.5rem;">
          <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--ink-mute); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
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
        <div style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" @click="showOrderModal = false">ปิด</button>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" v-if="showProductModal" @click.self="showProductModal = false">
      <div class="modal-content glass-panel" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📦</span> 
            {{ editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ในคลัง' }}
          </h3>
          <button class="close-btn" @click="showProductModal = false">✕</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;">
            <div class="form-group" style="margin: 0;">
              <label>รหัสสินค้า (ID)</label>
              <input type="text" class="form-control" v-model="productForm.id" :disabled="!!editingProduct" style="background: rgba(0,0,0,0.1);">
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
            <input type="text" class="form-control" v-model="productForm.name" placeholder="ระบุชื่อสินค้าแบบเต็ม...">
          </div>

          <div class="form-group">
            <label>รูปภาพ (URL)</label>
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
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
              <div v-for="(spec, index) in productForm.specList" :key="index" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <input type="text" class="form-control" v-model="spec.key" placeholder="Key" style="flex: 1; padding: 0.4rem; font-size: 0.85rem;">
                <input type="text" class="form-control" v-model="spec.value" placeholder="Value" style="flex: 2; padding: 0.4rem; font-size: 0.85rem;">
                <button class="btn btn-outline-danger" style="padding: 0.4rem 0.6rem;" @click="removeSpec(index)">✕</button>
              </div>
              <button class="btn btn-outline" style="width: 100%; margin-top: 0.5rem; font-size: 0.85rem; border-style: dashed;" @click="addSpec">+ เพิ่มข้อมูลสเปค</button>
            </div>
          </div>
        </div>
        <div style="padding: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: flex-end; gap: 1rem; background: rgba(0,0,0,0.2);">
          <button class="btn btn-outline" @click="showProductModal = false">ยกเลิก</button>
          <button class="btn btn-primary" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveProduct">💾 บันทึกสินค้า</button>
        </div>
      </div>
    </div>

    <!-- Article Modal -->
    <div class="modal-overlay" v-if="showArticleModal" @click.self="showArticleModal = false">
      <div class="modal-content glass-panel" style="max-width: 700px; padding: 0;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);">
          <h3 style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">📝</span> 
            {{ editingArticle ? 'แก้ไขบทความ' : 'เขียนบทความใหม่' }}
          </h3>
          <button class="close-btn" @click="showArticleModal = false">✕</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 2rem;">
          
          <div class="form-group">
            <label>หัวข้อบทความ</label>
            <input type="text" class="form-control" v-model="articleForm.title" style="font-size: 1.1rem; font-weight: 600;" placeholder="ระบุหัวข้อบทความที่น่าสนใจ...">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; margin-bottom: 1rem;">
            <div class="form-group" style="margin: 0;">
              <label>วันที่อัปเดต</label>
              <input type="date" class="form-control" v-model="articleForm.date">
            </div>
            <div class="form-group" style="margin: 0;">
              <label>ภาพปก (อัปโหลดรูปภาพ)</label>
              <div style="display: flex; gap: 1rem; align-items: flex-start;">
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
        <div style="padding: 1.5rem; border-top: 1px solid var(--hairline); display: flex; justify-content: flex-end; gap: 1rem; background: var(--canvas-soft);">
          <button class="btn btn-outline" @click="showArticleModal = false">ยกเลิก</button>
          <button class="btn btn-primary" style="padding: 0.5rem 2rem; font-weight: 600;" @click="saveArticle">🚀 เผยแพร่บทความ</button>
        </div>
      </div>
    </div>
    <!-- Confirm Modal -->
    <div class="modal-overlay" v-if="confirmModal.show" @click.self="closeConfirm" style="z-index: 3000;">
      <div class="modal-content glass-panel" style="max-width: 400px; padding: 2.5rem 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem; line-height: 1;">
          <span v-if="confirmModal.type === 'danger'">⚠️</span>
          <span v-else>❓</span>
        </div>
        <h3 style="margin-bottom: 0.75rem; color: var(--ink); font-size: 1.25rem;">ยืนยันการทำรายการ</h3>
        <p style="color: var(--ink-mute); margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5;">{{ confirmModal.message }}</p>
        
        <div style="display: flex; justify-content: center; gap: 1rem;">
          <button class="btn btn-outline" style="flex: 1; padding: 0.5rem 1rem;" @click="closeConfirm">ยกเลิก</button>
          <button class="btn" style="flex: 1; padding: 0.5rem 1rem; font-weight: 600;" 
            :class="confirmModal.type === 'danger' ? 'btn-danger' : 'btn-primary'" 
            @click="executeConfirm">
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const adminStore = useAdminStore();
const users = computed(() => adminStore.users);

const isUploadingArticleImage = ref(false);

const uploadArticleImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingArticleImage.value = true;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      const baseUrl = API_BASE.replace('/api/v1', '');
      articleForm.image = baseUrl + data.url;
      articleImgError.value = false;
    } else {
      alert('อัปโหลดรูปล้มเหลว: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่ออัปโหลดรูปภาพ');
  } finally {
    isUploadingArticleImage.value = false;
  }
};

const props = defineProps({
  orders: Array, categories: Array, catalog: Object, articles: Array, currentUser: Object
});
const emit = defineEmits(['save-product', 'delete-product', 'save-article', 'delete-article', 'update-order-status']);

const adminTab = ref('dashboard');

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

const toggleUserRole = (user) => {
  showConfirm(`คุณแน่ใจว่าต้องการเปลี่ยนสิทธิ์ของ ${user.name} หรือไม่?`, async () => {
    await adminStore.toggleUserRole(user);
    alert('เปลี่ยนสิทธิ์สำเร็จ');
  }, 'warning');
};

const deleteUser = (id) => {
  showConfirm('คุณแน่ใจว่าต้องการลบบัญชีนี้? การกระทำนี้ไม่สามารถยกเลิกได้!', async () => {
    await adminStore.deleteUser(id);
    alert('ลบบัญชีสำเร็จ');
  }, 'danger');
};

onMounted(() => { fetchUsers(); });

const inventoryCategory = ref('cpu');

const totalSales = computed(() => props.orders.reduce((sum, ord) => sum + (ord.total_price || ord.total || 0), 0));
const pendingAssemblies = computed(() => props.orders.filter(o => o.status === 'pending' || o.status === 'assembling').length);

const getStatusLabel = (status) => {
  const map = { pending: 'รอดำเนินการ', assembling: 'กำลังประกอบ', shipped: 'จัดส่งแล้ว' };
  return map[status] || status;
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
const productForm = reactive({ id: '', name: '', price: 0, image: '', specList: [] });

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
    const specs = product.specifications || {};
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
    productForm.id = `temp-${inventoryCategory.value}-${Date.now().toString().slice(-4)}`;
    productForm.name = '';
    productForm.price = 0;
    productForm.image = `/images/${inventoryCategory.value}.png`;
    
    productForm.specList = categoryKeys.map(key => ({ key, value: '' }));
  }
  showProductModal.value = true;
};

const addSpec = () => productForm.specList.push({ key: '', value: '' });
const removeSpec = (index) => productForm.specList.splice(index, 1);

const saveProduct = () => {
  // Convert specList array back to JSON object
  const specObj = {};
  productForm.specList.forEach(item => {
    if (item.key.trim()) specObj[item.key.trim()] = item.value;
  });

  emit('save-product', {
    category: inventoryCategory.value,
    product: {
      id: productForm.id,
      name: productForm.name,
      price: productForm.price,
      image: productForm.image,
      specifications: specObj
    }
  });
  showProductModal.value = false;
};

const deleteProduct = (id) => {
  showConfirm('ยืนยันการลบสินค้านี้?', () => {
    emit('delete-product', {
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

const saveArticle = () => {
  emit('save-article', { ...articleForm });
  showArticleModal.value = false;
};

const deleteArticle = (id) => {
  showConfirm('ยืนยันการลบบทความนี้?', () => {
    emit('delete-article', id);
  }, 'danger');
};

// --- Custom Confirm Modal ---
const confirmModal = reactive({
  show: false,
  message: '',
  onConfirm: null,
  type: 'danger'
});

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

const executeConfirm = () => {
  if (confirmModal.onConfirm) confirmModal.onConfirm();
  closeConfirm();
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
.admin-layout { display: grid; grid-template-columns: 250px 1fr; gap: var(--space-lg); align-items: start; }

.admin-sidebar { 
  background: var(--canvas); border-radius: var(--radius-lg); 
  border: 1px solid var(--hairline); overflow: hidden; padding: 0.5rem 0 0 0; 
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; min-height: 500px;
}
.admin-menu { list-style: none; margin: 0; padding: 0; }
.admin-menu li { 
  padding: 1rem 1.5rem; cursor: pointer; border-bottom: 1px solid var(--hairline-cool); 
  transition: all var(--transition-fast); display: flex; align-items: center; gap: 0.75rem; 
  font-size: var(--text-sm); font-weight: 500; color: var(--ink-mute);
}
.admin-menu li:last-child { border-bottom: none; }
.admin-menu li:hover { background: var(--canvas-soft); color: var(--ink); }
.admin-menu li.active { background: var(--canvas-soft); border-left: 4px solid var(--primary); color: var(--primary-deep); font-weight: 600;}

.admin-card {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); }
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
.data-table th, .data-table td { padding: 1.25rem 1.5rem; font-size: var(--text-sm); border-bottom: 1px solid var(--hairline-cool); }
.data-table th { font-weight: 600; color: var(--ink-mute); background: var(--canvas-soft); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem;}
.data-table tr:hover td { background: var(--canvas-soft); }
.data-table td { color: var(--ink); }

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
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--hairline-cool); background: rgba(0,0,0,0.2); }
.modal-body { padding: 2rem; max-height: 75vh; overflow-y: auto; }
.close-btn { background: none; border: none; font-size: 1.25rem; color: var(--ink-mute); cursor: pointer; transition: color var(--transition-fast); }
.close-btn:hover { color: var(--danger); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--ink-mute); font-weight: 500;}

.btn-danger { background: var(--error-bg, #441111); color: var(--error, #ff4444); border: 1px solid var(--error, #ff4444); }
.btn-danger:hover { background: var(--error, #ff4444); color: #fff; }

@media (max-width: 820px) {
  .admin-layout { grid-template-columns: 1fr; }
}
</style>
