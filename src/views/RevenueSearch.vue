<template>
  <div class="page-wrapper">
    <!-- 搜尋區塊 -->
    <div class="search-container">
     <h2 class="search-title">📊 查詢上市公司營收資料</h2>
      <p class="search-subtitle">請輸入公司代碼，例如：1101（台泥）、2330（台積電）</p>
      <div class="search-box">
        <input v-model="companyId" placeholder="例如 1101" />
        <button @click="fetchRevenue">查詢</button>
      </div>
    </div>

    <!-- 結果區塊 -->
    <div class="result-wrapper">
      <div v-if="revenueData" class="result">
        <h3>{{ revenueData.companyName }} （ID: {{ revenueData.companyId }}）</h3>
        <p>產業類別：{{ revenueData.industryCategory }}</p>
        <p>報告月份：{{ formattedMonth }}</p>
        <p>當月營收：{{ revenueData.currentMonthRevenue }}</p>
        <p>去年同月營收：{{ revenueData.lastYearMonthRevenue }}</p>
        <p>YoY 年增率：{{ roundedYoYChange }}%</p>
        <p>累計營收年增率：{{ roundedAccumulatedChange }}%</p>
        <p class="note">備註：{{ revenueData.note }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const companyId = ref('')
const revenueData = ref(null)
const loading = ref(false)

const fetchRevenue = async () => {
  if (!companyId.value) return
  loading.value = true
  revenueData.value = null
  try {
    const res = await axios.get(`https://localhost:7148/Revenue/${companyId.value}`)
    revenueData.value = res.data[0]
  } catch (err) {
    alert('查詢失敗：' + err.message)
  } finally {
    loading.value = false
  }
}

watch(companyId, () => {
  revenueData.value = null
})

const formattedMonth = computed(() => {
  if (!revenueData.value) return ''
  const ym = revenueData.value.reportYearMonth
  return `民國${ym.slice(0, 3)}年${ym.slice(3)}月`
})

const roundedYoYChange = computed(() => {
  if (!revenueData.value) return ''
  return Math.round(parseFloat(revenueData.value.yoYChangePercent) * 100) / 100
})

const roundedAccumulatedChange = computed(() => {
  if (!revenueData.value) return ''
  return Math.round(parseFloat(revenueData.value.accumulatedChangePercent) * 100) / 100
})
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  font-family: "Segoe UI", sans-serif;
  background-color: #f9fafb;
}


.page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.search-container {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20px;
}

.search-box {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.search-title {
  color: #000000;
  background-color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 20px;
}

.search-subtitle {
  color: #333333;
  background-color: #ffffff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 6px;
}
input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  background-color: #ffffff;
  color: #000000;
  font-size: 14px;
}

input::placeholder {
  color: #555;
  opacity: 1;
}

button {
  padding: 8px 16px;
  background-color: #1e3a8a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #2b4fc2;
}

.result-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.result {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 24px;
  min-width: 600px;
  max-width: 800px;
}

.result h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #1e3a8a;
}

.result p {
  background-color: #f3f4f6;
  padding: 10px;
  margin: 6px 0;
  border-radius: 4px;
  color: #111827;
  font-size: 15px;
}

.result .note {
  background-color: #fef3c7;
  border-left: 4px solid #facc15;
  font-style: italic;
  font-weight: 500;
}
</style>
