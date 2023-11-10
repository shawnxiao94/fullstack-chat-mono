import { defineConfig, loadEnv, UserConfig, ConfigEnv } from 'vite';
import { resolve } from 'path';
import { createVitePlugins } from './config/vite/plugin';
import proxy from './config/vite/proxy';
import { VITE_DROP_CONSOLE, VITE_PORT } from './config/constant';
import { generateModifyVars } from './config/themeConfig';
import { configManualChunk } from './config/vite/optimizer';
import { wrapperEnv } from './src/utils/getEnv'


// https://vitejs.dev/config/
export default defineConfig((config: ConfigEnv): UserConfig => {
  const env = loadEnv(config.mode, process.cwd())
  const isBuild = config.command === 'build';
  console.log(config);
  const viteEnv = wrapperEnv(env)

  return {
    base: './',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.js','.ts','.vue', '.json', '.mjs']
    },

    // plugins
    plugins: createVitePlugins(isBuild),

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: generateModifyVars(),
          javascriptEnabled: true,
        },
      },
    },

    // server
    server: {
      hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
      // 服务配置
      port: viteEnv.VITE_PORT, // 类型： number 指定服务器端口;
      open: viteEnv.VITE_OPEN, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
      cors: false, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
      host: '0.0.0.0', // IP配置，支持从IP启动
      proxy,
    },

    // build
    build: {
      target: 'es2015',
      minify: 'terser', // 设置使用Terser进行压缩
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: VITE_DROP_CONSOLE,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: configManualChunk,
        },
      },
      // Turning off brotliSize display can slightly reduce packaging time
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
    },

    //optimizeDeps
    // optimizeDeps: {
    //   include: ['ant-design-vue/es/locale/zh_CN', 'moment/dist/locale/zh-cn'],
    // },
  };
});