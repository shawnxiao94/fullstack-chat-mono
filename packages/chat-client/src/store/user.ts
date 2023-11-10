import { defineStore } from 'pinia';
import store from '@/store';
import { ACCESS_TOKEN_KEY } from '@/enums/cacheEnum';
import { Storage } from '@/utils/Storage';

import { login, logout, register } from '@/apis/modules/login';

export interface UserInfo {
  id: string;
  nickName: string;
  avatar: string;
  username: string;
  role: string;
}
interface UserState {
  token: string;
  userInfo: UserInfo
}

import avatarImg from '@/assets/images/avatar1.png'

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: {
        id: '',
        nickName: '',
        avatar: avatarImg,
        username: '',
        role: ''
        
      },
      token: Storage.get(ACCESS_TOKEN_KEY, null),
    };
  },
  getters: {
    getUserInfo(): any {
      return this.userInfo;
    },
    getToken(): string {
      return this.token;
    },
  },
  actions: {
    updateUserInfo(userInfo) {
      this.userInfo = {...userInfo, avatar: userInfo?.avatar ? `${userInfo.avatar}` : avatarImg};
    },
    /** 清空token及用户信息 */
    resetToken() {
      this.token = null;
      this.userInfo = null;
      Storage.clear();
    },
    updateToken(token) {
      this.token = token ?? '';
      const ex = 7 * 24 * 60 * 60 * 1000;
      Storage.set(ACCESS_TOKEN_KEY, this.token, ex);
    },
    /** 注册 */
    async register(params: API.RegisterParams) {
      try {
        const res = await register(params);
        if (~~res.code === 200 && res.data.token) {
          this.updateUserInfo(res.data.userInfo);
          this.updateToken(res.data.token);
          return { token: res.data.token, userInfo: res.data.userInfo };
        }
        return {};
      } catch (error) {
        return Promise.reject(error);
      }
    },
    /** 登录 */
    async login(params: API.LoginParams) {
      try {
        const res:any = await login(params);
        if (res.token && res.userInfo) {
          const infoJson = JSON.parse(res.userInfo)
          this.updateUserInfo(infoJson);
          this.updateToken(res.token);
          return { token: res.token, userInfo: infoJson };
        }
        return {};
      } catch (error) {
        return Promise.reject(error);
      }
    },
    /** 登出 */
    async logout() {
      await logout();
      this.resetToken();
    },
  },
   // 开启数据持久化
   persist: true
});

// 在组件setup函数外使用
export function useUserStoreWithOut() {
  return useUserStore(store);
}
