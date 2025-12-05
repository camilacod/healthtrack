<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const me = ref<any>(null)
const pending = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<any | null>(null)
const editForm = reactive({
  id: 0,
  name: '',
  brand: '',
  form: '',
  servingSize: '',
  servingUnit: '',
  perServing: '' as any,
})

async function load() {
  loading.value = true
  try {
    pending.value = await $fetch('/api/supplements/pending')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load pending products'
  } finally {
    loading.value = false
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

async function publish(id: number) {
  if (!confirm('Publish this supplement?')) return
  await $fetch(`/api/supplements/${id}/publish`, { method: 'POST' })
  await load()
}

async function rejectItem(id: number) {
  const notes = prompt('Reason (optional):') || ''
  await $fetch(`/api/supplements/${id}/reject`, { method: 'POST', body: { notes } })
  await load()
}

function startCurate(p: any) {
  editing.value = p
  editForm.id = p.id
  editForm.name = p.name || ''
  editForm.brand = p.brand || ''
  editForm.form = p.form || ''
  editForm.servingSize = p.servingSize || ''
  editForm.servingUnit = p.servingUnit || ''
  editForm.perServing = p.perServing?.constructor === Object ? JSON.stringify(p.perServing) : (p.perServing || '') // JSON string
}

async function saveAndPublish() {
  if (!editing.value) return
  const id = editing.value.id
  const body: any = {
    name: editForm.name,
    brand: editForm.brand || null,
    form: editForm.form || null,
    servingSize: editForm.servingSize || null,
    servingUnit: editForm.servingUnit || null,
  }
  if (editForm.perServing && String(editForm.perServing).trim()) {
    body.perServing = editForm.perServing
  }
  await $fetch(`/api/supplements/${id}`, { method: 'PUT', body })
  await $fetch(`/api/supplements/${id}/publish`, { method: 'POST' })
  editing.value = null
  await load()
}

function cancelCurate() {
  editing.value = null
}
</script>

<template>
  <div class="products-page">
    <header class="page-header">
      <h1 class="page-title">Products Curation</h1>
      <p class="welcome-text">Review user-submitted supplements</p>
    </header>

    <section class="card">
      <div v-if="loading">Loading...</div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <div v-if="!loading && pending.length === 0" class="empty-state">No pending products</div>

      <div class="table-responsive" v-if="pending.length">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Form</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pending" :key="p.id">
              <td>{{ p.id }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.brand || '-' }}</td>
              <td>{{ p.form || '-' }}</td>
              <td>{{ new Date(p.createdAt).toLocaleString() }}</td>
              <td>
                <div class="toolbar">
                  <button class="btn btn-primary btn-sm" @click="publish(p.id)">Publish</button>
                  <button class="btn btn-outline btn-sm" @click="startCurate(p)">Curate</button>
                  <button class="btn btn-danger btn-sm" @click="rejectItem(p.id)">Reject</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Curate Modal -->
    <div v-if="editing" class="modal-overlay" @click.self="cancelCurate">
      <div class="modal">
        <h2 class="modal-title">Curate Product #{{ editForm.id }}</h2>
        <div class="form-grid">
          <div class="field">
            <label>Name</label>
            <input class="input" v-model="editForm.name" />
          </div>
          <div class="field">
            <label>Brand</label>
            <input class="input" v-model="editForm.brand" />
          </div>
          <div class="field">
            <label>Form</label>
            <input class="input" v-model="editForm.form" placeholder="capsule | tablet | powder | liquid | gummy" />
          </div>
          <div class="field">
            <label>Serving Size</label>
            <input class="input" v-model="editForm.servingSize" placeholder="e.g. 1" />
          </div>
          <div class="field">
            <label>Serving Unit</label>
            <input class="input" v-model="editForm.servingUnit" placeholder="capsule | tablet | scoop | ml | g" />
          </div>
          <div class="field col-span-2">
            <label>Per Serving (JSON)</label>
            <textarea class="input" rows="6" v-model="editForm.perServing" placeholder='{"vitamin_c_mg": 100, "zinc_mg": 5}'></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveAndPublish">Save & Publish</button>
          <button class="btn btn-secondary" @click="cancelCurate">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.products-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header { margin-bottom: 2rem; }
.page-title { font-size: 2rem; color: var(--primary); margin: 0 0 0.5rem 0; font-weight: 800; }
.welcome-text { color: var(--text-sub); font-size: 1.1rem; margin: 0; }

.card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); }
.error-msg { color: #b00020; }
.empty-state { color: var(--text-sub); }
.table-responsive { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--border-color); padding: 0.75rem; text-align: left; }
.toolbar { display: flex; gap: 0.5rem; }
.btn-sm { padding: 0.4rem 0.7rem; border-radius: 6px; }
.btn-danger { background: #ef4444; color: white; border: none; }
.btn-primary { background: var(--primary); color: white; border: none; }
.btn-outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
.modal { background: white; border-radius: 16px; padding: 1.5rem; max-width: 720px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-title { margin: 0 0 1rem 0; color: var(--primary); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.col-span-2 { grid-column: span 2; }
.modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
</style>
