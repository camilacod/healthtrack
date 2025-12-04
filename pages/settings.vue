<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const profile = reactive({
  email: '',
  username: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showPasswordSection = ref(false)

async function loadProfile() {
  loading.value = true
  try {
    const me = await $fetch<{ user: { email: string; username: string | null } }>('/api/auth/me')
    if (me?.user) {
      profile.email = me.user.email
      profile.username = me.user.username || ''
    }
  } catch (e: any) {
    error.value = 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  error.value = ''
  success.value = ''
  saving.value = true

  try {
    const body: any = {
      email: profile.email,
      username: profile.username || null,
    }

    // Include password if changing
    if (showPasswordSection.value && passwordForm.newPassword) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        error.value = 'Passwords do not match'
        saving.value = false
        return
      }
      if (passwordForm.newPassword.length < 6) {
        error.value = 'Password must be at least 6 characters'
        saving.value = false
        return
      }
      body.currentPassword = passwordForm.currentPassword
      body.newPassword = passwordForm.newPassword
    }

    await $fetch('/api/user/profile', {
      method: 'PUT',
      body,
    })

    success.value = 'Profile updated successfully!'
    
    // Clear password fields
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showPasswordSection.value = false

  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

function togglePasswordSection() {
  showPasswordSection.value = !showPasswordSection.value
  if (!showPasswordSection.value) {
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="subtitle">Manage your account settings</p>
    </header>

    <div v-if="loading" class="loading-state">Loading...</div>

    <div v-else class="settings-content">
      <!-- Profile Section -->
      <section class="card">
        <h2 class="section-title">Profile Information</h2>
        
        <div class="form-group">
          <label class="form-label">Email</label>
          <input 
            v-model="profile.email" 
            type="email" 
            class="form-input"
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Username</label>
          <input 
            v-model="profile.username" 
            type="text" 
            class="form-input"
            placeholder="Choose a username"
          />
          <p class="form-hint">This is how you'll appear in the app</p>
        </div>
      </section>

      <!-- Password Section -->
      <section class="card">
        <div class="section-header">
          <h2 class="section-title">Password</h2>
          <button 
            type="button" 
            class="btn-text"
            @click="togglePasswordSection"
          >
            {{ showPasswordSection ? 'Cancel' : 'Change Password' }}
          </button>
        </div>

        <div v-if="showPasswordSection" class="password-form">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input 
              v-model="passwordForm.currentPassword" 
              type="password" 
              class="form-input"
              placeholder="Enter current password"
            />
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              class="form-input"
              placeholder="Enter new password"
            />
            <p class="form-hint">Must be at least 6 characters</p>
          </div>

          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              class="form-input"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <p v-else class="password-hint">
          ••••••••
        </p>
      </section>

      <!-- Messages -->
      <div v-if="error" class="message error-message">
        {{ error }}
      </div>
      <div v-if="success" class="message success-message">
        {{ success }}
      </div>

      <!-- Save Button -->
      <div class="actions">
        <button 
          class="btn-save" 
          :disabled="saving"
          @click="saveProfile"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 1rem 0;
}

.section-header .section-title {
  margin: 0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-main);
  transition: border-color 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary);
}

.form-input::placeholder {
  color: #999;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-sub);
  margin: 0.4rem 0 0 0;
}

.btn-text {
  background: none;
  border: none;
  color: var(--secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-text:hover {
  text-decoration: underline;
}

.password-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.password-hint {
  color: var(--text-sub);
  font-size: 1.1rem;
  letter-spacing: 2px;
  margin: 0;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.error-message {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.success-message {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  background: var(--secondary);
  color: white;
  border: none;
  padding: 0.85rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .settings-page {
    padding: 0 1rem;
  }
  
  .card {
    padding: 1.25rem;
  }
}
</style>

