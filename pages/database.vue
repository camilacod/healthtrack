<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const supplements = ref<any[]>([])
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

const CATEGORIES = [
  'Multivitamins',
  'Single Vitamins',
  'Minerals',
  'Functional Supplements',
  'Antioxidants',
  'Others',
]

async function load() {
  try {
    supplements.value = (await $fetch(`/api/supplements?_t=${Date.now()}`)) as any[]
  } catch (e: any) {
    error.value = e?.data?.message || 'Error loading data'
  }
}

// Filter logic
const filteredSupplements = computed(() => {
  let result = supplements.value

  // Filter by category
  if (selectedCategory.value) {
    if (selectedCategory.value === 'Others') {
      // "Others" includes items with null category or explicitly "Others"
      result = result.filter(s => !s.category || s.category === 'Others')
    } else {
      result = result.filter(s => s.category === selectedCategory.value)
    }
  }

  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.brand && s.brand.toLowerCase().includes(q))
    )
  }

  return result
})

// Suggestions: simple unique names from filtered results
const suggestions = computed(() => {
  if (!searchQuery.value) return []
  // Get unique names that match start of query or just match
  const names = new Set(filteredSupplements.value.map(s => s.name))
  return Array.from(names).slice(0, 5) // Limit to 5
})

function selectCategory(cat: string | null) {
  selectedCategory.value = selectedCategory.value === cat ? null : cat
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
  <div class="db-page">
    <!-- Search Header -->
    <div class="search-section">
      <h1 class="page-title">Find Your Supplement</h1>
      <div class="search-wrapper">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search for vitamins, protein, brands..." 
          class="search-input"
        />
        <button class="search-btn">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>

    <!-- Results Layout -->
    <div class="results-container">
      
      <!-- Left Panel: Suggestions & Categories -->
      <aside class="sidebar-panel">
        <!-- Suggestions (only if searching) -->
        <div v-if="searchQuery" class="panel-group">
          <h3 class="panel-title">Suggestions</h3>
          <ul class="panel-list">
            <li v-for="name in suggestions" :key="name" class="panel-item" @click="searchQuery = name">
              {{ name }}
            </li>
            <li v-if="suggestions.length === 0" class="panel-empty">No matches found</li>
          </ul>
        </div>

        <!-- Categories -->
        <div class="panel-group">
          <h3 class="panel-title">Categories</h3>
          <ul class="panel-list">
            <li 
              v-for="cat in CATEGORIES" 
              :key="cat" 
              class="panel-item"
              :class="{ active: selectedCategory === cat }"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </li>
            <li 
              v-if="selectedCategory"
              class="panel-item clear-filter"
              @click="selectCategory(null)"
            >
              ✕ Clear filter
            </li>
          </ul>
        </div>
      </aside>

      <!-- Right Panel: Product Cards -->
      <main class="main-panel">
        <div class="main-header">
          <h2 class="section-title">
            {{ searchQuery ? `Suggested Products for "${searchQuery}"` : 'All Supplements' }}
          </h2>
          <span class="result-count">{{ filteredSupplements.length }} found</span>
        </div>

        <div class="products-grid">
          <div v-for="s in filteredSupplements" :key="s.id" class="product-card">
            <div class="product-image-placeholder">
              <!-- Using first letter of name as icon/placeholder since "no pics" -->
              <span class="placeholder-text">{{ s.name.charAt(0) }}</span>
            </div>
            
            <div class="product-info">
              <div class="brand-name">{{ s.brand || 'Generic' }}</div>
              <h3 class="product-name">{{ s.name }}</h3>
              
              <div class="product-meta" v-if="s.form || s.servingSize">
                {{ s.form }} • {{ s.servingSize }} {{ s.servingUnit }}
              </div>

              <div class="product-category">
                {{ s.category || 'Others' }}
              </div>
              
              <div class="action-row">
                <button class="btn-add" @click="add(s)">Add to Stack</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredSupplements.length === 0" class="empty-state">
          <p>No products found matching your search.</p>
        </div>
      </main>

    </div>

    <div v-if="error" class="error-toast">{{ error }}</div>
  </div>
</template>

<style scoped>
.db-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  color: var(--secondary);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.search-wrapper {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid var(--border-color);
  border-radius: 30px; /* Pill shape */
  outline: none;
  transition: border-color 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.search-btn {
  position: absolute;
  right: 10px;
  background: var(--primary);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

.search-btn:hover {
  transform: scale(1.05);
}

/* Results Layout */
.results-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  min-height: 400px;
  align-items: start;
}

@media (min-width: 768px) {
  .results-container {
    grid-template-columns: 250px 1fr; /* Sidebar + Main */
  }
}

/* Sidebar Panel */
.sidebar-panel {
  border-right: 1px solid var(--border-color);
  padding-right: 1.5rem;
}

@media (max-width: 767px) {
  .sidebar-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding-right: 0;
    padding-bottom: 1.5rem;
  }
}

.panel-group {
  margin-bottom: 2rem;
}

.panel-title {
  font-size: 1.1rem;
  color: var(--primary);
  margin-bottom: 1rem;
  font-weight: 700;
}

.panel-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.panel-item {
  padding: 0.5rem 0.75rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  border-radius: 6px;
  margin: 0 -0.75rem;
}

.panel-item:hover {
  color: var(--secondary);
  background: #fef3e8;
}

.panel-item.active {
  background: var(--secondary);
  color: white;
}

.panel-item.active:hover {
  background: var(--secondary);
  color: white;
}

.panel-item.clear-filter {
  color: var(--text-sub);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.panel-item.clear-filter:hover {
  color: #b91c1c;
  background: #fef2f2;
}

.panel-empty {
  font-style: italic;
  color: var(--text-sub);
  font-size: 0.9rem;
}

/* Main Panel */
.main-panel {
  padding-left: 0.5rem;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.section-title {
  font-size: 1.2rem;
  color: var(--primary);
  margin: 0;
}

.result-count {
  color: var(--text-sub);
  font-size: 0.9rem;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.05);
  border-color: #ddd;
}

.product-image-placeholder {
  width: 100%;
  height: 140px;
  background: var(--bg-cream);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--primary);
  font-weight: 800;
  font-size: 2.5rem;
}

.brand-name {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-sub);
  letter-spacing: 0.05em;
  margin-bottom: 0.3rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.product-meta {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-category {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--secondary);
  background: #fef3e8;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.action-row {
  margin-top: auto; /* Pushes button to bottom */
  display: flex;
  justify-content: flex-end; /* Or space-between if price is added */
}

.btn-add {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  width: 100%;
}

.btn-add:hover {
  background: var(--secondary);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-sub);
}

.error-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
