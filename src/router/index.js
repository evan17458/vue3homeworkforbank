import { createRouter, createWebHistory } from 'vue-router'
import RevenueSearch from '../views/RevenueSearch.vue'
import RevenueList from '../views/RevenueList.vue'

const routes = [
  { path: '/', redirect: '/search' },
  { path: '/search', component: RevenueSearch },
  { path: '/list', component: RevenueList }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
