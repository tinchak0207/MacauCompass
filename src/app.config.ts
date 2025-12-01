import type { Config } from '@tarojs/taro'

const config: Config = {
  pages: [
    'pages/landing/index',
    'pages/dashboard/index',
    'pages/industry/index',
    'pages/simulator/index',
    'pages/trademarks/index',
    'pages/advisor/index',
    'pages/inspector/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#050505',
    navigationBarTitleText: '澳門商業指南針',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom'
  },
  networkTimeout: {
    request: 10000,
    downloadFile: 10000
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息將用於...'
    },
    'scope.camera': {
      desc: '需要訪問你的相機以進行店鋪檢查'
    }
  }
}

export default config
