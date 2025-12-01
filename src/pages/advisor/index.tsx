import React, { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { streamBusinessAdvice } from '../../services/geminiService'
import { ChatMessage } from '../../types'
import './index.scss'

const AdvisorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '你好！我是澳門商業指南針AI。我可以幫助您了解在澳門創業的相關政策、稅務、融資等問題。有什麼我可以幫助的嗎？'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<any>(null)

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToBottom()
      }, 100)
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim()) return

    const userMessage: ChatMessage = { role: 'user', text: inputText }
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }))
      const stream = await streamBusinessAdvice(inputText, history)

      let fullResponse = ''
      const asyncIter = (stream as any).stream || stream
      for await (const chunk of asyncIter) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
          fullResponse += chunk.candidates[0].content.parts[0].text
        }
      }

      const aiMessage: ChatMessage = { role: 'model', text: fullResponse }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error(error)
      Taro.showToast({
        title: '無法連接AI服務',
        duration: 2000,
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="advisor-container">
      <ScrollView ref={scrollRef} scrollY className="messages-scroll">
        <View className="messages-container">
          {messages.map((msg, index) => (
            <View
              key={index}
              className={`message-item ${msg.role === 'user' ? 'user-message' : 'model-message'}`}
            >
              <View className="message-bubble">
                <Text className="message-text">{msg.text}</Text>
              </View>
            </View>
          ))}
          {loading && (
            <View className="message-item model-message">
              <View className="message-bubble typing">
                <Text className="message-text">正在思考中...</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="input-container">
        <Input
          className="input-field"
          placeholder="輸入您的問題..."
          placeholderStyle="color: rgba(255, 255, 255, 0.4)"
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          disabled={loading}
        />
        <Button className="send-button" onClick={handleSend} disabled={loading}>
          發送
        </Button>
      </View>
    </View>
  )
}

export default AdvisorPage
