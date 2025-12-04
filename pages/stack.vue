<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

definePageMeta({ layout: 'dashboard' })

type StackItem = {
  id: number
  name: string
  brand: string | null
  form: string | null
  serving_size: string | null
  serving_unit: string | null
  per_serving: any
  status: string
}

const items = ref<StackItem[]>([])
const loading = ref(false)
const error = ref('')
const q = ref('')

const filtered = computed(() => {
  if (!q.value) return items.value
  const s = q.value.toLowerCase()
  return items.value.filter(i =>
    i.name.toLowerCase().includes(s) || (i.brand && i.brand.toLowerCase().includes(s)) || (i.form && i.form.toLowerCase().includes(s))
  )
})

async function load() {
  loading.value = true
  try {
    items.value = await $fetch('/api/user/supplements')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load your stack'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="stack-page">
    <header class="page-header">
      <h1 class="page-title">My Stack</h1>
      <p class="welcome-text">Supplements you are currently using</p>
    </header>

    <div class="search-row">
      <input v-model="q" placeholder="Search by name or brand" class="input" />
      <span class="result-count">{{ filtered.length }} items</span>
    </div>

    <section class="card">
      <div v-if="loading">Loading...</div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <div v-if="!loading && filtered.length === 0" class="empty-state">No items in your stack yet.</div>

      <div class="grid" v-if="filtered.length">
        <div class="product-card" v-for="i in filtered" :key="i.id">
          <div class="product-header">
            <div class="product-title">{{ i.name }}</div>
            <div class="product-brand">{{ i.brand || 'Generic' }}</div>
          </div>
          <div class="product-meta">
            <span v-if="i.form">{{ i.form }}</span>
            <span v-if="i.serving_size && i.serving_unit">• {{ i.serving_size }} {{ i.serving_unit }}</span>
          </div>
          <div v-if="i.per_serving" class="per-serving">
            <div class="per-title">Per serving</div>
            <div class="per-list">
              <template v-for="(v, k) in (typeof i.per_serving === 'string' ? JSON.parse(i.per_serving || '{}') : i.per_serving || {})" :key="k">
                <span class="chip">{{ k }}: {{ v }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  
</template>

<style scoped>
.stack-page { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 2rem; color: var(--primary); margin: 0 0 0.5rem 0; font-weight: 800; }
.welcome-text { color: var(--text-sub); margin: 0; }

.search-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.result-count { color: var(--text-sub); }

.card { background: white; border-radius: 16px; padding: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); }
.error-msg { color: #b00020; }
.empty-state { color: var(--text-sub); padding: 0.75rem; }

.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.product-card { border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; background: white; }
.product-header { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.25rem; }
.product-title { font-weight: 700; color: var(--primary); }
.product-brand { color: var(--text-sub); font-size: 0.95rem; }
.product-meta { color: var(--text-sub); font-size: 0.9rem; margin-bottom: 0.5rem; }
.per-serving { margin-top: 0.5rem; }
.per-title { font-weight: 600; color: var(--primary); margin-bottom: 0.25rem; }
.per-list { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.chip { background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: 9999px; padding: 0.2rem 0.5rem; font-size: 0.8rem; }
</style>

