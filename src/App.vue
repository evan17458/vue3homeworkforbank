<script setup>

</script>

<template>
  <div>
    <nav>
      <RouterLink to="/search">🔍 查詢公司</RouterLink> |
      <RouterLink to="/list">📊 營收總覽</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
