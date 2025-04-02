"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Menu, X } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import ThemeToggle from "@/components/theme-toggle"
import Sidebar from "@/components/sidebar"
import DecorativeBlob from "@/components/decorative-blob"

const PERSONAS = [
  "Arjun (Empathetic Counselor)",
  "Anjali (Mindful Guide)",
  "Rohan (Insightful Therapist)",
  "Priya (Caring Mentor)"
]

// API endpoint configuration
const API_URL = "http://localhost:8501"

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hello! I'm here to support your mental wellbeing. How are you feeling today?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, messagesEndRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === "") return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("Sending request to:", `${API_URL}/chat`)
      console.log("Request payload:", { message: input, persona: selectedPersona })
      
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: input,
          persona: selectedPersona
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received response data:", data)
      
      if (data.error) {
        console.error("Error in response data:", data.error)
        throw new Error(data.error)
      }

      if (!data.response) {
        console.error("No response in data:", data)
        throw new Error("No response received from server")
      }

      console.log("Adding assistant message to state:", { 
        role: "assistant" as const, 
        content: data.response
      })

      // Add assistant message with response
      setMessages((prev) => {
        const newMessages = [...prev, { 
          role: "assistant" as const, 
          content: data.response
        }]
        console.log("Updated messages state:", newMessages)
        return newMessages
      })

    } catch (error) {
      console.error("Detailed error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant" as const, 
          content: "I apologize, but I encountered an error. Please try again later." 
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona)
    // Clear chat history when changing persona
    setMessages([{ 
      role: "assistant" as const, 
      content: `Hello! I'm ${persona.split(' ')[0]}, and I'm here to support your mental wellbeing. How are you feeling today?` 
    }])
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {/* Disclaimer Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/50 border-b border-yellow-200 dark:border-yellow-800 p-2 text-center text-sm text-yellow-800 dark:text-yellow-200">
        This is an AI-powered mental health support system. For immediate help, please contact emergency services or a mental health professional.
      </div>

      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-950 transition-colors duration-300">
        {/* Decorative elements */}
        <div className="fixed inset-0 pointer-events-none">
          <DecorativeBlob className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4" />
          <DecorativeBlob className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4" />
        </div>

        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          selectedPersona={selectedPersona}
          onPersonaChange={handlePersonaChange}
        />

        {/* Main content */}
        <main className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="flex-none border-b border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-3 p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors flex items-center justify-center text-gray-800 dark:text-gray-100"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">V</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Vista</h1>
              </div>
            </div>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </header>

          {/* Chat container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div key={index}>
                  <ChatMessage message={message} />
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-300 p-3 max-w-[80%] rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
                  <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse delay-300"></div>
                </div>
              )}
              {error && (
                <div className="text-red-500 dark:text-red-300 text-sm p-3 max-w-[80%] rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="flex-none border-t border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 md:p-6">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 p-4 pr-14 rounded-2xl border border-purple-200 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700/80 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white p-2 rounded-full transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-md hover:shadow-lg"
                disabled={isLoading || input.trim() === ""}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="max-w-3xl mx-auto mt-2 text-xs text-center text-gray-400 dark:text-gray-300">
              Your conversations are private and secure
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

