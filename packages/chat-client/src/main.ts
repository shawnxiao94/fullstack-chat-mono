import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import { setupPlugins } from './router';
import store from './store';

import './styles/index.less';

// 图片预览插件
import Viewer from "v-viewer";
import "viewerjs/dist/viewer.css";

import directives from '@/directives';


const app = createApp(App);

setupPlugins(app);

app.use(Viewer, {
  defaultOptions: {
    // 自定义默认配置
    navbar: false,
    title: false,
    toolbar: {
      zoomIn: 1,
      zoomOut: 1,
      oneToOne: 4,
      reset: 4,
      prev: 0,
      next: 0,
      rotateLeft: 4,
      rotateRight: 4,
      flipHorizontal: 4,
      flipVertical: 4,
    },
  },
});
app.use(store);
app.use(Antd);
app.use(directives);
app.mount('#app');
