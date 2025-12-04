<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

const supplements = ref<any[]>([])
const me = ref<any>(null)
const searchQuery = ref('')

async function load() {
  try {
    supplements.value = (await $fetch(`/api/admin/supplements?_t=${Date.now()}`)) as any[]
  } catch (e: any) {
    console.error('Error loading supplements:', e)
  }
}

onMounted(async () => {
  try {
    me.value = await $fetch('/api/admin/auth/me')
    if (!me.value) {
      navigateTo('/admin/login')
      return
    }
    await load()
  } catch {
    navigateTo('/admin/login')
  }
})

const filteredSupplements = computed(() => {
  if (!searchQuery.value) return supplements.value
  const q = searchQuery.value.toLowerCase()
  return supplements.value.filter(s => 
    s.name.toLowerCase().includes(q) || 
    (s.brand && s.brand.toLowerCase().includes(q)) ||
    (s.form && s.form.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="database-page">
    <header class="page-header">
      <h1 class="page-title">Supplements Database</h1>
      <p class="welcome-text">View and search all supplements in the system</p>
    </header>

    <div class="search-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search by name, brand, or form..." 
        class="search-input"
      />
      <span class="result-count">{{ filteredSupplements.length }} supplements</span>
    </div>

    <section class="card table-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Form</th>
              <th>Serving Size</th>
              <th>Unit</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSupplements" :key="s.id">
              <td class="cell-name">{{ s.name }}</td>
              <td>{{ s.brand || '-' }}</td>
              <td>{{ s.form || '-' }}</td>
              <td>{{ s.servingSize || '-' }}</td>
              <td>{{ s.servingUnit || '-' }}</td>
              <td>{{ s.category || 'Others' }}</td>
              <td>
                <span class="status-badge" :class="s.status">{{ s.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredSupplements.length === 0" class="empty-state">
        <p>No supplements found matching your search.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.database-page {
  max-width: 1400px;
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

.search-section {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary);
}

.result-count {
  color: var(--text-sub);
  font-weight: 600;
  font-size: 0.9rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.table-responsive {
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid var(--border-color);
  color: var(--text-sub);
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.cell-name {
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
}

.cell-description {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-sub);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.published {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.draft {
  background: #e5e7eb;
  color: #4b5563;
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>

