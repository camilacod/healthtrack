<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const supplements = ref<any[]>([])
const error = ref('')

async function load() {
  try {
    supplements.value = (await $fetch('/api/supplements')) as any[]
  } catch (e: any) {
    error.value = e?.data?.message || 'Error loading data'
  }
}

async function add(s: any) {
  try {
    await $fetch('/api/user/supplements', {
      method: 'POST',
      body: { supplementId: s.id, relation: 'uses' },
    })
    alert('Added to your supplements')
  } catch (e: any) {
    error.value = e?.data?.message || 'Error adding supplement'
  }
}

onMounted(load)
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-title">Supplement Database</h1>
      <p class="page-desc">Explore our library of supplements and add them to your stack.</p>
    </header>

    <section class="card supplements-card">
      <div class="card-header">
        <h2 class="card-title">Available Supplements</h2>
      </div>
      
      <div v-if="!supplements.length" class="empty-state">
        No supplements found in database.
      </div>
      
      <div v-else class="table-container">
        <table class="theme-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in supplements" :key="s.id">
              <td class="font-medium">{{ s.name }}</td>
              <td class="text-muted">{{ s.brand }}</td>
              <td class="text-right">
                <button class="btn-icon" @click="add(s)" title="Add to my stack">
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.page-desc {
  color: var(--text-sub);
  font-size: 1.1rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.2rem;
  color: var(--primary);
  margin: 0;
}

/* Buttons */
.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1.2rem;
  line-height: 1;
}

.btn-icon:hover {
  background: var(--secondary);
  border-color: var(--secondary);
  color: white;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.theme-table {
  width: 100%;
  border-collapse: collapse;
}

.theme-table th {
  text-align: left;
  padding: 1rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-sub);
  font-weight: 600;
}

.theme-table td {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.text-right { text-align: right; }
.font-medium { font-weight: 500; }
.text-muted { color: var(--text-sub); font-size: 0.9rem; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-sub);
  font-style: italic;
}

.error-msg {
  color: #b00020;
  margin-top: 1rem;
  padding: 1rem;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
}
</style>
