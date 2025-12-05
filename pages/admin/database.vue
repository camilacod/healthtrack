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

function formatPerServing(perServing: any): string {
  if (!perServing) return '-'
  if (typeof perServing === 'string') {
    try { perServing = JSON.parse(perServing) } catch { return perServing }
  }
  if (typeof perServing === 'object') {
    const entries = Object.entries(perServing).slice(0, 3)
    const formatted = entries.map(([k, v]) => `${k}: ${v}`).join(', ')
    return entries.length < Object.keys(perServing).length ? formatted + '...' : formatted
  }
  return '-'
}

// Product detail modal
const selectedProduct = ref<any>(null)

function openProductDetail(s: any) {
  selectedProduct.value = s
}

function closeProductDetail() {
  selectedProduct.value = null
}

function formatPerServingKey(key: string): string {
  return key
    .replace(/_mg$/i, ' (mg)')
    .replace(/_mcg$/i, ' (mcg)')
    .replace(/_g$/i, ' (g)')
    .replace(/_iu$/i, ' (IU)')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

// Edit mode
const editMode = ref(false)
const saving = ref(false)
const editForm = reactive({
  name: '',
  brand: '',
  form: '',
  servingSize: '',
  servingUnit: '',
  category: '',
  perServing: '',
})

const CATEGORIES = [
  'Multivitamins',
  'Single Vitamins',
  'Minerals',
  'Functional Supplements',
  'Antioxidants',
  'Others',
]

function startEdit() {
  if (!selectedProduct.value) return
  editForm.name = selectedProduct.value.name || ''
  editForm.brand = selectedProduct.value.brand || ''
  editForm.form = selectedProduct.value.form || ''
  editForm.servingSize = selectedProduct.value.servingSize || ''
  editForm.servingUnit = selectedProduct.value.servingUnit || ''
  editForm.category = selectedProduct.value.category || 'Others'
  editForm.perServing = selectedProduct.value.perServing 
    ? JSON.stringify(selectedProduct.value.perServing, null, 2) 
    : ''
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
}

async function saveEdit() {
  if (!selectedProduct.value) return
  saving.value = true
  try {
    let perServing = undefined
    if (editForm.perServing.trim()) {
      try {
        perServing = JSON.parse(editForm.perServing)
      } catch {
        alert('Invalid JSON in Per Serving field')
        saving.value = false
        return
      }
    }
    
    await $fetch(`/api/supplements/${selectedProduct.value.id}`, {
      method: 'PUT',
      body: {
        name: editForm.name,
        brand: editForm.brand || null,
        form: editForm.form || null,
        servingSize: editForm.servingSize || null,
        servingUnit: editForm.servingUnit || null,
        category: editForm.category || null,
        perServing,
      }
    })
    
    editMode.value = false
    closeProductDetail()
    await load()
  } catch (e: any) {
    alert(e?.data?.message || 'Error saving changes')
  } finally {
    saving.value = false
  }
}

// Delete confirmation
const deleteConfirmOpen = ref(false)
const deleting = ref(false)

function openDeleteConfirm() {
  deleteConfirmOpen.value = true
}

function closeDeleteConfirm() {
  deleteConfirmOpen.value = false
}

async function confirmDelete() {
  if (!selectedProduct.value) return
  deleting.value = true
  try {
    await $fetch(`/api/supplements/${selectedProduct.value.id}`, { method: 'DELETE' })
    closeDeleteConfirm()
    closeProductDetail()
    await load()
  } catch (e: any) {
    alert(e?.data?.message || 'Error deleting supplement')
  } finally {
    deleting.value = false
  }
}
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
              <th>Per Serving</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSupplements" :key="s.id" class="clickable-row" @click="openProductDetail(s)">
              <td class="cell-name">{{ s.name }}</td>
              <td>{{ s.brand || '-' }}</td>
              <td>{{ s.form || '-' }}</td>
              <td>{{ s.servingSize || '-' }}</td>
              <td>{{ s.servingUnit || '-' }}</td>
              <td class="cell-per-serving" :title="JSON.stringify(s.perServing)">{{ formatPerServing(s.perServing) }}</td>
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

    <!-- Product Detail Modal -->
    <div v-if="selectedProduct" class="modal-overlay" @click.self="closeProductDetail">
      <div class="modal-card">
        <button class="modal-close" @click="closeProductDetail">✕</button>
        
        <div class="modal-header">
          <div class="modal-icon">{{ selectedProduct.name.charAt(0) }}</div>
          <div class="modal-title-section">
            <span class="modal-brand">{{ selectedProduct.brand || 'Generic' }}</span>
            <h2 class="modal-title">{{ selectedProduct.name }}</h2>
            <span class="status-badge" :class="selectedProduct.status">{{ selectedProduct.status }}</span>
          </div>
        </div>

        <!-- View Mode -->
        <div v-if="!editMode" class="modal-body">
          <!-- Basic Info -->
          <div class="detail-section">
            <h3 class="section-title">Basic Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">ID</span>
                <span class="detail-value">{{ selectedProduct.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value category-badge">{{ selectedProduct.category || 'Others' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Form</span>
                <span class="detail-value">{{ selectedProduct.form || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Serving Size</span>
                <span class="detail-value">{{ selectedProduct.servingSize || '-' }} {{ selectedProduct.servingUnit || '' }}</span>
              </div>
            </div>
          </div>

          <!-- Per Serving Section -->
          <div class="detail-section" v-if="selectedProduct.perServing && Object.keys(selectedProduct.perServing).length">
            <h3 class="section-title">Nutritional Info (Per Serving)</h3>
            <div class="nutrients-grid">
              <div 
                v-for="(value, key) in selectedProduct.perServing" 
                :key="key" 
                class="nutrient-item"
              >
                <span class="nutrient-name">{{ formatPerServingKey(String(key)) }}</span>
                <span class="nutrient-value">{{ value }}</span>
              </div>
            </div>
          </div>
          <div v-else class="detail-section">
            <h3 class="section-title">Nutritional Info (Per Serving)</h3>
            <p class="no-data">No nutritional information available.</p>
          </div>

          <!-- Audit Info -->
          <div class="detail-section">
            <h3 class="section-title">Audit Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Created By</span>
                <span class="detail-value">{{ selectedProduct.createdByEmail || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created At</span>
                <span class="detail-value">{{ formatDate(selectedProduct.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Reviewed By</span>
                <span class="detail-value">{{ selectedProduct.reviewedByEmail || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Reviewed At</span>
                <span class="detail-value">{{ formatDate(selectedProduct.reviewedAt) }}</span>
              </div>
            </div>
            <div v-if="selectedProduct.reviewNotes" class="review-notes">
              <span class="detail-label">Review Notes</span>
              <p class="notes-text">{{ selectedProduct.reviewNotes }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="modal-actions">
            <button class="btn-edit" @click="startEdit">Edit</button>
            <button class="btn-delete" @click="openDeleteConfirm">Delete</button>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="modal-body">
          <div class="edit-form">
            <div class="form-row">
              <div class="form-group">
                <label>Name</label>
                <input v-model="editForm.name" class="form-input" placeholder="Supplement name" />
              </div>
              <div class="form-group">
                <label>Brand</label>
                <input v-model="editForm.brand" class="form-input" placeholder="Brand name" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Form</label>
                <input v-model="editForm.form" class="form-input" placeholder="capsule, tablet, powder..." />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select v-model="editForm.category" class="form-input">
                  <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Serving Size</label>
                <input v-model="editForm.servingSize" class="form-input" placeholder="e.g. 1" />
              </div>
              <div class="form-group">
                <label>Serving Unit</label>
                <input v-model="editForm.servingUnit" class="form-input" placeholder="capsule, tablet, scoop..." />
              </div>
            </div>
            <div class="form-group full-width">
              <label>Per Serving (JSON)</label>
              <textarea v-model="editForm.perServing" class="form-input form-textarea" rows="5" placeholder='{"vitamin_c_mg": 100, "zinc_mg": 15}'></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="cancelEdit">Cancel</button>
            <button class="btn-save" :disabled="saving" @click="saveEdit">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmOpen" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="confirm-modal">
        <div class="confirm-icon">⚠️</div>
        <h3 class="confirm-title">Delete supplement?</h3>
        <p class="confirm-text">
          Are you sure you want to delete <strong>{{ selectedProduct?.name }}</strong>? 
          This will also remove it from all user stacks and schedules. This action cannot be undone.
        </p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="closeDeleteConfirm">Cancel</button>
          <button class="btn-confirm-delete" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
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

.cell-per-serving {
  max-width: 220px;
  font-size: 0.85rem;
  color: var(--text-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
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

/* Clickable rows */
.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s;
}

.clickable-row:hover {
  background-color: #f9fafb;
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
  position: relative;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-header {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.modal-icon {
  width: 60px;
  height: 60px;
  background: var(--bg-cream, #fef3e8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-weight: 800;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.modal-title-section {
  flex: 1;
  min-width: 0;
}

.modal-brand {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-sub);
  letter-spacing: 0.05em;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0.25rem 0 0.5rem 0;
  line-height: 1.3;
}

.modal-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--text-sub);
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  color: var(--text-main);
}

.category-badge {
  display: inline-block;
  background: #fef3e8;
  color: var(--secondary, #f97316);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  width: fit-content;
}

.nutrients-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.nutrient-item {
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nutrient-name {
  font-size: 0.8rem;
  color: var(--text-sub);
  font-weight: 500;
}

.nutrient-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
}

.no-data {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-sub);
  background: #f9fafb;
  border-radius: 12px;
  margin: 0;
}

.review-notes {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 10px;
}

.notes-text {
  margin: 0.5rem 0 0 0;
  color: #92400e;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .detail-grid,
  .nutrients-grid {
    grid-template-columns: 1fr;
  }
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1.5rem;
}

.btn-edit,
.btn-delete,
.btn-cancel,
.btn-save,
.btn-confirm-delete {
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit {
  background: var(--primary);
  color: white;
  border: none;
}

.btn-edit:hover {
  opacity: 0.9;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
  border: none;
}

.btn-delete:hover {
  background: #fecaca;
}

.btn-cancel {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-save {
  background: var(--primary);
  color: white;
  border: none;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Edit Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-textarea {
  resize: vertical;
  font-family: monospace;
  font-size: 0.85rem;
}

/* Confirm Modal */
.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 0.75rem 0;
}

.confirm-text {
  color: var(--text-sub);
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.confirm-text strong {
  color: var(--primary);
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-confirm-delete {
  background: #dc2626;
  color: white;
  border: none;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-confirm-delete:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>

