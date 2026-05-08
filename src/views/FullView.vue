<script setup lang="ts">
import { computed } from 'vue'
import { useMarkdownStore } from '../store/markdown'
import { renderMarkdown, useMermaid } from '../utils/markdown'

const store = useMarkdownStore()

const compiledMarkdown = computed(() => {
  return renderMarkdown(store.content)
})

useMermaid(compiledMarkdown)

</script>

<template>
  <div class="h-full overflow-y-auto bg-[#26262a] py-12 px-4 sm:px-6 lg:px-8">
    <div
      class="max-w-3xl mx-auto p-8 prose prose-invert prose-zinc prose-lg prose-a:text-blue-400 prose-headings:text-[#f4f4f5] [&_pre]:bg-[#303036] [&_pre]:text-[#a1a1aa] [&_pre]:border [&_pre]:border-transparent [&_pre]:transition-colors [&_pre:hover]:border-purple-500 [&_.hljs]:!bg-transparent"
      v-html="compiledMarkdown"></div>
  </div>
</template>
