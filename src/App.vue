<template>
  <div>
    <nav class="nav-links">
      <RouterLink to="/list"  class="nav-link" active-class="active">📊 營收總覽</RouterLink>
      <RouterLink to="/search"  class="nav-link" active-class="active">🔍 查詢公司</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped>
.nav-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  margin-bottom: -40px;
}
.active {
  font-weight: bold;
  text-decoration: underline;
}

.nav-link {
  display: inline-block; /* 讓 padding 有效 */
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  text-decoration: none;
  color: #4b0082;
  transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
  background-color: #e0e0ff;
  color: #000080;
}
</style>
