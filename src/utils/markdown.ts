import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import markedKatex from 'marked-katex-extension'
import mermaid from 'mermaid'
import { watch, nextTick, onMounted, type Ref } from 'vue'

import 'highlight.js/styles/atom-one-dark.css'
import 'katex/dist/katex.min.css'

marked.use(markedKatex({ throwOnError: false }))

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  }
}))

marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang === 'mermaid') {
        const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<div class="mermaid">${escapedText}</div>`;
      }
      return false;
    }
  }
})

export function renderMarkdown(content: string): string {
  const parsed = marked.parse(content)
  if (typeof parsed !== 'string') {
    throw new Error('Error al parsear el markdown')
  }
  return DOMPurify.sanitize(parsed, {
    ADD_TAGS: [
      'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'mspace', 'mtr', 'mtd', 'mtable', 'mfrac', 'mover', 'munder', 'munderover', 'mtext', 'menclose', 'msubsup', 'merror', 'annotation',
      'svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon', 'text', 'defs', 'clipPath', 'marker', 'foreignObject'
    ],
    ADD_ATTR: [
      'target', 'class', 'style', 'xmlns', 'viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'points', 'x', 'y', 'transform', 'cx', 'cy', 'r', 'rx', 'ry', 'display', 'mathvariant', 'mathcolor', 'mathbackground', 'mathsize', 'mathfamily', 'stretchy', 'symmetric', 'largeop', 'movablelimits', 'accent', 'lspace', 'rspace', 'separator', 'form', 'fence', 'minmax', 'maxsize', 'minsize', 'notation', 'encoding', 'id', 'aria-hidden'
    ]
  })
}

export function useMermaid(sourceRef: Ref<string>) {
  onMounted(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' })
  })

  watch(sourceRef, async () => {
    await nextTick()
    try {
      const mermaids = document.querySelectorAll('.mermaid')
      if (mermaids.length > 0) {
        await mermaid.run({ querySelector: '.mermaid' })
      }
    } catch (e) {
      console.error('Mermaid render error:', e)
    }
  }, { immediate: true })
}
