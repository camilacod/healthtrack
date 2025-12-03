<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const me = ref<any>(null)
const showAddMenu = ref(false)
// Placeholder data for UI mockup
const dailyStats = {
  taken: 3,
  total: 4,
  streak: 15,
  consistency: 85
}

const todaysSupplements = [
  { name: 'Multivitamin', taken: 1, target: 1 },
  { name: 'Omega-3', taken: 0, target: 2 },
  { name: 'Protein Powder', taken: 1, target: 1 },
]

async function load() {
  try {
    me.value = await $fetch('/api/auth/me')
  } catch (e) {
    console.error(e)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <header class="dashboard-header">
      <h1 class="page-title">Your Dashboard</h1>
      <p class="welcome-text" v-if="me">Hello, <strong>{{ me.user?.username || me.user?.email }}</strong></p>
    </header>

    <div class="dashboard-grid">
      <!-- Daily Progress Card -->
      <div class="card progress-card">
        <h2 class="card-title">Daily Progress</h2>
        <div class="circles-container">
          
          <!-- Taken Circle (75%) -->
          <div class="circle-item">
            <div class="circle-ring" style="--p: 75; --c: #3b82f6">
              <div class="circle-content">
                <span class="circle-label">Taken:</span>
                <span class="circle-value">{{ dailyStats.taken }}/{{ dailyStats.total }}</span>
              </div>
            </div>
          </div>

          <!-- Streak Circle (100% visual but maybe full circle) -->
          <div class="circle-item">
            <div class="circle-ring" style="--p: 40; --c: #10b981">
              <div class="circle-content">
                <span class="circle-label">Streak:</span>
                <span class="circle-value">{{ dailyStats.streak }} Days</span>
              </div>
            </div>
          </div>

          <!-- Consistency Circle (85%) -->
          <div class="circle-item">
            <div class="circle-ring" style="--p: 85; --c: var(--secondary)">
              <div class="circle-content">
                <span class="circle-label">Consistency:</span>
                <span class="circle-value">{{ dailyStats.consistency }}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Today's Supplements Card -->
      <div class="card today-card">
        <h2 class="card-title">Today's Supplements</h2>
        
        <div class="supplements-list">
          <div v-for="(item, index) in todaysSupplements" :key="index" class="supplement-item">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-progress-text">{{ item.taken }}/{{ item.target }}</span>
            </div>
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :class="{ 'green-fill': item.taken >= item.target }"
                :style="{ width: (item.taken / item.target * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="add-container">
          <button class="btn-add-log" @click="showAddMenu = true">Add</button>
          
          <!-- Add Menu Modal/Overlay -->
          <div class="add-menu-overlay" v-if="showAddMenu" @click.self="showAddMenu = false">
            <div class="add-menu">
              <h3 class="menu-title">Add Supplement</h3>
              <div class="menu-options">
                <NuxtLink to="/database" class="menu-option">
                  <span class="option-icon">🔍</span>
                  <div class="option-text">
                    <span class="option-title">Search Database</span>
                    <span class="option-desc">Find supplements in our database</span>
                  </div>
                </NuxtLink>
                
                <NuxtLink to="/add-photo" class="menu-option">
                  <span class="option-icon">📷</span>
                  <div class="option-text">
                    <span class="option-title">Photo of Product</span>
                    <span class="option-desc">Take or upload a photo</span>
                  </div>
                </NuxtLink>
              </div>
              <button class="btn-cancel" @click="showAddMenu = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ... previous styles ... */

/* Add Menu Styles */
.add-container {
  position: relative;
}

.add-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center; /* Center on desktop */
  z-index: 100;
  padding: 1rem;
}

@media (max-width: 600px) {
  .add-menu-overlay {
    align-items: flex-end; /* Bottom sheet on mobile */
    padding: 0;
  }
  
  .add-menu {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    width: 100%;
    max-width: none;
  }
}

.add-menu {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.menu-title {
  text-align: center;
  color: var(--primary);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-main);
  transition: all 0.2s;
}

.menu-option:hover {
  background: var(--bg-cream);
  border-color: var(--secondary);
}

.option-icon {
  font-size: 1.5rem;
  background: #f3f4f6;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.option-text {
  display: flex;
  flex-direction: column;
}

.option-title {
  font-weight: 600;
  font-size: 1rem;
}

.option-desc {
  font-size: 0.85rem;
  color: var(--text-sub);
}

.btn-cancel {
  width: 100%;
  padding: 0.8rem;
  border: none;
  background: transparent;
  color: var(--text-sub);
  font-weight: 600;
  cursor: pointer;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.welcome-text {
  color: var(--text-sub);
  font-size: 1.1rem;
}

/* Grid Layout */
.dashboard-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1.2fr; /* Progress card takes more space */
  }
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.card-title {
  font-size: 1.1rem;
  color: var(--primary);
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

/* Progress Circles */
.circles-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  height: 100%;
}

.circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  /* Conic gradient trick for progress ring */
  background: conic-gradient(var(--c) calc(var(--p) * 1%), #f3f4f6 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Inner white circle to make it a ring */
.circle-ring::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
}

.circle-content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.circle-label {
  font-size: 0.85rem;
  color: var(--text-sub);
  margin-bottom: 0.2rem;
}

.circle-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary);
}

/* Today's List */
.supplements-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.supplement-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-main);
}

.progress-track {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #cbd5e1; /* Default incomplete color */
  border-radius: 4px;
  transition: width 0.3s ease;
}

.green-fill {
  background: #10b981; /* Completed color */
}

.btn-add-log {
  width: 100%;
  background: #ef4444; /* Red/Burgundy accent from mock? Or use secondary orange */
  background: var(--secondary); /* Using our theme orange */
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.btn-add-log:hover {
  opacity: 0.9;
}
</style>