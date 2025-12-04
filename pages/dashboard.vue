<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()

type ScheduledDose = {
  id: string
  userSupplementId: number
  supplementId: number
  supplementName: string
  supplementBrand: string | null
  scheduledTime: string
  timeLabel: 'morning' | 'afternoon' | 'evening' | 'bedtime'
  taken: boolean
  takenAt: string | null
  logId: number | null
}

type DailyStats = {
  taken: number
  total: number
  streak: number
  weeklyConsistency: number
}

type WeeklyDay = {
  day: string
  date: string
  taken: number
  total: number
}

type DashboardData = {
  stats: DailyStats
  weeklyData: WeeklyDay[]
  doses: ScheduledDose[]
}

const loading = ref(true)
const error = ref('')
const stats = ref<DailyStats>({ taken: 0, total: 0, streak: 0, weeklyConsistency: 0 })
const weeklyData = ref<WeeklyDay[]>([])
const doses = ref<ScheduledDose[]>([])
const selectedDate = ref(new Date())
const showAddMenu = ref(false)

const TIME_GROUPS = [
  { id: 'morning', label: 'Morning', icon: '☀️', timeRange: '6 AM - 12 PM' },
  { id: 'afternoon', label: 'Afternoon', icon: '🌤️', timeRange: '12 PM - 6 PM' },
  { id: 'evening', label: 'Evening', icon: '🌙', timeRange: '6 PM - 10 PM' },
  { id: 'bedtime', label: 'Bedtime', icon: '🌙', timeRange: 'After 10 PM' },
] as const

const progressPercentage = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.taken / stats.value.total) * 100)
})

const formattedDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = new Date(selectedDate.value)
  selected.setHours(0, 0, 0, 0)
  
  if (selected.getTime() === today.getTime()) {
    return "Today's"
  }
  
  return selectedDate.value.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }) + "'s"
})

const todayIndex = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return weeklyData.value.findIndex(d => d.date === today)
})

function formatDateStr(date: Date): string {
  return date.toISOString().split('T')[0] as string
}

function formatTime12h(time24: string): string {
  const parts = time24.split(':')
  const h = parts[0] || '0'
  const m = parts[1] || '00'
  const hour = parseInt(h)
  const hour12 = hour % 12 || 12
  const period = hour < 12 ? 'AM' : 'PM'
  return `${hour12}:${m} ${period}`
}

async function loadDashboard(date?: string) {
  loading.value = true
  error.value = ''
  try {
    const dateStr = date || formatDateStr(selectedDate.value)
    const ts = Date.now() // Cache bust
    const data = await $fetch<DashboardData>(`/api/user/dashboard?date=${dateStr}&_t=${ts}`)
    stats.value = data.stats
    weeklyData.value = data.weeklyData
    doses.value = data.doses
  } catch (e: any) {
    console.error('Dashboard load error:', e)
    error.value = e?.data?.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

// Reload data when navigating to dashboard
watch(() => route.fullPath, () => {
  if (route.path === '/dashboard') {
    loadDashboard()
  }
})

async function toggleDose(dose: ScheduledDose) {
  const dateStr = formatDateStr(selectedDate.value)
  
  if (dose.taken && dose.logId) {
    // Unmark dose
    try {
      await $fetch(`/api/user/dashboard/log?logId=${dose.logId}`, { method: 'DELETE' })
      dose.taken = false
      dose.takenAt = null
      dose.logId = null
      stats.value.taken = Math.max(0, stats.value.taken - 1)
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to unmark dose'
    }
  } else {
    // Mark dose as taken
    try {
      const result = await $fetch<{ logId: number; takenAt: string }>('/api/user/dashboard/log', {
        method: 'POST',
        body: {
          userSupplementId: dose.userSupplementId,
          scheduledTime: dose.scheduledTime,
          date: dateStr,
        }
      })
      dose.taken = true
      dose.takenAt = result.takenAt
      dose.logId = result.logId
      stats.value.taken++
    } catch (e: any) {
      error.value = e?.data?.message || 'Failed to log dose'
    }
  }
}

function navigateDate(delta: number) {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + delta)
  selectedDate.value = newDate
}

function getGroupDoses(groupId: string) {
  return doses.value.filter(d => d.timeLabel === groupId)
}

function getGroupStats(groupId: string) {
  const groupDoses = getGroupDoses(groupId)
  const total = groupDoses.length
  const taken = groupDoses.filter(d => d.taken).length
  return { taken, total }
}

// Watch for date changes
watch(selectedDate, () => {
  loadDashboard(formatDateStr(selectedDate.value))
})

onMounted(() => loadDashboard())
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <h1 class="page-title">Your Dashboard</h1>
      <p class="subtitle">Track your daily supplement intake</p>
    </header>

    <div v-if="loading && !doses.length" class="loading-state">Loading...</div>
    <p v-if="error" class="error-msg">{{ error }}</p>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <!-- Daily Progress -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">Today's Progress</p>
            <p class="stat-value">{{ stats.taken }}/{{ stats.total }}</p>
          </div>
          <div class="progress-ring">
            <svg viewBox="0 0 36 36" class="ring-svg">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="#e5e5e0"
                stroke-width="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="var(--secondary)"
                stroke-width="3"
                :stroke-dasharray="`${progressPercentage} 100`"
                stroke-linecap="round"
                class="progress-circle"
              />
            </svg>
            <span class="ring-text">{{ progressPercentage }}%</span>
              </div>
            </div>
          </div>

      <!-- Streak -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">Current Streak</p>
            <p class="stat-value">{{ stats.streak }} <span class="stat-unit">days</span></p>
            <p class="stat-hint">Keep it going!</p>
          </div>
          <div class="stat-icon green">
            <span class="icon-text">📈</span>
              </div>
            </div>
          </div>

      <!-- Weekly Consistency -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-label">Weekly Consistency</p>
            <p class="stat-value">{{ stats.weeklyConsistency }}%</p>
          </div>
          <div class="stat-icon orange">
            <span class="icon-text">📅</span>
          </div>
              </div>
            </div>
          </div>

    <!-- Weekly Chart -->
    <div class="card chart-card">
      <h2 class="card-title">This Week</h2>
      <div class="chart">
        <div 
          v-for="(day, index) in weeklyData" 
          :key="day.date" 
          class="chart-bar-wrapper"
        >
          <div class="chart-bar-track">
            <div 
              class="chart-bar-fill"
              :class="{ 'is-today': index === todayIndex }"
              :style="{ height: day.total > 0 ? `${(day.taken / day.total) * 100}%` : '0%' }"
            ></div>
          </div>
          <span 
            class="chart-day-label"
            :class="{ 'is-today': index === todayIndex }"
          >
            {{ day.day }}
          </span>
        </div>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div class="card schedule-card">
      <div class="schedule-header">
        <h2 class="card-title">{{ formattedDate }} Supplements</h2>
        <div class="date-nav">
          <button class="nav-btn" @click="navigateDate(-1)">‹</button>
          <button class="nav-btn" @click="navigateDate(1)">›</button>
        </div>
      </div>

      <div v-if="doses.length === 0 && !loading" class="empty-schedule">
        <p>No supplements scheduled for this day.</p>
        <NuxtLink to="/stack" class="link">Set up your schedule →</NuxtLink>
      </div>

      <div class="time-groups">
        <template v-for="group in TIME_GROUPS" :key="group.id">
          <div v-if="getGroupDoses(group.id).length > 0" class="time-group">
            <div class="group-header">
              <div class="group-icon">
                <span>{{ group.icon }}</span>
              </div>
              <div class="group-info">
                <p class="group-label">{{ group.label }}</p>
                <p class="group-time">{{ group.timeRange }}</p>
              </div>
              <span class="group-badge">
                {{ getGroupStats(group.id).taken }}/{{ getGroupStats(group.id).total }}
              </span>
            </div>

            <div class="dose-list">
              <div 
                v-for="dose in getGroupDoses(group.id)" 
                :key="dose.id"
                class="dose-item"
                :class="{ taken: dose.taken }"
              >
                <div class="dose-left">
                  <button 
                    class="check-btn"
                    :class="{ checked: dose.taken }"
                    @click="toggleDose(dose)"
                  >
                    <span v-if="dose.taken" class="check-icon">✓</span>
                  </button>
                  <div class="dose-info">
                    <p class="dose-name" :class="{ 'line-through': dose.taken }">
                      {{ dose.supplementName }}
                    </p>
                    <p class="dose-brand">{{ dose.supplementBrand || 'Generic' }}</p>
                  </div>
                </div>
                <div class="dose-right">
                  <p class="dose-time">
                    <span class="clock-icon">🕐</span>
                    {{ formatTime12h(dose.scheduledTime) }}
                  </p>
                  <p v-if="dose.taken && dose.takenAt" class="taken-time">
                    Taken at {{ dose.takenAt }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
          </div>
        </div>

    <!-- Add Button with Menu -->
    <button class="fab" @click="showAddMenu = true">+</button>
          
    <!-- Add Menu Modal -->
    <Teleport to="body">
      <div v-if="showAddMenu" class="add-menu-overlay" @click.self="showAddMenu = false">
            <div class="add-menu">
              <h3 class="menu-title">Add Supplement</h3>
              <div class="menu-options">
            <NuxtLink to="/database" class="menu-option" @click="showAddMenu = false">
                  <span class="option-icon">🔍</span>
                  <div class="option-text">
                    <span class="option-title">Search Database</span>
                    <span class="option-desc">Find supplements in our database</span>
                  </div>
                </NuxtLink>
                
            <NuxtLink to="/add-photo" class="menu-option" @click="showAddMenu = false">
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
    </Teleport>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  color: var(--primary);
  margin: 0 0 0.25rem 0;
  font-weight: 800;
}

.subtitle {
  color: var(--text-sub);
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-sub);
}

.error-msg {
  color: #b00020;
  margin-bottom: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-sub);
  margin: 0 0 0.25rem 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
  line-height: 1.2;
}

.stat-unit {
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-hint {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin: 0.25rem 0 0 0;
}

/* Progress Ring */
.progress-ring {
  width: 80px;
  height: 80px;
  position: relative;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-circle {
  transition: stroke-dasharray 0.5s ease;
}

.ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary);
}

/* Stat Icons */
.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.green {
  background: #e8f5ef;  /* Keep green for streak - represents growth */
}

.stat-icon.orange {
  background: #fef3e8;
}

.icon-text {
  font-size: 2rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 1rem 0;
}

/* Chart */
.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  height: 140px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
}

.chart-bar-track {
  flex: 1;
  width: 100%;
  background: #e5e5e0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.chart-bar-fill {
  width: 100%;
  background: #f9a366;
  border-radius: 8px;
  transition: height 0.5s ease;
  min-height: 4px;
}

.chart-bar-fill.is-today {
  background: var(--secondary);
}

.chart-day-label {
  font-size: 0.75rem;
  color: var(--text-sub);
}

.chart-day-label.is-today {
  font-weight: 700;
  color: var(--secondary);
}

/* Schedule Card */
.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.date-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-sub);
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
}

.nav-btn:hover {
  background: var(--bg-muted);
  color: var(--primary);
}

.empty-schedule {
  text-align: center;
  padding: 2rem;
  color: var(--text-sub);
}

.link {
  color: var(--secondary);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Time Groups */
.time-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.time-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.group-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fef3e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.group-info {
  flex: 1;
}

.group-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  margin: 0;
}

.group-time {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin: 0;
}

.group-badge {
  background: var(--bg-muted);
  color: var(--text-sub);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
}

/* Dose List */
.dose-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 2.75rem;
}

.dose-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: white;
  transition: all 0.15s;
}

.dose-item:hover {
  border-color: #ccc;
}

.dose-item.taken {
  background: #fef8f3;
  border-color: #fcd9b8;
}

.dose-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.check-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.check-btn:hover {
  border-color: var(--secondary);
}

.check-btn.checked {
  background: var(--secondary);
  border-color: var(--secondary);
}

.check-icon {
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
}

.dose-info {
  display: flex;
  flex-direction: column;
}

.dose-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary);
  margin: 0;
}

.dose-name.line-through {
  text-decoration: line-through;
  color: var(--text-sub);
}

.dose-brand {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin: 0;
}

.dose-right {
  text-align: right;
}

.dose-time {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-end;
}

.clock-icon {
  font-size: 0.75rem;
}

.taken-time {
  font-size: 0.75rem;
  color: var(--secondary);
  margin: 0.25rem 0 0 0;
}

/* FAB Button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--secondary);
  color: white;
  border: none;
  font-size: 2rem;
  font-weight: 400;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 50;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Add Menu */
.add-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}

@media (max-width: 600px) {
  .add-menu-overlay {
    align-items: flex-end;
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
  margin: 0 0 1.5rem 0;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .stats-grid {
  grid-template-columns: 1fr;
}

  .dose-list {
    margin-left: 0;
  }

  .dose-item {
  flex-direction: column;
    align-items: flex-start;
  gap: 0.5rem;
}

  .dose-right {
    text-align: left;
    margin-left: 2.5rem;
  }
}
</style>
