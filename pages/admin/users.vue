<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const users = ref<any[]>([])
const admins = ref<any[]>([])
const me = ref<any>(null)

async function refreshAll() {
  const [u, a] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/admins'),
  ])
  users.value = u as any[]
  admins.value = a as any[]
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
</script>

<template>
  <div class="users-page">
    <header class="page-header">
      <h1 class="page-title">User Management</h1>
      <p class="welcome-text">Manage users and admin privileges</p>
    </header>

    <section class="card table-card">
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
</template>

<style scoped>
.users-page {
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

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  
  .table-responsive {
    overflow-x: scroll;
  }
}
</style>

