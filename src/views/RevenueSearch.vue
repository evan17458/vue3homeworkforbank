<template>
  <div class="app-container">
    <div class="page-wrapper">
      <div class="search-container">
        <h2 class="search-title">📊 查詢上市公司營收資料</h2>
        <p class="search-subtitle">請輸入 4 位數字公司代碼，範例：2330 (台積電)2317 (鴻海)2454 (聯發科)</p>
          <p>按 Enter/空白鍵 或點擊按鈕查詢</p>
        <div class="search-box">
          <input
            v-model="companyId"
            placeholder="例如 1101"
            maxlength="4"
            pattern="[0-9]*"
            inputmode="numeric"
            type="text"
            @keyup="handleInputKeyup"
            class="company-input" />
          <button @click="fetchRevenue" :disabled="loading" class="search-button"> {{ loading ? '查詢中...' : '查詢' }}
          </button>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>

      <div class="result-wrapper">
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>資料載入中，請稍候...</p>
        </div>
        <div v-else-if="revenueData" class="result">
          <h3>{{ revenueData.companyName }} （ID: {{ revenueData.companyId }}）</h3>
          <p><strong>產業類別：</strong>{{ revenueData.industryCategory }}</p>
          <p><strong>報告月份：</strong>{{ formattedMonth }}</p>
          <p><strong>當月營收：</strong>{{ formatCurrency(revenueData.currentMonthRevenue) }}</p>
          <p><strong>去年同月營收：</strong>{{ formatCurrency(revenueData.lastYearMonthRevenue) }}</p>
          <p><strong>YoY 年增率：</strong><span :class="getChangeClass(roundedYoYChange)">{{ roundedYoYChange }}%</span></p>
          <p><strong>累計營收年增率：</strong><span :class="getChangeClass(roundedAccumulatedChange)">{{ roundedAccumulatedChange }}%</span></p>
          <p class="note"><strong>備註：</strong>{{ revenueData.note || '無' }}</p>
        </div>
        <div v-else-if="!loading && !revenueData && hasSearched" class="no-result">
          <p>查無此公司代碼 <strong>{{ searchedCompanyId }}</strong> 的資料，<br>或該公司尚未公佈此期營收。</p>
        </div>
        <div v-else-if="!loading && !hasSearched" class="initial-prompt">
            <p>請輸入公司代碼以查詢營收資料。</p>
        </div>
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
const errorMessage = ref('')
const hasSearched = ref(false)
const searchedCompanyId = ref('')

const handleInputKeyup = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    if (event.key === ' ') {
      event.preventDefault();
    }
    fetchRevenue();
  }
}

const fetchRevenue = async () => {
  revenueData.value = null
  errorMessage.value = ''
  hasSearched.value = false 
  searchedCompanyId.value = companyId.value 

  const idRegex = /^\d{4}$/
  if (!companyId.value || !idRegex.test(companyId.value)) {
    errorMessage.value = '請輸入有效的 4 位數字公司代碼。'
   
    return
  }

  loading.value = true
  try {
    // *** 請確認你的 API 端點 ***
    const res = await axios.get(`https://localhost:7148/Revenue/${companyId.value}`)

    if (res.data && res.data.length > 0) {
        revenueData.value = res.data[0]
    } else {
        revenueData.value = null
    }
    hasSearched.value = true // 標記已執行查詢
  } catch (err) {
    console.error('API Error:', err)
    if (err.response) {
      errorMessage.value = `查詢失敗：伺服器錯誤 (${err.response.status})。`
    } else if (err.request) {
      errorMessage.value = '查詢失敗：無法連接到伺服器，請檢查網路連線或 API 位址。'
    } else {
      errorMessage.value = '查詢失敗：' + err.message
    }
    revenueData.value = null
    hasSearched.value = true // 即使查詢失敗，也標記為已嘗試查詢
  } finally {
    loading.value = false
  }
}

watch(companyId, (newVal) => {
  // 當輸入改變時，只清除錯誤訊息，不清空上次結果和搜索狀態
  if (errorMessage.value) {
      errorMessage.value = ''
  }
})

const formattedMonth = computed(() => {
  if (!revenueData.value?.reportYearMonth) return ''
  const ym = String(revenueData.value.reportYearMonth)
  if (ym.length >= 5) {
      // 假設格式為民國年(3位) + 月份(2位)，例如 11203
      const rocYear = ym.slice(0, -2);
      const month = ym.slice(-2);
      return `民國 ${rocYear} 年 ${month} 月`
  }
  return ym // 如果格式不符，直接回傳原始字串
})

const parseAndRound = (value) => {
  if (value === null || value === undefined || value === '') return null // 回傳 null 以便區分
  const num = parseFloat(value)
  // 回傳數字或 null
  return isNaN(num) ? null : Math.round(num * 100) / 100
}

const roundedYoYChange = computed(() => {
  return parseAndRound(revenueData.value?.yoYChangePercent)
})

const roundedAccumulatedChange = computed(() => {
  return parseAndRound(revenueData.value?.accumulatedChangePercent)
})

// 新增：根據增減給予不同顏色 class
const getChangeClass = (value) => {
    if (value === null || value === undefined) return '';
    if (value > 0) return 'positive-change';
    if (value < 0) return 'negative-change';
    return 'zero-change';
}


const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A' // 資料不存在時顯示 N/A
  const num = Number(value);
  if (isNaN(num)) return 'N/A'; // 轉換數字失敗也顯示 N/A
  // 使用台灣地區的數字格式
  return num.toLocaleString('zh-TW', { style: 'decimal' });
}
</script>

<style scoped>

.app-container {
  display: flex; /* 啟用 Flexbox */
  justify-content: center; /* 水平置中 */
  align-items: center;   /* 垂直置中 */
  min-height: 100vh;     /* 容器最小高度為整個視窗 */
 
  padding: 2rem 1rem; /* 在容器周圍留白 */
  box-sizing: border-box; /* padding 不會撐大容器 */
}

.page-wrapper {
  max-width: 650px; 
  width: 100%; 
  background-color: #ffffff; 
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
  padding: 2rem 2.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  overflow: hidden;
}


.search-container {
  margin-bottom: 2.5rem; /* 加大與結果區的間距 */
  text-align: center;
}

.search-title {
  color: #1a2b4e; /* 深藍色標題 */
  margin-bottom: 0.8rem;
  font-size: 1.6rem; /* 稍大標題 */
  font-weight: 600;
}

.search-subtitle {
  color: #5a6b8c; /* 柔和的副標題顏色 */
  font-size: 0.95em;
  margin-bottom: 1.5rem;
}

.search-box {
  display: flex;
  justify-content: center;
  align-items: stretch; /* 讓輸入框和按鈕等高 */
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.company-input {
  padding: 0.75rem 1rem; /* 加大輸入框內距 */
  border: 1px solid #ced4da;
  border-radius: 8px; /* 更圓的邊角 */
  font-size: 1.1rem; /* 稍大字體 */
  width: 150px;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.company-input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); /* 加入 focus 光暈效果 */
}

.search-button {
  padding: 0.75rem 1.5rem; 
  border: none;
  background-color: #007bff; 
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.search-button:hover:not(:disabled) {
  background-color: #0056b3; /* 滑過加深 */
  transform: translateY(-1px); /* 輕微上移效果 */
}

.search-button:active:not(:disabled) {
    transform: translateY(0px); /* 按下時恢復 */
}

.search-button:disabled {
    background-color: #adb5bd; 
    cursor: not-allowed;
}

.error-message {
  color: #e63946; 
  font-size: 0.9em;
  margin-top: 0.8rem;
  min-height: 1.2em;
  font-weight: 500;
}

/* --- 結果區塊 --- */
.result-wrapper {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef; /* 更淺的分隔線 */
    min-height: 200px; /* 確保有足夠空間顯示內容或提示 */
    position: relative;
}

/* --- 載入中 Spinner --- */
.loading-indicator {
    text-align: center;
    color: #6c757d; /* 灰色文字 */
    padding: 2rem;
}

.spinner {
  margin: 0 auto 1rem auto;
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #007bff; /* 主題藍色 */
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


/* --- 結果顯示 --- */
.result {
  background-color: #f8f9fa; /* 非常淺的灰色背景 */
  padding: 1.5rem 2rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.result h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #0056b3; /* 深藍色 */
  font-size: 1.4rem;
  font-weight: 600;
  border-bottom: 1px dashed #ced4da; /* 虛線分隔 */
  padding-bottom: 0.8rem;
}

.result p {
  margin: 0.8rem 0;
  line-height: 1.7;
  color: #343a40; /* 深灰色文字 */
  font-size: 1rem;
}

.result p strong {
    color: #495057; /* 標籤文字顏色稍深 */
    margin-right: 0.5em;
}

.result .note {
  margin-top: 1.5rem;
  font-size: 0.9em;
  color: #6c757d; /* 灰色備註 */
  font-style: italic;
  border-top: 1px dashed #ced4da; /* 虛線分隔 */
  padding-top: 0.8rem;
}

/* --- 增減率顏色 --- */
.positive-change {
    color: #d00000; /* 紅色代表正成長 (台灣習慣) */
    font-weight: bold;
}
.negative-change {
    color: #008000; /* 綠色代表負成長 (台灣習慣) */
    font-weight: bold;
}
.zero-change {
    color: #343a40; /* 黑色代表零 */
}


/* --- 查無資料與初始提示 --- */
.no-result, .initial-prompt {
    text-align: center;
    color: #6c757d;
    padding: 3rem 1rem;
    font-size: 1.1rem;
}
.no-result strong {
    color: #495057;
}


@media (max-width: 600px) {
  .app-container {
    padding: 1rem 0.5rem; /* 手機上減少左右 padding */
    align-items: flex-start; /* 手機上內容靠上，避免鍵盤彈出時跑位 */
    margin-top: 30px;
  }
  .page-wrapper {
    padding: 1.5rem; /* 手機上減少內部 padding */
    border-radius: 8px; /* 可以減少圓角 */
  }
  .search-title {
    font-size: 1.4rem;
  }
  .search-box {
    flex-direction: column; /* 手機上輸入框和按鈕垂直排列 */
    align-items: stretch;
  }
  .company-input {
    width: auto; /* 輸入框寬度自適應 */
    margin-bottom: 0.5rem; /* 和按鈕間留點距離 */
  }
  .result {
    padding: 1rem 1.2rem;
  }
   .result h3 {
    font-size: 1.2rem;
  }
  .result p {
    font-size: 0.95rem;
  }
}

</style>