<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>公司代號</th>
          <th>公司名稱</th>
          <th>產業類別</th>
          <th>報告月份</th>
          <th>當月營收</th>
          <th>MoM 增減</th>
          <th>YoY 增減</th>
          <th>累計年增率</th>
          <th>備註</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in data" :key="idx">
          <td>{{ item.companyId }}</td>
          <td>{{ item.companyName }}</td>
          <td>{{ item.industryCategory }}</td>
          <td>{{ formatYearMonth(item.reportYearMonth) }}</td>
          <td class="text-right">{{ formatNumber(item.currentMonthRevenue) }}</td>

          <!-- MoM 增減 -->
          <td :class="['text-right', getPercentClass(item.moMChangePercent)]">
            <span v-if="parseFloat(item.moMChangePercent) > 0">🔺</span>
            <span v-else-if="parseFloat(item.moMChangePercent) < 0">🔻</span>
            {{ formatPercent(item.moMChangePercent) }}
          </td>

          <!-- YoY 增減 -->
          <td :class="['text-right', getPercentClass(item.yoYChangePercent)]">
            <span v-if="parseFloat(item.yoYChangePercent) > 0">🔺</span>
            <span v-else-if="parseFloat(item.yoYChangePercent) < 0">🔻</span>
            {{ formatPercent(item.yoYChangePercent) }}
          </td>

          <!-- 累計年增率 -->
          <td :class="['text-right', getPercentClass(item.accumulatedChangePercent)]">
            <span v-if="parseFloat(item.accumulatedChangePercent) > 0">🔺</span>
            <span v-else-if="parseFloat(item.accumulatedChangePercent) < 0">🔻</span>
            {{ formatPercent(item.accumulatedChangePercent) }}
          </td>

          <!-- 備註欄位：滑鼠移上時透過 Teleport 顯示完整備註 -->
          <td
            class="note-cell"
            @mouseover="showTooltip($event, item.note)"
            @mouseleave="hideTooltip"
          >
            {{ truncate(item.note, 8) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Teleport 到 body，用來顯示 tooltip，避免被任何父層擋住 -->
    <teleport to="body">
      <div
        v-if="tooltip.visible"
        class="global-tooltip"
        :style="tooltip.style"
      >
        {{ tooltip.text }}
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 接收父層傳入的 data
defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// -------- 格式化函式 --------
const formatYearMonth = (ym) => {
  if (!ym || ym.length < 5) return ym
  const year = parseInt(ym.substring(0, 3))
  const month = ym.substring(3)
  return `民國${year}年${month}月`
}

const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '-'
  return Number(num).toLocaleString()
}

const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '-'
  return `${parseFloat(val).toFixed(2)}%`
}

const getPercentClass = (val) => {
  const num = parseFloat(val)
  if (isNaN(num)) return ''
  return num > 0 ? 'text-red' : num < 0 ? 'text-green' : ''
}

const truncate = (text, maxLength) => {
  if (!text) return '-'
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// -------- Teleport Tooltip 狀態 --------
const tooltip = ref({
  visible: false,
  text: '',
  style: {
    position: 'fixed',
    top: '0px',
    left: '0px',
    zIndex: 999999,
    backgroundColor: '#333',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'normal',
    maxWidth: '300px',
    pointerEvents: 'none', // 滑鼠移上不會影響事件
    boxShadow: '0 0 4px rgba(0,0,0,.3)'
  }
})

// 滑鼠移到備註欄時，顯示 tooltip
const showTooltip = (event, note) => {
  if (!note || note.length <= 8) return // 如果文字沒超出8字，不顯示 tooltip
  tooltip.value.visible = true
  tooltip.value.text = note

  // 取得滑鼠位置 or 元素位移
  // 這裡簡單用滑鼠位置顯示在滑鼠上方
  const offset = 20 // 往上幾px
  tooltip.value.style.top = `${event.clientY - offset}px`
  tooltip.value.style.left = `${event.clientX}px`
}

// 滑鼠離開時隱藏 tooltip
const hideTooltip = () => {
  tooltip.value.visible = false
}
</script>

<style scoped>
.table-container {
  /* 如果這裡有 overflow: auto 或 hidden，tooltip 也不會被剪裁 
     因為我們用 Teleport 到 body，所以可以放心 */
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 固定欄位寬度 */
}

th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
  word-wrap: break-word;
}

th {
 
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}

tbody tr:nth-child(odd) {
  background-color: #fafafa;
}

.text-right {
  text-align: right;
}

.text-red {
  color: #e74c3c;
}

.text-green {
  color: #27ae60;
}

/* 備註欄本身簡單 truncate（多於8個字以...表示） */
.note-cell {
  max-width: 8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
