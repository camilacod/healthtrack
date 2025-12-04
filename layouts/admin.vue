<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { $fetch } from 'ofetch'

const route = useRoute()
const isSidebarOpen = ref(true)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

async function logout() {
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
}

const menuItems = [
  { label: 'Home', path: '/admin', icon: '🏠' },
  { label: 'Users Management', path: '/admin/users', icon: '👥' },
  { label: 'Database', path: '/admin/database', icon: '💊' },
  { label: 'Products Curation', path: '/admin/products', icon: '✨' },
]
</script>

<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-header">
        <NuxtLink to="/" class="logo-link">
          <span class="logo-icon">🔐</span> 
          <span class="logo-text">Admin Panel</span>
        </NuxtLink>
        <button class="close-sidebar-btn" @click="toggleSidebar">✕</button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink 
          v-for="(item, index) in menuItems" 
          :key="index" 
          :to="item.path" 
          class="nav-item"
          :class="{ active: route.path === item.path }" 
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">Log out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'content-shifted': isSidebarOpen }">
      <header class="top-bar">
        <button class="hamburger-btn" @click="toggleSidebar">
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </button>
      </header>
      
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
    
    <!-- Overlay for mobile when sidebar is open -->
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-cream);
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
  transition: transform 0.3s ease;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-sidebar-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-sub);
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-sub);
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--bg-cream);
  color: var(--primary);
}

.nav-item.router-link-exact-active {
  background: var(--primary);
  color: white;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-sub);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-content.content-shifted {
  margin-left: 260px;
}

.top-bar {
  padding: 1rem 2rem;
  display: flex;
}

.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  padding: 0;
}

.line {
  display: block;
  width: 100%;
  height: 3px;
  background-color: var(--primary);
  border-radius: 3px;
}

.content-wrapper {
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

/* Desktop: sidebar hidden when not open */
@media (min-width: 769px) {
  .sidebar {
    transform: translateX(0);
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .main-content.content-shifted {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 1rem;
  }

  .close-sidebar-btn {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }
}
</style>
