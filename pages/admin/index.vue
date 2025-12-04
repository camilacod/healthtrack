<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

const summary = ref<{ users: number; supplements: number } | null>(null)
const me = ref<any>(null)

async function load() {
  const s = await $fetch('/api/admin/summary')
  summary.value = s as any
}

onMounted(async () => {
  try {
    me.value = await $fetch('/api/auth/me')
    if (!me.value?.isAdmin) {
      navigateTo('/admin/login')
      return
    }
    await load()
  } catch {
    navigateTo('/admin/login')
  }
})
</script>

<template>
  <div class="admin-home">
    <header class="page-header">
      <h1 class="page-title">Admin Dashboard</h1>
      <p class="welcome-text">Welcome back! Here's your system overview.</p>
    </header>

    <section class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-title">Total Users</div>
          <div class="stat-value">{{ summary?.users ?? 0 }}</div>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">💊</div>
        <div class="stat-info">
          <div class="stat-title">Supplements</div>
          <div class="stat-value">{{ summary?.supplements ?? 0 }}</div>
        </div>
      </div>
    </section>

    <section class="card quick-links-card">
      <h2 class="section-title">Quick Actions</h2>
      <div class="links-grid">
        <NuxtLink to="/admin/users" class="quick-link">
          <span class="link-icon">👥</span>
          <span class="link-label">Manage Users</span>
        </NuxtLink>
        <NuxtLink to="/admin/database" class="quick-link">
          <span class="link-icon">💊</span>
          <span class="link-label">View Database</span>
        </NuxtLink>
        <NuxtLink to="/admin/products" class="quick-link">
          <span class="link-icon">✨</span>
          <span class="link-label">Curate Products</span>
        </NuxtLink>
        <NuxtLink to="/" class="quick-link">
          <span class="link-icon">🏠</span>
          <span class="link-label">Back to Site</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-home {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  color: var(--primary);
  margin: 0 0 0.5rem 0;
  font-weight: 800;
}

.welcome-text {
  color: var(--text-sub);
  font-size: 1.1rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  font-size: 3rem;
  background: var(--bg-cream);
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: var(--text-sub);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
}

.quick-links-card {
  padding: 2rem;
}

.section-title {
  font-size: 1.2rem;
  color: var(--primary);
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-main);
  transition: all 0.2s;
}

.quick-link:hover {
  background: var(--bg-cream);
  border-color: var(--secondary);
  transform: translateY(-2px);
}

.link-icon {
  font-size: 2rem;
  background: var(--bg-cream);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.link-label {
  font-weight: 600;
  color: var(--primary);
  text-align: center;
}

@media (max-width: 600px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>
