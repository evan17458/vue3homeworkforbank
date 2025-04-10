<template>
  <div class="container">
    <h2>📊 上市公司營收總覽</h2>
    <RevenueTable :data="revenues" />

    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">上一頁</button>
      <span>第 {{ page }} 頁</span>
      <button @click="nextPage">下一頁</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import RevenueTable from '../components/RevenueTable.vue'

const revenues = ref([])
const page = ref(1)
const pageSize = 17

const fetchData = async () => {
  const res = await axios.get(`https://localhost:7148/Revenue?page=${page.value}&pageSize=${pageSize}`)
  revenues.value = res.data.items
}

onMounted(fetchData)

const nextPage = () => {
  page.value++
  fetchData()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchData()
  }
}
</script>

<style scoped>
.container {
  padding: 2rem;
}
.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
