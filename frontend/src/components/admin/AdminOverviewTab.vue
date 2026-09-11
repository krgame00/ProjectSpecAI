<template>
  <div id="admin-panel-dashboard" role="tabpanel" aria-labelledby="admin-tab-dashboard">
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-title">ยอดขายรวม (Gross Revenue)</div>
        <div class="stat-val">฿{{ totalSales.toLocaleString() }}</div>
        <div class="stat-insight positive">↑ 12% เทียบกับเดือนที่แล้ว</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">คำสั่งซื้อทั้งหมด (Total Orders)</div>
        <div class="stat-val">{{ (orders || []).length }}</div>
        <div class="stat-insight">ยอดซื้อเฉลี่ย ฿{{ (orders || []).length ? Math.floor(totalSales / (orders || []).length).toLocaleString() : 0 }}/บิล</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">รอจัดประกอบ (Pending Assembly)</div>
        <div class="stat-val" style="color: var(--warning);">{{ pendingAssemblies }}</div>
        <div class="stat-insight alert">ต้องดำเนินการโดยด่วน</div>
      </div>
    </div>
    
    <div class="admin-card admin-chart-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <h3 style="margin: 0; color: var(--ink);">สถิติยอดขาย 7 วันย้อนหลัง</h3>
        <span v-if="chartData.isDemo" class="badge" style="background: rgba(234, 179, 8, 0.15); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.3); font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px;">
          📊 ข้อมูลตัวอย่าง (Demo Benchmark)
        </span>
        <span v-else class="badge badge-completed" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px;">
          ✓ ข้อมูลจริงจากออเดอร์
        </span>
      </div>
      <div class="admin-chart">
        <Bar :data="chartData" :options="chartOptions" v-if="chartData.labels" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  }
});

const totalSales = computed(() => (props.orders || []).reduce((sum, ord) => sum + (ord.total_price || ord.total || 0), 0));
const pendingAssemblies = computed(() => (props.orders || []).filter(o => o.status === 'pending' || o.status === 'assembling').length);

const chartData = computed(() => {
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const now = new Date();
  const last7Days = [];
  const dailyTotals = [0, 0, 0, 0, 0, 0, 0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Days.push({
      dateStr: d.toISOString().slice(0, 10),
      dayName: dayNames[d.getDay()]
    });
  }

  const orderList = Array.isArray(props.orders) ? props.orders : [];
  let hasRealOrders = false;

  orderList.forEach(order => {
    const rawDate = order.created_at || order.date;
    if (!rawDate) return;
    const orderDate = String(rawDate).slice(0, 10);
    const dayIdx = last7Days.findIndex(d => d.dateStr === orderDate);
    if (dayIdx !== -1) {
      dailyTotals[dayIdx] += (Number(order.total_price) || Number(order.total) || 0);
      hasRealOrders = true;
    }
  });

  if (hasRealOrders) {
    return {
      isDemo: false,
      labels: last7Days.map(d => d.dayName),
      datasets: [{
        label: 'ยอดขายจริง (บาท)',
        backgroundColor: '#3ecf8e',
        borderRadius: 4,
        data: dailyTotals
      }]
    };
  }

  return {
    isDemo: true,
    labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
    datasets: [{
      label: 'ยอดขายตัวอย่าง (บาท)',
      backgroundColor: 'rgba(62, 207, 142, 0.65)',
      borderRadius: 4,
      data: [15000, 24000, 18500, 32000, 45000, 60000, 46000]
    }]
  };
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
</script>
