<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerCamera() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function savePhoto() {
  // Placeholder for future logic
  alert('Photo saved! (Logic to be implemented)')
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="add-photo-page">
    <header class="page-header">
      <h1 class="title">Add Supplement Photo</h1>
      <p class="subtitle">Take a photo or upload an image of your supplement.</p>
    </header>

    <div class="photo-container">
      <div v-if="!imagePreview" class="placeholder-area" @click="triggerCamera">
        <span class="icon">📷</span>
        <p>Tap to take photo</p>
      </div>

      <div v-else class="preview-area">
        <img :src="imagePreview" alt="Preview" class="preview-img" />
        <button class="btn-retake" @click="triggerCamera">Retake</button>
      </div>

      <!-- Hidden file input -->
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*" 
        capture="environment"
        class="hidden-input"
        @change="handleFileChange"
      />
    </div>

    <div class="actions">
      <button class="btn btn-primary" :disabled="!imagePreview" @click="savePhoto">Use this Photo</button>
      <NuxtLink to="/dashboard" class="btn btn-text">Cancel</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.add-photo-page {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.page-header {
  margin-bottom: 2rem;
}

.title {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-sub);
}

.photo-container {
  margin-bottom: 2rem;
  border: 2px dashed #ccc;
  border-radius: 16px;
  padding: 1rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.photo-container:hover {
  border-color: var(--secondary);
}

.placeholder-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #999;
}

.icon {
  font-size: 3rem;
}

.preview-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preview-img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.hidden-input {
  display: none;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  width: 100%;
}

.btn-primary {
  background: var(--secondary);
  color: white;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-text {
  background: transparent;
  color: var(--text-sub);
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
}

.btn-retake {
  background: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

