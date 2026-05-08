import { defineStore } from "pinia";
import { ref } from "vue";

export const useMarkdownStore = defineStore("markdown", () => {
  const content = ref<string>("");

  return { content };
});
