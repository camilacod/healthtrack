<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()

type StackItem = {
  id: number
  name: string
  brand: string | null
  form: string | null
  serving_size: string | null
  serving_unit: string | null
  per_serving: any
  category: string | null
  status: string
}

type Schedule = {
  id: number
  userSupplementId: number
  isActive: boolean
  days: number[]
  times: { time: string; label?: string }[]
}

const items = ref<StackItem[]>([])
const schedules = ref<Record<number, Schedule>>({})
const loading = ref(false)
const error = ref('')
const q = ref('')
const selectedCategory = ref<string | null>(null)

const CATEGORIES = [
  'Multivitamins',
  'Single Vitamins',
  'Minerals',
  'Functional Supplements',
  'Antioxidants',
  'Others',
]

// Modal state
const modalOpen = ref(false)
const selectedSupplement = ref<StackItem | null>(null)
const selectedDays = ref<number[]>([])
const selectedTimes = ref<string[]>([])
const timeMode = ref<'preset' | 'custom'>('preset')
const saving = ref(false)

const DAYS = [
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'Th' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
  { id: 0, label: 'Sun', short: 'Su' },
]

const TIME_PRESETS = [
  { id: 'morning', label: 'Morning', time: '08:00', display: '8:00 AM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00', display: '12:00 PM', icon: '🌤️' },
  { id: 'evening', label: 'Evening', time: '18:00', display: '6:00 PM', icon: '🌙' },
  { id: 'bedtime', label: 'Bedtime', time: '22:00', display: '10:00 PM', icon: '🌙' },
]

const HOURS = Array.from({ length: 20 }, (_, i) => {
  const hour24 = i + 4 // Start from 4 AM
  const hour12 = hour24 % 12 || 12
  const period = hour24 < 12 ? 'AM' : 'PM'
  const value = `${hour24.toString().padStart(2, '0')}:00`
  return { value, display: `${hour12}:00 ${period}` }
})

const filtered = computed(() => {
  let result = items.value

  // Filter by category
  if (selectedCategory.value) {
    if (selectedCategory.value === 'Others') {
      result = result.filter(i => !i.category || i.category === 'Others')
    } else {
      result = result.filter(i => i.category === selectedCategory.value)
    }
  }

  // Filter by search query
  if (q.value) {
  const s = q.value.toLowerCase()
    result = result.filter(i =>
    i.name.toLowerCase().includes(s) || (i.brand && i.brand.toLowerCase().includes(s)) || (i.form && i.form.toLowerCase().includes(s))
  )
  }

  return result
})

const canSave = computed(() => selectedDays.value.length > 0 && selectedTimes.value.length > 0)

const summaryDays = computed(() => {
  return selectedDays.value
    .sort((a, b) => {
      // Sort Monday first, Sunday last
      const order = [1, 2, 3, 4, 5, 6, 0]
      return order.indexOf(a) - order.indexOf(b)
    })
    .map(d => DAYS.find(day => day.id === d)?.label)
    .join(', ')
})

const summaryTimes = computed(() => {
  return selectedTimes.value
    .sort()
    .map(t => formatTime(t))
    .join(', ')
})

function formatTime(time24: string): string {
  const [h, m] = time24.split(':')
  const hour = parseInt(h)
  const hour12 = hour % 12 || 12
  const period = hour < 12 ? 'AM' : 'PM'
  return `${hour12}:${m} ${period}`
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    // Add timestamp to bust cache
    const ts = Date.now()
    const [supplementsData, schedulesData] = await Promise.all([
      $fetch<StackItem[]>(`/api/user/supplements?_t=${ts}`),
      $fetch<Record<number, Schedule>>(`/api/user/supplements/schedules?_t=${ts}`)
    ])
    items.value = supplementsData || []
    schedules.value = schedulesData || {}
  } catch (e: any) {
    console.error('Stack load error:', e)
    error.value = e?.data?.message || 'Failed to load your stack'
  } finally {
    loading.value = false
  }
}

// Reload data when navigating to this page
watch(() => route.fullPath, () => {
  if (route.path === '/stack') {
    load()
  }
})

function openScheduleModal(supplement: StackItem) {
  selectedSupplement.value = supplement
  const existing = schedules.value[supplement.id]
  if (existing) {
    selectedDays.value = [...existing.days]
    selectedTimes.value = existing.times.map(t => t.time)
    // Check if all times match presets
    const presetTimes = TIME_PRESETS.map(p => p.time)
    const allPreset = existing.times.every(t => presetTimes.includes(t.time))
    timeMode.value = allPreset && existing.times.length > 0 ? 'preset' : 'custom'
  } else {
    selectedDays.value = []
    selectedTimes.value = []
    timeMode.value = 'preset'
  }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  selectedSupplement.value = null
}

function toggleDay(dayId: number) {
  const idx = selectedDays.value.indexOf(dayId)
  if (idx >= 0) {
    selectedDays.value.splice(idx, 1)
  } else {
    selectedDays.value.push(dayId)
  }
}

function selectWeekdays() {
  selectedDays.value = [1, 2, 3, 4, 5]
}

function selectAllDays() {
  selectedDays.value = [0, 1, 2, 3, 4, 5, 6]
}

function toggleTime(time: string) {
  const idx = selectedTimes.value.indexOf(time)
  if (idx >= 0) {
    selectedTimes.value.splice(idx, 1)
  } else {
    selectedTimes.value.push(time)
  }
}

async function saveSchedule() {
  if (!selectedSupplement.value || !canSave.value) return
  saving.value = true
  try {
    const schedule = await $fetch<Schedule>(
      `/api/user/supplements/${selectedSupplement.value.id}/schedule`,
      {
        method: 'POST',
        body: {
          days: selectedDays.value,
          times: selectedTimes.value.map(t => ({ time: t }))
        }
      }
    )
    schedules.value[selectedSupplement.value.id] = schedule
    closeModal()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to save schedule'
  } finally {
    saving.value = false
  }
}

function getPerServingEntries(perServing: any): [string, number][] {
  const parsed = typeof perServing === 'string' ? JSON.parse(perServing || '{}') : perServing || {}
  return Object.entries(parsed)
    .filter(([, v]) => (v as number) > 0)
    .slice(0, 4) as [string, number][]
}

function getRemainingCount(perServing: any): number {
  const parsed = typeof perServing === 'string' ? JSON.parse(perServing || '{}') : perServing || {}
  const total = Object.entries(parsed).filter(([, v]) => (v as number) > 0).length
  return Math.max(0, total - 4)
}

function formatKey(key: string): string {
  return key.replace(/_/g, ' ')
}

function getDayAbbrev(dayId: number): string {
  return DAYS.find(d => d.id === dayId)?.short || ''
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
      <input v-model="q" placeholder="Search by name or brand..." class="search-input" />
      <select v-model="selectedCategory" class="category-filter">
        <option :value="null">All Categories</option>
        <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <span class="result-count">{{ filtered.length }} items</span>
    </div>

    <section class="card-container">
      <div v-if="loading" class="loading-state">Loading...</div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <div v-if="!loading && filtered.length === 0" class="empty-state">No items in your stack yet.</div>

      <div class="grid" v-if="filtered.length">
        <div class="supplement-card" v-for="item in filtered" :key="item.id">
          <div class="card-content">
            <h3 class="supplement-name">{{ item.name }}</h3>
            <p class="supplement-brand">{{ item.brand || 'Generic' }}</p>
            <p class="supplement-meta">
              <span v-if="item.form">{{ item.form }}</span>
              <span v-if="item.serving_size && item.serving_unit"> • {{ item.serving_size }} {{ item.serving_unit }}</span>
            </p>
            <span class="category-badge">{{ item.category || 'Others' }}</span>

            <div v-if="item.per_serving" class="per-serving">
              <p class="per-serving-label">Per serving</p>
              <div class="chips">
                <span 
                  class="chip" 
                  v-for="[key, value] in getPerServingEntries(item.per_serving)" 
                  :key="key"
                >
                  {{ formatKey(key) }}: {{ value }}
                </span>
                <span v-if="getRemainingCount(item.per_serving) > 0" class="chip">
                  +{{ getRemainingCount(item.per_serving) }} more
                </span>
              </div>
            </div>
          </div>

          <!-- Schedule Section -->
          <div class="schedule-section">
            <template v-if="schedules[item.id]?.days?.length">
              <div class="schedule-display">
                <div class="schedule-row">
                  <span class="schedule-icon">📅</span>
                  <div class="day-badges">
                    <span 
                      class="day-badge" 
                      v-for="day in schedules[item.id].days" 
                      :key="day"
                    >
                      {{ getDayAbbrev(day) }}
                    </span>
                  </div>
                </div>
                <div class="schedule-row">
                  <span class="schedule-icon">🕐</span>
                  <span class="schedule-times">
                    {{ schedules[item.id].times.map(t => formatTime(t.time)).join(', ') }}
                  </span>
                </div>
                <button class="edit-schedule-btn" @click="openScheduleModal(item)">
                  Edit schedule
                </button>
              </div>
            </template>
            <template v-else>
              <button class="add-schedule-btn" @click="openScheduleModal(item)">
                <span class="plus-icon">+</span>
                Add to schedule
              </button>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Schedule Modal -->
    <Teleport to="body">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <button class="modal-close" @click="closeModal">✕</button>
          
          <div class="modal-header">
            <h2 class="modal-title">Schedule {{ selectedSupplement?.name }}</h2>
            <p class="modal-subtitle">Choose which days and times to take this supplement</p>
          </div>

          <div class="modal-body">
            <!-- Days Selection -->
            <div class="section">
              <div class="section-header">
                <label class="section-label">Days</label>
                <div class="quick-actions">
                  <button class="quick-btn" @click="selectWeekdays">Weekdays</button>
                  <button class="quick-btn" @click="selectAllDays">Every day</button>
                </div>
              </div>
              <div class="days-grid">
                <button
                  v-for="day in DAYS"
                  :key="day.id"
                  class="day-btn"
                  :class="{ selected: selectedDays.includes(day.id) }"
                  @click="toggleDay(day.id)"
                >
                  {{ day.label }}
                </button>
              </div>
            </div>

            <!-- Time Selection -->
            <div class="section">
              <label class="section-label">Time</label>
              <div class="tabs">
                <button 
                  class="tab" 
                  :class="{ active: timeMode === 'preset' }"
                  @click="timeMode = 'preset'"
                >
                  Presets
                </button>
                <button 
                  class="tab" 
                  :class="{ active: timeMode === 'custom' }"
                  @click="timeMode = 'custom'"
                >
                  Custom
                </button>
              </div>

              <!-- Presets -->
              <div v-if="timeMode === 'preset'" class="presets-grid">
                <button
                  v-for="preset in TIME_PRESETS"
                  :key="preset.id"
                  class="preset-btn"
                  :class="{ selected: selectedTimes.includes(preset.time) }"
                  @click="toggleTime(preset.time)"
                >
                  <span class="preset-icon">{{ preset.icon }}</span>
                  <div class="preset-info">
                    <span class="preset-label">{{ preset.label }}</span>
                    <span class="preset-time">{{ preset.display }}</span>
                  </div>
                </button>
              </div>

              <!-- Custom Hours -->
              <div v-else class="hours-grid">
                <button
                  v-for="hour in HOURS"
                  :key="hour.value"
                  class="hour-btn"
                  :class="{ selected: selectedTimes.includes(hour.value) }"
                  @click="toggleTime(hour.value)"
                >
                  {{ hour.display }}
                </button>
              </div>
            </div>

            <!-- Summary -->
            <div v-if="selectedDays.length > 0 || selectedTimes.length > 0" class="summary">
              <p class="summary-title">SUMMARY</p>
              <p v-if="selectedDays.length > 0" class="summary-line">
                <span class="summary-label">Days:</span> {{ summaryDays }}
              </p>
              <p v-if="selectedTimes.length > 0" class="summary-line">
                <span class="summary-label">Times:</span> {{ summaryTimes }}
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Cancel</button>
            <button 
              class="btn-save" 
              :disabled="!canSave || saving"
              @click="saveSchedule"
            >
              {{ saving ? 'Saving...' : 'Save Schedule' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.stack-page { 
  max-width: 1200px; 
  margin: 0 auto; 
}

.page-header { margin-bottom: 1.5rem; }
.page-title { 
  font-size: 2rem; 
  color: var(--primary); 
  margin: 0 0 0.5rem 0; 
  font-weight: 800; 
}
.welcome-text { color: var(--text-sub); margin: 0; }

.search-row { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  margin-bottom: 1.5rem; 
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  width: 280px;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--secondary);
}

.category-filter {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  color: var(--text-main);
  cursor: pointer;
  min-width: 180px;
}

.category-filter:focus {
  outline: none;
  border-color: var(--secondary);
}

.result-count { color: var(--text-sub); }

.card-container { 
  background: white; 
  border-radius: 16px; 
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.loading-state, .empty-state { 
  color: var(--text-sub); 
  padding: 2rem; 
  text-align: center; 
}
.error-msg { color: #b00020; }

.grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
  gap: 1.5rem; 
}

/* Supplement Card */
.supplement-card { 
  background: white;
  border: 1px solid var(--border-color); 
  border-radius: 12px; 
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.supplement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
  border-color: #ddd;
}

.card-content {
  flex: 1;
}

.supplement-name { 
  font-weight: 700; 
  font-size: 1.1rem;
  color: var(--primary); 
  margin: 0 0 0.25rem 0;
}

.supplement-brand { 
  color: var(--text-sub); 
  font-size: 0.9rem;
  margin: 0 0 0.25rem 0;
}

.supplement-meta { 
  color: var(--text-sub); 
  font-size: 0.85rem; 
  margin: 0 0 0.5rem 0;
}

.category-badge {
  display: inline-block;
  font-size: 0.7rem;
  color: var(--secondary);
  background: #fef3e8;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.per-serving { margin-bottom: 1rem; }

.per-serving-label { 
  font-weight: 600; 
  font-size: 0.9rem;
  color: var(--primary); 
  margin: 0 0 0.5rem 0;
}

.chips { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.4rem; 
}

.chip { 
  background: var(--bg-muted); 
  border-radius: 9999px; 
  padding: 0.3rem 0.65rem; 
  font-size: 0.75rem;
  color: var(--text-sub);
}

/* Schedule Section */
.schedule-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  margin-top: auto;
}

.schedule-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.schedule-icon {
  font-size: 1rem;
  color: var(--secondary);
}

.day-badges {
  display: flex;
  gap: 0.25rem;
}

.day-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fef3e8;
  color: var(--secondary);
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-times {
  color: var(--text-sub);
  font-size: 0.9rem;
}

.edit-schedule-btn {
  background: none;
  border: none;
  color: var(--secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 0.25rem;
  text-align: left;
}

.edit-schedule-btn:hover {
  text-decoration: underline;
}

.add-schedule-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed var(--secondary);
  border-radius: 10px;
  background: transparent;
  color: var(--secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.add-schedule-btn:hover {
  background: #fef3e8;
}

.plus-icon {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-sub);
  cursor: pointer;
  padding: 0.25rem;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 0.5rem 0;
}

.modal-subtitle {
  color: var(--text-sub);
  font-size: 0.9rem;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--primary);
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-btn {
  background: none;
  border: none;
  color: var(--secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.quick-btn:hover {
  background: #fef3e8;
  border-radius: 4px;
}

.days-grid {
  display: flex;
  gap: 0.5rem;
}

.day-btn {
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 10px;
  background: var(--bg-muted);
  color: var(--text-sub);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.day-btn.selected {
  background: var(--primary);
  color: white;
}

.day-btn:hover:not(.selected) {
  background: #e5e5e0;
}

/* Tabs */
.tabs {
  display: flex;
  background: var(--bg-muted);
  border-radius: 8px;
  padding: 0.25rem;
  margin-bottom: 1rem;
}

.tab {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-sub);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.tab.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Presets Grid */
.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.preset-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-muted);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.preset-btn.selected {
  background: #fef3e8;
  border-color: var(--secondary);
}

.preset-btn:hover:not(.selected) {
  border-color: #ccc;
}

.preset-icon {
  font-size: 1.25rem;
}

.preset-info {
  display: flex;
  flex-direction: column;
}

.preset-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary);
}

.preset-time {
  font-size: 0.8rem;
  color: var(--text-sub);
}

/* Hours Grid */
.hours-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.25rem;
}

.hour-btn {
  padding: 0.6rem 0.5rem;
  border: none;
  border-radius: 8px;
  background: var(--bg-muted);
  color: var(--text-sub);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.hour-btn.selected {
  background: var(--secondary);
  color: white;
}

.hour-btn:hover:not(.selected) {
  background: #e5e5e0;
}

/* Summary */
.summary {
  background: var(--bg-muted);
  border-radius: 10px;
  padding: 1rem;
}

.summary-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.summary-line {
  font-size: 0.9rem;
  color: var(--primary);
  margin: 0 0 0.25rem 0;
}

.summary-label {
  color: var(--text-sub);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--primary);
}

.btn-cancel:hover {
  background: var(--bg-muted);
}

.btn-save {
  background: var(--secondary);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .search-row {
    flex-wrap: wrap;
  }

  .search-input,
  .category-filter {
    width: 100%;
    min-width: unset;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .days-grid {
    flex-wrap: wrap;
  }

  .day-btn {
    min-width: 40px;
  }

  .presets-grid {
    grid-template-columns: 1fr;
  }

  .hours-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
