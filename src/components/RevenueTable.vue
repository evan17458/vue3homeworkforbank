<template>
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
      <tr v-for="item in data" :key="item.companyId">
        <td>{{ item.companyId }}</td>
        <td>{{ item.companyName }}</td>
        <td>{{ item.industryCategory }}</td>
        <td>{{ formatYearMonth(item.reportYearMonth) }}</td>
        <td>{{ formatNumber(item.currentMonthRevenue) }}</td>
        <td>{{ formatPercent(item.moMChangePercent) }}</td>
        <td>{{ formatPercent(item.yoYChangePercent) }}</td>
        <td>{{ formatPercent(item.accumulatedChangePercent) }}</td>
        <td>{{ item.note }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  data: Array
})

const formatYearMonth = (ym) => {
  if (!ym || ym.length < 5) return ym
  const year = parseInt(ym.substring(0, 3))
  const month = ym.substring(3)
  return `民國${year}年${month}月`
}

const formatNumber = (num) => {
  return Number(num).toLocaleString()
}

const formatPercent = (val) => {
  return `${parseFloat(val).toFixed(2)}%`
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}
</style>
