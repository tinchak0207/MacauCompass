import { defineConfig, type Config as TaroConfig } from '@tarojs/cli'

const config: TaroConfig = {
  projectName: 'macau-compass',
  date: new Date().toISOString(),
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-h5'
  ],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module_[name]__[local]___[hash:base64:5]',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    miniCss: {
      compress: true
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module_[name]__[local]___[hash:base64:5]',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

export default defineConfig(async (merge, isBuild) => {
  return merge({}, config, isBuild ? require('./config/prod') : require('./config/dev'))
})
