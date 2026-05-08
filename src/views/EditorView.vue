<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useMarkdownStore } from '../store/markdown'
import { renderMarkdown, useMermaid } from '../utils/markdown'
import {
  Undo, Redo, Bold, Italic, Strikethrough, Heading,
  Code, Quote, List, ListOrdered, CheckSquare,
  Link, Image, Table, Minus, MessageSquare, Eye,
  Sigma, Workflow, FileText
} from 'lucide-vue-next'

const store = useMarkdownStore()
const editorRef = ref<HTMLTextAreaElement | null>(null)

const compiledMarkdown = computed(() => {
  return renderMarkdown(store.content)
})

useMermaid(compiledMarkdown)

const insertFormat = (before: string, after: string = '') => {
  if (!editorRef.value) return

  const textarea = editorRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  const text = store.content
  const selection = text.substring(start, end)

  const newText = text.substring(0, start) + before + selection + after + text.substring(end)
  store.content = newText

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selection.length)
  })
}

const insertFrontmatter = () => {
  const date = new Date().toISOString().split('T')[0]
  const template = `---\ntitle: \nauthor: \ntags: []\ndate: ${date}\n---\n\n`
  store.content = template + store.content
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.focus()
      editorRef.value.setSelectionRange(11, 11)
    }
  })
}

const wordCount = computed(() => {
  const text = store.content.trim()
  if (!text) return 0
  return text.split(/\s+/).length
})

const charCount = computed(() => store.content.length)
</script>

<template>
  <div class="h-full flex">
    <div class="w-1/2 h-full border-r border-[#2d2d2d]/60 flex flex-col bg-[#26262a] animate-slide-left">
      <div
        class="h-10 border-b border-[#2d2d2d]/60 flex items-center px-2 bg-[#252526] shrink-0 gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button class="toolbar-btn" title="Deshacer">
          <Undo :size="14" stroke-width="1.8" />
        </button>
        <button class="toolbar-btn" title="Rehacer">
          <Redo :size="14" stroke-width="1.8" />
        </button>

        <div class="toolbar-sep"></div>

        <button @click="insertFrontmatter" class="toolbar-btn" title="Añadir Metadatos">
          <FileText :size="14" stroke-width="1.8" />
        </button>

        <div class="toolbar-sep"></div>

        <button @click="insertFormat('**', '**')" class="toolbar-btn" title="Negrita">
          <Bold :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('*', '*')" class="toolbar-btn" title="Cursiva">
          <Italic :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('~~', '~~')" class="toolbar-btn" title="Tachado">
          <Strikethrough :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('### ')" class="toolbar-btn" title="Título">
          <Heading :size="14" stroke-width="1.8" />
        </button>

        <div class="toolbar-sep"></div>

        <button @click="insertFormat('`', '`')" class="toolbar-btn" title="Código">
          <Code :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('> ')" class="toolbar-btn" title="Cita">
          <Quote :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('- ')" class="toolbar-btn" title="Lista">
          <List :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('1. ')" class="toolbar-btn" title="Lista numerada">
          <ListOrdered :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('- [ ] ')" class="toolbar-btn" title="Tarea">
          <CheckSquare :size="14" stroke-width="1.8" />
        </button>

        <div class="toolbar-sep"></div>

        <button @click="insertFormat('[', '](url)')" class="toolbar-btn" title="Enlace">
          <Link :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('![alt](', ')')" class="toolbar-btn" title="Imagen">
          <Image :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('\n| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n')"
          class="toolbar-btn" title="Tabla">
          <Table :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('\n---\n')" class="toolbar-btn" title="Línea">
          <Minus :size="14" stroke-width="1.8" />
        </button>

        <button @click="insertFormat('$', '$')" class="toolbar-btn" title="Fórmula Matemática">
          <Sigma :size="14" stroke-width="1.8" />
        </button>
        <button @click="insertFormat('\n```mermaid\ngraph TD\n  A-->B;\n```\n')" class="toolbar-btn" title="Diagrama Mermaid">
          <Workflow :size="14" stroke-width="1.8" />
        </button>

        <div class="toolbar-sep"></div>

        <button class="toolbar-btn" title="Comentario">
          <MessageSquare :size="14" stroke-width="1.8" />
        </button>
      </div>

      <textarea ref="editorRef" v-model="store.content"
        class="flex-1 w-full bg-transparent text-[#d4d4d8] p-6 resize-none outline-none font-['JetBrains_Mono',monospace] text-[14px] leading-[1.75] tracking-[0.01em] placeholder:text-[#52525b] caret-blue-400/70"
        spellcheck="false"
        placeholder="Escribe markdown aquí..."></textarea>

      <div class="h-6 border-t border-[#2d2d2d]/40 flex items-center px-4 bg-[#252526] shrink-0 gap-4">
        <span class="text-[10px] text-[#52525b] font-['Inter',sans-serif] tracking-wider uppercase">Markdown</span>
        <div class="flex-1"></div>
        <span class="text-[10px] text-[#52525b] font-['Inter',sans-serif] tabular-nums transition-opacity duration-300">{{ wordCount }} palabras</span>
        <span class="text-[10px] text-[#52525b] font-['Inter',sans-serif] tabular-nums transition-opacity duration-300">{{ charCount }} chars</span>
      </div>
    </div>

    <div class="w-1/2 h-full flex flex-col bg-[#26262a] animate-slide-right">
      <div
        class="h-10 border-b border-[#2d2d2d]/60 flex items-center px-4 bg-[#252526] shrink-0 gap-2">
        <Eye :size="13" stroke-width="1.8" class="text-[#52525b]" />
        <span class="text-[11px] text-[#52525b] font-['Inter',sans-serif] font-medium tracking-[0.08em] uppercase select-none">Preview</span>
      </div>
      <div
        class="flex-1 overflow-y-auto p-8 prose prose-invert prose-zinc max-w-none prose-a:text-blue-400 prose-headings:text-[#f4f4f5] [&_pre]:bg-[#303036] [&_pre]:text-[#a1a1aa] [&_pre]:border [&_pre]:border-transparent [&_pre]:transition-colors [&_pre]:duration-200 [&_pre:hover]:border-purple-500 [&_.hljs]:bg-transparent!"
        v-html="compiledMarkdown"></div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #71717a;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.toolbar-btn:hover {
  background: #3e3e42;
  color: #d4d4d8;
  transform: translateY(-1px);
}

.toolbar-btn:active {
  transform: scale(0.9) translateY(0);
  background: #4a4a50;
}

.toolbar-sep {
  width: 1px;
  height: 14px;
  background: #3e3e42;
  margin: 0 4px;
  flex-shrink: 0;
  opacity: 0.6;
}
</style>
