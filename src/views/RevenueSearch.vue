<template>
  <div class="page-wrapper">
    <div class="search-container">
      <h2 class="search-title">📊 查詢上市公司營收資料</h2>
      <p class="search-subtitle">請輸入 4 位數字公司代碼，例如：1101（台泥）、2330（台積電）</p>
      <div class="search-box">
        <input
          v-model="companyId"
          placeholder="例如 1101"
          maxlength="4"
          pattern="[0-9]*"
          inputmode="numeric"
          type="text"
        />
        <button @click="fetchRevenue" :disabled="loading">
          {{ loading ? '查詢中...' : '查詢' }}
        </button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div class="result-wrapper">
      <div v-if="loading" class="loading-indicator">
        <p>資料載入中，請稍候...</p>
        </div>
      <div v-else-if="revenueData" class="result">
        <h3>{{ revenueData.companyName }} （ID: {{ revenueData.companyId }}）</h3>
        <p>產業類別：{{ revenueData.industryCategory }}</p>
        <p>報告月份：{{ formattedMonth }}</p>
        <p>當月營收：{{ formatCurrency(revenueData.currentMonthRevenue) }}</p>
        <p>去年同月營收：{{ formatCurrency(revenueData.lastYearMonthRevenue) }}</p>
        <p>YoY 年增率：{{ roundedYoYChange }}%</p>
        <p>累計營收年增率：{{ roundedAccumulatedChange }}%</p>
        <p class="note">備註：{{ revenueData.note || '無' }}</p> </div>
      <div v-else-if="!loading && !revenueData && hasSearched" class="no-result">
        <p>查無此公司代碼 {{ searchedCompanyId }} 的資料，或該公司尚未公佈此期營收。</p>
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
const errorMessage = ref('') // Ref to store the error message
const hasSearched = ref(false) // Track if a search has been attempted
const searchedCompanyId = ref('') // Store the ID that was searched

// --- Validation and Data Fetching ---
const fetchRevenue = async () => {
  // Reset previous state for a new search
  revenueData.value = null
  errorMessage.value = ''
  hasSearched.value = false
  searchedCompanyId.value = companyId.value // Store the ID being searched

  // 1. Validate Input: Check if it's exactly 4 digits
  const idRegex = /^\d{4}$/ // Regex: start (^), exactly 4 digits (\d{4}), end ($)
  if (!companyId.value || !idRegex.test(companyId.value)) {
    errorMessage.value = '請輸入有效的 4 位數字公司代碼。'
    return // Stop execution if validation fails
  }

  // 2. Proceed with Fetching
  loading.value = true
  try {
    // **Important:** Replace with your actual API endpoint if different
    const res = await axios.get(`https://localhost:7148/Revenue/${companyId.value}`)

    // Check if data exists in the response array
    if (res.data && res.data.length > 0) {
        revenueData.value = res.data[0]
    } else {
        // Handle case where API returns success but empty data for the ID
        revenueData.value = null // Ensure previous data is cleared
    }
    hasSearched.value = true // Mark that a search was completed
  } catch (err) {
    console.error('API Error:', err) // Log the actual error for debugging
    // More specific error handling (optional)
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage.value = `查詢失敗：伺服器錯誤 (${err.response.status})。`
    } else if (err.request) {
      // The request was made but no response was received
      errorMessage.value = '查詢失敗：無法連接到伺服器，請檢查網路連線或 API 位址。'
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage.value = '查詢失敗：' + err.message
    }
    revenueData.value = null // Clear data on error
    hasSearched.value = true // Mark search attempt even if failed
  } finally {
    loading.value = false
  }
}

// --- Watchers ---
// Clear results and error when the input changes
watch(companyId, (newVal) => {
  revenueData.value = null
  hasSearched.value = false // Reset search status on input change
  // Optionally clear error immediately on typing, or keep it until next search attempt
  if (errorMessage.value) {
      errorMessage.value = ''
  }
  // Basic input filtering (optional): Remove non-digits as user types
  // companyId.value = newVal.replace(/\D/g, '');
})

// --- Computed Properties for Display ---
const formattedMonth = computed(() => {
  if (!revenueData.value?.reportYearMonth) return '' // Use optional chaining
  const ym = String(revenueData.value.reportYearMonth) // Ensure it's a string
  // Assuming format is ROC Year (3 digits) + Month (2 digits), e.g., 11203
  if (ym.length >= 5) {
      return `民國${ym.slice(0, -2)}年${ym.slice(-2)}月`
  }
  return ym // Fallback if format is unexpected
})

// Helper function to safely parse and round percentages
const parseAndRound = (value) => {
  if (value === null || value === undefined || value === '') return ''
  const num = parseFloat(value)
  return isNaN(num) ? '' : Math.round(num * 100) / 100
}

const roundedYoYChange = computed(() => {
  return parseAndRound(revenueData.value?.yoYChangePercent) // Optional chaining
})

const roundedAccumulatedChange = computed(() => {
  return parseAndRound(revenueData.value?.accumulatedChangePercent) // Optional chaining
})

// Helper function to format currency (optional but nice)
const formatCurrency = (value) => {
  if (value === null || value === undefined) return ''
  const num = Number(value);
  if (isNaN(num)) return '';
  // Formats with commas, adjust locale as needed
  return num.toLocaleString('en-US');
}
</script>

<style scoped>
/* Add some basic styling */
.page-wrapper {
  margin-top: 179px;
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: sans-serif;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-container {
  margin-bottom: 2rem;
  text-align: center;
}

.search-title {
  color: #333;
  margin-bottom: 0.5rem;
}

.search-subtitle {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem; /* Space before error message */
}

.search-box input {
  padding: 0.5rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  width: 120px; /* Adjust as needed */
  text-align: center;
}

.search-box button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.search-box button:hover:not(:disabled) {
  background-color: #0056b3;
}

.search-box button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.error-message {
  color: #dc3545; /* Red color for errors */
  font-size: 0.9em;
  margin-top: 0.5rem;
  min-height: 1.2em; /* Prevent layout shift when message appears/disappears */
}

.result-wrapper {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
    min-height: 150px; /* Prevent layout shifts */
    position: relative; /* For loading indicator positioning */
}

.loading-indicator {
    text-align: center;
    color: #666;
    padding: 2rem;
}

.result {
  background-color: #f9f9f9;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.result h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #0056b3;
}

.result p {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #333;
}

.result .note {
  margin-top: 1rem;
  font-size: 0.85em;
  color: #555;
  font-style: italic;
}

.no-result {
    text-align: center;
    color: #666;
    padding: 2rem;
}

</style>


