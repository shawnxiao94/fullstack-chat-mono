declare namespace API {
  type RegisterParams = {
    username: string
    password: string
    repassword: string
  };
  type UpdateUserInfoParams = {
    id: string
    username?: string
    role?: string
    nickName?: string
    tag?: string
    remark?: string
    sex?: number
    status?: number
  };
  type UpdateUserPwdParams = {
    id: string
    password: string
    oldPassword: string
    confirmPassword: string
  };
  type SearchGroupKeyword = {
    keyword: string
  };
}
