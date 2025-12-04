<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const me = ref<any>(null)

onMounted(async () => {
  try {
    me.value = await $fetch('/api/auth/me')
    if (!me.value?.isAdmin) {
      navigateTo('/admin/login')
      return
    }
  } catch {
    navigateTo('/admin/login')
  }
})
</script>

<template>
  <div class="products-page">
    <header class="page-header">
      <h1 class="page-title">Products Curation</h1>
      <p class="welcome-text">Curate and manage product listings</p>
    </header>

    <section class="card placeholder-card">
      <div class="placeholder-content">
        <span class="placeholder-icon">✨</span>
        <h2 class="placeholder-title">Coming Soon</h2>
        <p class="placeholder-text">
          Product curation features will be available here. This section will allow you to:
        </p>
        <ul class="feature-list">
          <li>Review and approve user-submitted supplements</li>
          <li>Edit and enhance product information</li>
          <li>Add high-quality images and descriptions</li>
          <li>Categorize and tag products</li>
          <li>Manage product visibility and recommendations</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.products-page {
  max-width: 1000px;
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

.card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.placeholder-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.placeholder-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1.5rem;
}

.placeholder-title {
  font-size: 2rem;
  color: var(--primary);
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.placeholder-text {
  font-size: 1.1rem;
  color: var(--text-main);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.feature-list {
  text-align: left;
  margin: 0 auto;
  max-width: 450px;
  padding-left: 1.5rem;
}

.feature-list li {
  color: var(--text-main);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .card {
    padding: 2rem 1rem;
  }
  
  .placeholder-icon {
    font-size: 3.5rem;
  }
  
  .placeholder-title {
    font-size: 1.5rem;
  }
  
  .placeholder-text {
    font-size: 1rem;
  }
}
</style>

