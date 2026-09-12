import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/products',
    },
    {
      path: '/products',
      name: 'product-list',
      component: () => import('../views/ProductListView.vue'),
      meta: { title: 'Products — Product Inventory' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Page Not Found — Product Inventory' },
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'Product Inventory'
})

export default router
