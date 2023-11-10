export function momentFormat(timestamps = null) {
  const d = timestamps ? new Date(timestamps) : new Date();
  const [year, month, day, hour, minute, second]: any = [
    d.getFullYear(),
    d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : `0${d.getMonth() + 1}`,
    d.getDate() >= 10 ? d.getDate() : `0${d.getDate()}`,
    d.getHours() >= 10 ? d.getHours() : `0${d.getHours()}`,
    d.getMinutes() >= 10 ? d.getMinutes() : `0${d.getMinutes()}`,
    d.getSeconds() >= 10 ? d.getSeconds() : `0${d.getSeconds()}`,
  ];

  return {
    format(patterns = 'YYYY-MM-DD HH:mm:SS') {
      return patterns
        .replace(/YYYY/g, year)
        .replace(/MM/g, month)
        .replace(/DD/g, day)
        .replace(/HH/g, hour)
        .replace(/mm/g, minute)
        .replace(/SS/g, second);
    },
  };
}
/**
 * @description 获取localStorage
 * @param {String} key Storage名称
 * @return string
 */
export const localGet = (key: string) => {
  const value = window.localStorage.getItem(key);
  try {
    return JSON.parse(window.localStorage.getItem(key) as string);
  } catch (error) {
    return value;
  }
};

/**
 * @description 存储localStorage
 * @param {String} key Storage名称
 * @param {Any} value Storage值
 * @return void
 */
export const localSet = (key: string, value: any) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

/**
 * @description 清除localStorage
 * @param {String} key Storage名称
 * @return void
 */
export const localRemove = (key: string) => {
  window.localStorage.removeItem(key);
};

/**
 * @description 清除所有localStorage
 * @return void
 */
export const localClear = () => {
  window.localStorage.clear();
};

/**
 * @description 获取浏览器默认语言
 * @return string
 */
export const getBrowserLang = () => {
  let browserLang = navigator.language ? navigator.language : (navigator as any)?.browserLanguage;
  let defaultBrowserLang = '';
  if (
    browserLang.toLowerCase() === 'cn' ||
    browserLang.toLowerCase() === 'zh' ||
    browserLang.toLowerCase() === 'zh-cn'
  ) {
    defaultBrowserLang = 'zh';
  } else {
    defaultBrowserLang = 'en';
  }
  return defaultBrowserLang;
};

/**
 * @description 获取需要展开的 subMenu
 * @param {String} path 当前访问地址
 * @returns array
 */
export const getOpenKeys = (path: string) => {
  let newStr: string = '';
  let newArr: any[] = [];
  let arr = path.split('/').map((i) => '/' + i);
  for (let i = 1; i < arr.length - 1; i++) {
    newStr += arr[i];
    newArr.push(newStr);
  }
  return newArr;
};

/**
 * @description 判断数据类型
 * @param {Any} val 需要判断类型的数据
 * @return string
 */
export const isType = (val: any) => {
  if (val === null) return 'null';
  if (typeof val !== 'object') return typeof val;
  return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase();
};

/**
 * @description 对象数组深克隆
 * @param {Object} obj 源对象
 * @return object
 */
export const deepCopy = <T>(obj: any): T => {
  // eslint-disable-next-line init-declarations
  let newObj: any;
  try {
    newObj = obj.push ? [] : {};
  } catch (error) {
    newObj = {};
  }
  for (let attr in obj) {
    if (typeof obj[attr] === 'object') {
      newObj[attr] = deepCopy(obj[attr]);
    } else {
      newObj[attr] = obj[attr];
    }
  }
  return newObj;
};

// 不用递归实现深度优先遍历深拷贝
export function cloneDeep(source) {
  const map = {
    '[object Number]': 'number',
    '[object Boolean]': 'boolean',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Object]': 'object',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
  };
  const result = Array.isArray(source) ? [] : {};
  const stack = [...Object.entries(source).map((item) => [...item, result])];
  const toString = Object.prototype.toString;
  while (stack.length) {
    const [key, value, target] = stack.pop() as any;
    if (map[toString.call(value)] === 'object' || map[toString.call(value)] === 'array') {
      target[key] = Array.isArray(value) ? [] : {};
      stack.push(...Object.entries(value).map((item) => [...item, target[key]]));
    } else {
      target[key] = value;
    }
  }
  return result;
}

// 广度优先遍历实现深拷贝
function cloneDeep2(source) {
  const map = {
    '[object Number]': 'number',
    '[object Boolean]': 'boolean',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Object]': 'object',
    '[object Null]': 'null',
    '[object Undefined]': 'undefined',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
  };
  const result = {};
  const stack = [{ data: source, target: result }];
  const toString = Object.prototype.toString;
  while (stack.length) {
    let { target, data } = stack.shift() as any;
    for (let key in data) {
      if (map[toString.call(data[key])] === 'object' || map[toString.call(data[key])] === 'array') {
        target[key] = Array.isArray(data[key]) ? [] : {};
        stack.push({ data: data[key], target: target[key] });
      } else {
        target[key] = data[key];
      }
    }
  }
  return result;
}

/**
 * @description 生成随机数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @return number
 */
export function randomNum(min: number, max: number): number {
  let num = Math.floor(Math.random() * (min - max) + max);
  return num;
}

// 判断一个字符串是否包含另外一个字符串
export function isContainStr(str1: string, str2: string) {
  return str2.indexOf(str1) >= 0;
}

/**
 * 屏蔽词
 * @param text 文本
 */
export function parseText(text: string) {
  return text;
}

/**
 * 判断是否URL
 * @param text 文本
 */
export function isUrl(text: string) {
  // 解析网址
  const UrlReg = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
  return UrlReg.test(text);
}

/**
 * 群名/用户名校验
 * @param name
 */
interface resVerify {
  flag: boolean;
  info: string;
}
export function nameVerify(name: string): resVerify {
  let nameReg = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (name.length === 0) {
    return { flag: false, info: '请输入名字' };
  }
  if (!nameReg.test(name)) {
    return { flag: false, info: '名字只含有汉字、字母、数字和下划线 不能以下划线开头和结尾' };
  }
  if (name.length < 4) {
    return { flag: false, info: '名字太短' };
  }
  if (name.length > 19) {
    return { flag: false, info: '名字太长' };
  }
  return { flag: true, info: 'success' };
}

/**
 * 密码校验
 * @param password
 */
export function passwordVerify(password: string): resVerify {
  const passwordReg = /^\w+$/gis;
  if (password.length === 0) {
    return { flag: false, info: '请输入密码' };
  }
  if (!passwordReg.test(password)) {
    return { flag: false, info: '密码只含有字母、数字和下划线' };
  }
  if (password.length < 6) {
    return { flag: false, info: '密码太短' };
  }
  if (password.length > 19) {
    return { flag: false, info: '密码太长' };
  }
  return { flag: true, info: 'success' };
}
