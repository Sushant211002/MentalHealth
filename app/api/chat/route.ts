import { NextResponse } from "next/server"

// This is a placeholder API route that would connect to your Python backend
export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    console.log("Sending request to Python backend:", message)

    // Forward the request to Python backend
    const response = await fetch('http://localhost:8501/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Python backend error:", errorText)
      throw new Error(`Failed to get response from Python backend: ${errorText}`)
    }

    const data = await response.json()
    console.log("Received response from Python backend:", data)
    
    // If there's an error in the Python response
    if (Array.isArray(data) && data[1] === 500) {
      throw new Error(data[0].error)
    }

    // Convert audio file path to URL if it exists
    if (data.audio) {
      // Assuming the audio file is accessible via a static URL
      data.audio = `http://localhost:8501/static/${data.audio.split('/').pop()}`
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("Detailed error in chat route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process your message" }, 
      { status: 500 }
    )
  }
}

