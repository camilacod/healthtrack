<template>
  <div>
    <NuxtRouteAnnouncer />
    <header style="display:flex; justify-content:flex-end; gap:.5rem; padding:.75rem 1rem; border-bottom:1px solid #eee">
      <NuxtLink class="btn" to="/admin/login">Login Admin</NuxtLink>
    </header>
    <NuxtPage />
  </div>
</template>
