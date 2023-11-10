import http from '@/apis/request';

import { basePath } from '@/apis/config/servicePath';

/**
 * @description 注册
 * @param {API.RegisterParams} data
 * @returns
 */
export function register(params: API.RegisterParams) {
  return http.post(basePath + '/user/register', params);
}

/**
 * @description update
 * @param {API.UpdateUserInfoParams} data
 * @returns
 */
export function updateUserInfoById(params: API.UpdateUserInfoParams) {
  return http.post(basePath + '/user/updateById', params);
}

/**
 * @description update
 * @param {API.UpdateUserPwdParams} data
 * @returns
 */
export function updateUserPwdById(params: API.UpdateUserPwdParams) {
  return http.put(basePath + '/user/updatePwd', params);
}

/**
 * @description searchGroupKeyword
 * @param {API.SearchGroupKeyword} data
 * @returns
 */
export function searchGroupKeyword(params: API.SearchGroupKeyword) {
  return http.get(basePath + '/group/searchKeyword', params);
}
/**
 * @description searchUserKeyword
 * @param {API.SearchGroupKeyword} data
 * @returns
 */
export function searchUserKeyword(params: API.SearchGroupKeyword) {
  return http.get(basePath + '/user/searchByKeyword', params);
}

/**
 * 用户头像上传
 * @param params
 */
export function updateAvatar(params: FormData) {
  return http.post(basePath + '/user/avatar', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
