<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <header v-if="route.path !== '/'" style="display:flex; justify-content:flex-start; gap:.5rem; padding:.75rem 1rem;">
      <NuxtLink class="admin-link-header" to="/admin/login">Admin</NuxtLink>
    </header>
    <slot />
  </div>
</template>

<style>
.admin-link-header {
  color: #999;
  font-size: 0.85rem;
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.2s;
}

.admin-link-header:hover {
  opacity: 1;
}
</style>
