import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarkdownStore = defineStore('markdown', () => {
  const content = ref(`# AI Readiness — Findings from the kitchen-sink example

I asked AI how to better make SolidJS 2.0 usable by AI, we decided after doing those steps we should also include a kitchen sink example. They suggested Todos. and I offered up the TodoMVC with async/error affordances. We decided to use a simple demo I had made as a baseline and add back the missing TodoMVC functionality. In the process we used this to dogfood our own advice so the AI could evaluate how well its measures worked.

> The remainder of this document is written by Opus 4.7.

Each entry is a real bug I (Claude) wrote while building \`examples/todos/\`. The purpose is to identify exactly *where* current guidance (CHEATSHEET / JSDoc / type system / dev warnings) failed to steer me, so we know what to harden.

## Diagnostic frame: React Brain, per session

Humans learning Solid have **React Brain** — the ingrained reflexes that take repeated exposure to unlearn. For humans, the deprogramming amortizes across months and many sessions, so gentle redirection works: the third time a learner passes an accessor as a prop and the example reads \`filter={filter()}\`, something clicks and stays clicked.

## Format

- Bug — what was wrong in the code I produced
- Fix — what it should have been
- Why I got it wrong — the prior / missing guidance that led me astray
- What would have prevented it — concrete actionable change

### 1. Manual class string builder instead of \`class={[...]}\` array+object form

**Bug**

\`\`\`javascript
const cls = () => {
  const parts = ["todo"];
  if (props.todo.completed) parts.push("completed");
  if (m().saving) parts.push("saving");
  if (m().error) parts.push("errored");
  return parts.join(" ");
};
return <li class={cls()}>...
\`\`\`

**Fix (idiomatic 2.0)**

\`\`\`javascript
return (
  <li class={["todo", {
    "completed": props.todo.completed,
    "saving": m().saving,
    "errored": m().error
  }]}>...
\`\`\`
`)

  return { content }
})
