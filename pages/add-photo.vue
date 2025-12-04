<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)
const error = ref('')

type VisionMatch = { status: 'match'; match: { id: number; name: string; brand: string | null; status: string }; score: number }
type VisionPending = { status: 'pending'; supplementId: number; product: { name: string; brand: string | null; form: string | null; servingSize?: any; servingUnit?: any; perServing?: any } }
type VisionGeneric = { status: 'generic_suggestion'; generic: { id: number; name: string; brand: string | null; status: string }; product: { name: string; brand: string | null; form: string | null; servingSize?: any; servingUnit?: any; perServing?: any } }
type VisionNone = { status: 'no_match'; items: any[] }
const visionResult = ref<VisionMatch | VisionPending | VisionGeneric | VisionNone | null>(null)

function triggerCamera() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function savePhoto() {
  error.value = ''
  if (!selectedFile.value) {
    error.value = 'Please select a photo first.'
    return
  }
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('image', selectedFile.value, selectedFile.value.name || 'photo.jpg')
    const res = await $fetch('/api/vision/supplement', { method: 'POST', body: fd })
    visionResult.value = res as any
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to analyze photo'
  } finally {
    loading.value = false
  }
}

async function confirmAddToStack(supplementId: number) {
  try {
    await $fetch('/api/user/supplements', { method: 'POST', body: { supplementId, relation: 'uses' } })
    navigateTo('/stack')
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to add to stack'
  }
}

async function submitBrandVersion() {
  const r = visionResult.value as any
  if (!r || (r.status !== 'generic_suggestion' && r.status !== 'pending')) return
  const p = r.product
  try {
    const res = await $fetch('/api/supplements/submit', { method: 'POST', body: p })
    visionResult.value = { status: 'pending', supplementId: (res as any).supplementId, product: p } as any
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to submit product'
  }
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
      <button class="btn btn-primary" :disabled="!imagePreview || loading" @click="savePhoto">
        {{ loading ? 'Analyzing...' : 'Recognize Product' }}
      </button>
      <NuxtLink to="/dashboard" class="btn btn-text">Cancel</NuxtLink>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>

    <!-- Result Cards -->
    <div v-if="visionResult" class="result-card">
      <!-- Match proposal -->
      <template v-if="visionResult.status === 'match'">
        <h2 class="result-title">We found a match</h2>
        <div class="result-item">
          <div class="result-name">{{ visionResult.match.name }}</div>
          <div class="result-meta">Brand: {{ visionResult.match.brand || '-' }}</div>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" @click="confirmAddToStack(visionResult.match.id)">Add to My Stack</button>
          <NuxtLink to="/" class="btn btn-text">Cancel</NuxtLink>
        </div>
      </template>

      <!-- Pending creation -->
      <template v-else-if="visionResult.status === 'pending'">
        <h2 class="result-title">Submitted for Review</h2>
        <div class="result-item">
          <div class="result-name">{{ visionResult.product.name }}</div>
          <div class="result-meta">Brand: {{ visionResult.product.brand || '-' }}</div>
        </div>
        <p class="disclaimer">
          Our team will evaluate your product request. Once approved,
          it will appear in your Stack automatically.
        </p>
        <div class="result-actions">
          <NuxtLink to="/dashboard" class="btn btn-primary">Got it</NuxtLink>
        </div>
      </template>

      <!-- Generic suggestion: name matches but brand differs; offer Generic or submit Brand -->
      <template v-else-if="visionResult.status === 'generic_suggestion'">
        <h2 class="result-title">We have it as Generic</h2>
        <div class="result-item">
          <div class="result-name">{{ visionResult.generic.name }}</div>
          <div class="result-meta">Brand: {{ visionResult.generic.brand || 'Generic' }}</div>
        </div>
        <p class="disclaimer">
          We found a published Generic version of your product. You can add it now,
          or submit your specific brand for review.
        </p>
        <div class="result-actions">
          <button class="btn btn-primary" @click="confirmAddToStack(visionResult.generic.id)">Add Generic to My Stack</button>
          <button class="btn btn-secondary" @click="submitBrandVersion">Submit Brand Version</button>
        </div>
      </template>

      <!-- Nothing identifiable -->
      <template v-else>
        <h2 class="result-title">We couldn’t identify a product</h2>
        <p class="disclaimer">Try a clearer front-facing photo of the label.</p>
      </template>
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
  text-align: center;
}

.error-msg {
  color: #b00020;
  margin-top: 1rem;
}

.result-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.result-title {
  color: var(--primary);
  margin: 0 0 0.5rem 0;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-name {
  font-weight: 700;
}

.result-meta {
  color: var(--text-sub);
}

.result-actions {
  display: flex;
  gap: 0.5rem;
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
