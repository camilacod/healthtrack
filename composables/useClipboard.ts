export const useClipboard = () => {
  const copied = ref(false)
  const text = ref('')
  const isSupported = ref(false)

  onMounted(() => {
    isSupported.value = !!navigator.clipboard
  })

  const copy = async (input: string) => {
    if (!isSupported.value) return false
    
    try {
      await navigator.clipboard.writeText(input)
      text.value = input
      copied.value = true
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        copied.value = false
      }, 2000)
      
      return true
    } catch (e) {
      console.error('Clipboard copy failed', e)
      return false
    }
  }

  return {
    copy,
    copied,
    text,
    isSupported
  }
}

