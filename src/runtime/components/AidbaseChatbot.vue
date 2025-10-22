<script setup lang="ts">
import { useScriptTag } from '@vueuse/core'
import { onMounted } from 'vue'

interface Props {
  theme?: 'light' | 'dark'
  id: string
  classes?: string
  styles?: CSSStyleValue
}
const {
  theme = 'light',
  id,
  classes = 'fixed p-4 bottom-0 right-0 z-[99]',
} = defineProps<Props>()

const { load: loadChatbotScript } = useScriptTag(
  'https://client.aidbase.ai/chat.ab.js',
)

function addChatbotIdScript() {
  // Workaround as setting the chatbot ID directly to the element does not work for SPA navigation
  if (document.getElementById('aidbase-chat-id')) {
    document.body.removeChild(document.getElementById('aidbase-chat-id')!)
  }

  if (!document.getElementById('aidbase-chat-id')) {
    const script = document.createElement('script')
    script.id = 'aidbase-chat-id'
    script.innerHTML = `AIDBASE_CHATBOT_ID = '${id}';`
    document.body.appendChild(script)
  }
}

onMounted(async () => {
  addChatbotIdScript()
  await loadChatbotScript()
})
</script>

<template>
  <ClientOnly>
    <ab-chat
      :theme="theme"
      :class="classes"
      :style="styles"
    />
  </ClientOnly>
</template>
