import { createRouter, createWebHashHistory } from "vue-router";
import { routes } from "./routes";
import { guard } from "./guard";
import {App} from 'vue'

// 导出路由
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      return { top: 0 }
    }
  }
})

export function setupRouter(app: App) {
  app.use(router)
  guard.run(router)
}

export default router;

export const setupPlugins = (App: App) => {
  setupRouter(App)
}

