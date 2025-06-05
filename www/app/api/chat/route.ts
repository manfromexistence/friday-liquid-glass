import { NextRequest, NextResponse } from 'next/server'
import { googleGenAIService } from '@/lib/services/google-genai-service'

export async function POST(request: NextRequest) {
  try {
    const { messages, selectedModel, stream = false } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const model = selectedModel || 'gemini-2.0-flash-001'    if (stream) {
      // Handle streaming response
      const response = await googleGenAIService.generateContentStream(
        model,
        messages
      )      // Create a ReadableStream for server-sent events
      const encoder = new TextEncoder()
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            // Handle streaming response using callback
            await googleGenAIService.generateContentStream(
              model,
              messages,
              (chunk: string) => {
                // Send each chunk as server-sent event
                const data = `data: ${JSON.stringify({ text: chunk, done: false })}\n\n`
                controller.enqueue(encoder.encode(data))
              }
            )
            }
            
            // Send completion signal
            const endData = `data: ${JSON.stringify({ text: '', done: true })}\n\n`
            controller.enqueue(encoder.encode(endData))
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const errorData = `data: ${JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Streaming failed',
              done: true 
            })}\n\n`
            controller.enqueue(encoder.encode(errorData))
            controller.close()
          }
        }
      })

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })    } else {
      // Handle non-streaming response
      const response = await googleGenAIService.generateContent(
        model,
        messages
      )      return NextResponse.json({
        text: response.text,
        responseTime: response.responseTime
      })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
