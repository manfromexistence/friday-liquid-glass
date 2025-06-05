import { useState, useCallback } from 'react'
import { useChatInputStore } from '@/store/chat-store'
import { useAIModelStore } from '@/store/ai-model-store'
import { Message } from '@/types/chat'
import { v4 as uuidv4 } from 'uuid'

interface UseChatOptions {
  onMessageAdded?: (message: Message) => void
  onError?: (error: string) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { onMessageAdded, onError } = options
  
  const {
    chatState,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    isStreaming,
    setIsStreaming,
    streamingMessageId,
    setStreamingMessageId
  } = useChatInputStore()
  
  const { currentModel } = useAIModelStore()

  const sendMessage = useCallback(async (content: string, useStreaming = true) => {
    if (!content.trim()) return

    setError(null)
    setLoading(true)

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    // Add user message to chat
    addMessage(userMessage)
    onMessageAdded?.(userMessage)

    // Create assistant message placeholder
    const assistantMessageId = uuidv4()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    addMessage(assistantMessage)

    try {
      const messages = [...chatState.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      if (useStreaming) {
        setIsStreaming(true)
        setStreamingMessageId(assistantMessageId)

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            selectedModel: currentModel,
            stream: true
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  
                  if (data.error) {
                    throw new Error(data.error)
                  }
                  
                  if (data.text) {
                    accumulatedContent += data.text
                    updateMessage(assistantMessageId, {
                      content: accumulatedContent
                    })
                  }
                  
                  if (data.done) {
                    break
                  }
                } catch (parseError) {
                  console.warn('Failed to parse streaming data:', parseError)
                }
              }
            }
          }
        }

        setIsStreaming(false)
        setStreamingMessageId(null)
      } else {
        // Non-streaming request
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            selectedModel: currentModel,
            stream: false
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        updateMessage(assistantMessageId, {
          content: data.text
        })
      }

      const finalAssistantMessage = {
        ...assistantMessage,
        content: useStreaming ? 
          chatState.messages.find(m => m.id === assistantMessageId)?.content || '' :
          assistantMessage.content
      }
      
      onMessageAdded?.(finalAssistantMessage)

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      
      setError(errorMessage)
      onError?.(errorMessage)
      
      // Remove the failed assistant message
      updateMessage(assistantMessageId, {
        content: `Error: ${errorMessage}`
      })
    } finally {
      setLoading(false)
      setIsStreaming(false)
      setStreamingMessageId(null)
    }
  }, [
    chatState.messages,
    currentModel,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    setIsStreaming,
    setStreamingMessageId,
    onMessageAdded,
    onError
  ])

  const clearChat = useCallback(() => {
    const { clearMessages } = useChatInputStore.getState()
    clearMessages()
  }, [])

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    error: chatState.error,
    isStreaming,
    streamingMessageId,
    sendMessage,
    clearChat
  }
}
