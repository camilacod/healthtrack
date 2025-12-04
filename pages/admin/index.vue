<script setup lang="ts">
const users = ref<any[]>([])
const admins = ref<any[]>([])
const summary = ref<{ users: number; supplements: number } | null>(null)
const me = ref<any>(null)

async function refreshAll() {
  const [u, a, s] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/admins'),
    $fetch('/api/admin/summary'),
  ])
  users.value = u as any[]
  admins.value = a as any[]
  summary.value = s as any
}

onMounted(async () => {
  try {
    me.value = await $fetch('/api/auth/me')
    if (!me.value?.isAdmin) {
      navigateTo('/admin/login')
      return
    }
    await refreshAll()
  } catch {
    navigateTo('/admin/login')
  }
})


const editing = reactive<Record<string, { email: string; username: string }>>({})
function startEdit(u: any) {
  editing[u.id] = { email: u.email, username: u.username || '' }
}

async function saveEdit(id: string) {
  const payload = editing[id]
  await $fetch(`/api/users/${id}`, { method: 'PUT', body: payload })
  delete editing[id]
  await refreshAll()
}

async function removeUser(id: string) {
  if (!confirm('Delete user?')) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  await refreshAll()
}

function isAdmin(userId: string) {
  return admins.value.some((a) => a.userId === userId)
}

async function addAdmin(userId: string) {
  await $fetch('/api/admins', { method: 'POST', body: { userId } })
  await refreshAll()
}

async function removeAdmin(userId: string) {
  await $fetch(`/api/admins/${userId}`, { method: 'DELETE' })
  await refreshAll()
}

function cancelEdit(id: string) {
  delete editing[id]
}


/* Unused imports removed */
</script>

<template>
  <div class="admin-dashboard">
    <div class="container">
      <header class="header-row">
        <div class="header-left">
          <!-- <img src="/images/logo.png" alt="Logo" class="header-logo" /> -->
          <h1 class="title">Admin Dashboard</h1>
        </div>
        <NuxtLink class="back-link" to="/">Back to Home</NuxtLink>
      </header>

      <section class="stats-grid">
        <div class="card stat-card">
          <div class="stat-title">Users</div>
          <div class="stat-value">{{ summary?.users ?? users.length }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-title">Supplements</div>
          <div class="stat-value">{{ summary?.supplements ?? 0 }}</div>
        </div>
      </section>

      <section class="card table-card">
        <h2 class="section-title">User Management</h2>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Username</th>
                <th>Created</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td class="cell-id" :title="u.id">
                  {{ u.id }}
                </td>
                <td>
                  <template v-if="editing[u.id]">
                    <input class="input" v-model="editing[u.id]!.email" />
                  </template>
                  <template v-else>{{ u.email }}</template>
                </td>
                <td>
                  <template v-if="editing[u.id]">
                    <input class="input" v-model="editing[u.id]!.username" />
                  </template>
                  <template v-else>{{ u.username }}</template>
                </td>
                <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                <td>
                  <span v-if="isAdmin(u.id)" class="badge-admin">Yes</span>
                  <span v-else class="badge-user">No</span>
                </td>
                <td class="actions-cell">
                  <div class="toolbar">
                    <template v-if="editing[u.id]">
                      <button class="btn btn-primary btn-sm" @click="saveEdit(u.id)">Save</button>
                      <button class="btn btn-secondary btn-sm" @click="cancelEdit(u.id)">Cancel</button>
                    </template>
                    <template v-else>
                      <button class="btn btn-primary btn-sm" @click="startEdit(u)">Edit</button>
                      <button class="btn btn-danger btn-sm" @click="removeUser(u.id)">Delete</button>
                    </template>
                    
                    <div class="admin-actions">
                       <template v-if="!isAdmin(u.id)">
                        <button class="btn btn-outline btn-sm btn-fixed-width" @click="addAdmin(u.id)">Make Admin</button>
                      </template>
                      <template v-else>
                        <button class="btn btn-secondary btn-sm btn-fixed-width" @click="removeAdmin(u.id)">Remove Admin</button>
                      </template>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  background-color: var(--bg-cream);
  min-height: 100vh;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text-main);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-logo {
  height: 40px;
  width: auto;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
}

.back-link {
  color: var(--text-sub);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.back-link:hover {
  color: var(--primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  text-align: center;
}

.stat-title {
  color: var(--text-sub);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
}

.table-card {
  padding: 2rem;
}

.section-title {
  font-size: 1.2rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  font-weight: 700;
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
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.actions-cell {
  white-space: nowrap;
  min-width: 400px;
}

.cell-id {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  color: var(--text-sub);
  font-size: 0.85rem;
}

/* Removed hover effects and feedback styles */

.badge-admin {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-user {
  background: #eee;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.admin-actions {
  display: contents;
}

.btn {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-sm {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}
.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #94a3b8;
  color: white;
}
.btn-secondary:hover {
  background: #64748b;
}

.btn-danger {
  background: #ef4444;
  color: white;
}
.btn-danger:hover {
  background: #dc2626;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
}
.btn-outline:hover {
  background: var(--primary);
  color: white;
}

.btn-fixed-width {
  min-width: 120px;
  justify-content: center;
  display: inline-flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
}
.input:focus {
  outline: none;
  border-color: var(--primary);
}
</style>
