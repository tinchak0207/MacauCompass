import React from 'react'
import { useDidShow, useDidHide } from '@tarojs/taro'
import './app.scss'

interface AppProps {
  children?: React.ReactNode
}

function App(props: AppProps) {
  useDidShow(() => {
    console.log('App did show.')
  })

  useDidHide(() => {
    console.log('App did hide.')
  })

  return props.children
}

export default App
