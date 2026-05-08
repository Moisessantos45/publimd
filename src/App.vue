<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
</script>

<template>
  <div class="h-full bg-[#26262a] text-[#d4d4d8] font-['Inter',system-ui,sans-serif] flex flex-col">
    <header class="h-12 border-b border-[#2d2d2d]/80 flex items-center justify-between px-5 shrink-0 bg-[#252526] animate-fade-in">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-[#303036] border border-[#3e3e42]/50 flex items-center justify-center transition-transform duration-200 hover:scale-110">
          <FileText :size="14" stroke-width="1.8" class="text-[#a1a1aa]" />
        </div>
        <span class="text-[13px] font-semibold tracking-wide text-[#f4f4f5]/90 select-none">publimd</span>
      </div>

      <nav class="flex items-center bg-[#303036]/60 rounded-lg p-0.5 border border-[#3e3e42]/30">
        <RouterLink
          to="/"
          class="px-3.5 py-1 rounded-md text-[12px] font-medium tracking-wide transition-all duration-150 text-[#a1a1aa] hover:text-[#d4d4d8]"
          active-class="!bg-[#3e3e42]/80 !text-[#f4f4f5] shadow-sm"
        >Editor</RouterLink>
        <RouterLink
          to="/full"
          class="px-3.5 py-1 rounded-md text-[12px] font-medium tracking-wide transition-all duration-150 text-[#a1a1aa] hover:text-[#d4d4d8]"
          active-class="!bg-[#3e3e42]/80 !text-[#f4f4f5] shadow-sm"
        >Full View</RouterLink>
      </nav>

      <div class="w-22.5"></div>
    </header>
    <main class="flex-1 overflow-hidden">
      <RouterView v-slot="{ Component }">
        <Transition name="router-view" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
