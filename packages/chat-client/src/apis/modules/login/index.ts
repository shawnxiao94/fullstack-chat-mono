import http from '@/apis/request'

import { basePath } from '@/apis/config/servicePath'


/**
 * @description 注册
 * @param {RegisterParams} data
 * @returns
 */
export function register(params: API.RegisterParams) {
  return http.post<API.LoginResult>(basePath + '/user/register', params)
}

/**
 * @description 登录
 * @param {LoginParams} data
 * @returns
 */
export function login(params: API.LoginParams) {
  return http.post<API.LoginResult>(basePath + '/login/login', params)
}

export function logout() {
  return http.post(basePath + '/login/logout')
}

