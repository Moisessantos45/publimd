import { createRouter, createWebHistory } from 'vue-router'
import EditorView from '../views/EditorView.vue'
import FullView from '../views/FullView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'editor',
      component: EditorView
    },
    {
      path: '/full',
      name: 'full',
      component: FullView
    }
  ]
})

export default router
