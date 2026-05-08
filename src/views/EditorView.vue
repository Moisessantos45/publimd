<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useMarkdownStore } from '../store/markdown'
import { renderMarkdown, useMermaid } from '../utils/markdown'
import html2canvas from 'html2canvas-pro'
import {
  Undo, Redo, Bold, Italic, Strikethrough, Heading,
  Code, Quote, List, ListOrdered, CheckSquare,
  Link, Image, Table, Minus, MessageSquare, Eye,
  Sigma, Workflow, FileText, Download, ImageDown
} from 'lucide-vue-next'
import { COLOR_ATTRS, INLINE_PROPS } from '../utils/colors'

const store = useMarkdownStore()
const editorRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)

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

const downloadMarkdown = () => {
  const content = store.content || ''
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'document.md'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const OKLCH_REGEX = /oklch\([^)]*\)/gi
let oklchCtx: CanvasRenderingContext2D | null = null

const normalizeOklch = (value: string) => {
  if (!value || !value.includes('oklch(')) return value
  if (!oklchCtx) {
    const canvas = document.createElement('canvas')
    oklchCtx = canvas.getContext('2d')
  }
  if (!oklchCtx) return value

  return value.replace(OKLCH_REGEX, match => {
    try {
      oklchCtx!.fillStyle = '#000'
      oklchCtx!.fillStyle = match
      return typeof oklchCtx!.fillStyle === 'string' ? oklchCtx!.fillStyle : match
    } catch {
      return match
    }
  })
}


const sanitizeOklchAttributes = (doc: Document, root: HTMLElement) => {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  let node = root as Element | null
  while (node) {
    COLOR_ATTRS.forEach(attr => {
      const raw = node?.getAttribute(attr)
      if (!raw || !raw.includes('oklch(')) return
      const nextVal = normalizeOklch(raw)
      node?.setAttribute(attr, nextVal)
    })
    node = walker.nextNode() as Element | null
  }
}

const inlineComputedStyles = (srcRoot: HTMLElement, clonedRoot: HTMLElement) => {
  const srcEls = [srcRoot, ...Array.from(srcRoot.querySelectorAll<HTMLElement>('*'))]
  const clEls = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll<HTMLElement>('*'))]

  srcEls.forEach((src, i) => {
    const cl = clEls[i]
    if (!cl) return
    const computed = window.getComputedStyle(src)
    INLINE_PROPS.forEach(prop => {
      const val = computed.getPropertyValue(prop)
      if (!val) return
      const nextVal = normalizeOklch(val)
      cl.style.setProperty(prop, nextVal, 'important')
    })
  })
}

const downloadPreviewImage = async () => {
  if (!previewRef.value) return

  try {
    const canvas = await html2canvas(previewRef.value, {
      backgroundColor: '#26262a',
      foreignObjectRendering: false,
      scale: Math.min(window.devicePixelRatio || 1, 2),
      useCORS: true,
      logging: false,
      onclone: (clonedDoc, clonedEl) => {
        clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(s => s.remove())

        inlineComputedStyles(previewRef.value!, clonedEl)
        sanitizeOklchAttributes(clonedDoc, clonedEl)

        clonedEl.style.setProperty('background-color', '#26262a', 'important')
        clonedEl.style.setProperty('color', '#d4d4d8', 'important')
      }
    })

    const url = canvas.toDataURL('image/jpeg', 0.92)
    const link = document.createElement('a')
    link.href = url
    link.download = 'preview.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('No se pudo generar la imagen del preview.', error)
  }
}
</script>

<template>
  <div class="h-full flex">
    <div class="w-1/2 h-full flex flex-col bg-[#26262a] animate-slide-left">
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
        <button @click="insertFormat('\n```mermaid\ngraph TD\n  A-->B;\n```\n')" class="toolbar-btn"
          title="Diagrama Mermaid">
          <Workflow :size="14" stroke-width="1.8" />
        </button>

        <div class="toolbar-sep"></div>

        <button class="toolbar-btn" title="Comentario">
          <MessageSquare :size="14" stroke-width="1.8" />
        </button>
      </div>

      <textarea ref="editorRef" v-model="store.content"
        class="flex-1 w-full bg-transparent text-[#d4d4d8] p-6 resize-none outline-none font-['JetBrains_Mono',monospace] text-[14px] leading-[1.75] tracking-[0.01em] placeholder:text-[#52525b] caret-blue-400/70"
        spellcheck="false" placeholder="Escribe markdown aquí..."></textarea>

      <div class="h-6 border-t border-[#2d2d2d]/40 flex items-center px-4 bg-[#252526] shrink-0 gap-4">
        <span class="text-[10px] text-[#52525b] font-['Inter',sans-serif] tracking-wider uppercase">Markdown</span>
        <div class="flex-1"></div>
        <span
          class="text-[10px] text-[#52525b] font-['Inter',sans-serif] tabular-nums transition-opacity duration-300">{{
            wordCount }} palabras</span>
        <span
          class="text-[10px] text-[#52525b] font-['Inter',sans-serif] tabular-nums transition-opacity duration-300">{{
            charCount }} chars</span>
      </div>
    </div>

    <div class="divider"></div>

    <div class="w-1/2 h-full flex flex-col bg-[#26262a] animate-slide-right">
      <div class="h-10 border-b border-[#2d2d2d]/60 flex items-center px-4 bg-[#252526] shrink-0 gap-2">
        <Eye :size="13" stroke-width="1.8" class="text-[#52525b]" />
        <span
          class="text-[11px] text-[#52525b] font-['Inter',sans-serif] font-medium tracking-[0.08em] uppercase select-none">Preview</span>
        <div class="flex-1"></div>
        <button @click="downloadMarkdown" class="toolbar-btn toolbar-btn-lg" title="Descargar Markdown">
          <Download :size="16" stroke-width="1.8" />
        </button>
        <button @click="downloadPreviewImage" class="toolbar-btn toolbar-btn-lg" title="Descargar Preview (PNG)">
          <ImageDown :size="16" stroke-width="1.8" />
        </button>
      </div>
      <div ref="previewRef"
        class="flex-1 overflow-y-auto p-8 prose prose-invert prose-zinc max-w-none prose-a:text-blue-400 prose-headings:text-[#f4f4f5] [&_pre]:bg-[#303036] [&_pre]:text-[#a1a1aa] [&_pre]:border [&_pre]:border-transparent [&_pre]:transition-colors [&_pre]:duration-200 [&_pre:hover]:border-purple-500 [&_.hljs]:bg-transparent!"
        v-html="compiledMarkdown"></div>
    </div>
  </div>
</template>

<style scoped>
.divider {
  width: 2px;
  background: #3e3e42;
  flex-shrink: 0;
  align-self: stretch;
  opacity: 0.7;
}

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

.toolbar-btn-lg {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  color: #a1a1aa;
  background: #2f2f34;
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
