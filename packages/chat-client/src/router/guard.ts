import { Router } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ACCESS_TOKEN_KEY } from '@/enums/cacheEnum';
import { Storage } from '@/utils/Storage';
import { LOGIN_NAME, REDIRECT_NAME, whiteNameList, defaultRoutePath } from './constant';

class Guard {
  private beforeEach(router: Router) {
    router.beforeEach((to, from, next) => {
      NProgress.start();
      const token = Storage.get(ACCESS_TOKEN_KEY, null);
      if (to.meta.title) {
        document.title = to.meta.title as string;
      }
      if (token) {
        if (to.name === LOGIN_NAME) {
          next({ path: defaultRoutePath });
        } else {
          next();
        }
      } else {
        // not login
        if (whiteNameList.some((n) => n === to.name)) {
          // 在免登录名单，直接进入
          next();
        } else {
          next({ name: LOGIN_NAME, query: { redirect: to.fullPath }, replace: true });
        }
      }
    });
  }
  private afterEach(router: Router) {
    router.beforeEach(() => {
      NProgress.done();
    });
    router.onError((error) => {
      console.log(error, '路由错误');
    });
  }
  public run(router: Router) {
    this.beforeEach(router);
    this.afterEach(router);
  }
}

export const guard = new Guard();
