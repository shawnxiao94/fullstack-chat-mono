import { RouteRecordRaw } from 'vue-router';

const Home = () => import('@/views/home/index.vue');
const Login = () => import('@/views/login/index.vue');
const Register = () => import('@/views/register/index.vue');
const NotFound = () => import(/* webpackChunkName: "404" */ '@/views/error/404.vue');

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      keepAlive: true,
      title: 'home',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      keepAlive: true,
      title: 'login',
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      keepAlive: true,
      title: 'register',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: {
      title: 'NotFound',
      hideInMenu: true,
      hideInTabs: true,
    },
    redirect: () => {
        return {path: '/error/404'}
    },
    component: NotFound,
    children: [],
  }
];
