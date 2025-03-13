"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Menu, X } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import ThemeToggle from "@/components/theme-toggle"
import Sidebar from "@/components/sidebar"
import DecorativeBlob from "@/components/decorative-blob"

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; audio?: string }>>([
    { role: "assistant", content: "Hello! I'm here to support your mental wellbeing. How are you feeling today?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.response,
        audio: data.audio
      }])

      // Play audio if available
      if (data.audio && audioRef.current) {
        audioRef.current.src = data.audio
        audioRef.current.play().catch(console.error)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
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

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-950 transition-colors duration-300">
        {/* Decorative elements */}
        <div className="fixed inset-0 pointer-events-none">
          <DecorativeBlob className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4" />
          <DecorativeBlob className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4" />
        </div>

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="flex-none border-b border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-3 p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors flex items-center justify-center"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">M</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Mindful</h1>
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
                  {message.audio && (
                    <div className="mt-2 flex justify-end">
                      <audio controls src={message.audio} className="max-w-[200px]" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 p-3 max-w-[80%] rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900">
                  <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse delay-300"></div>
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
                className="flex-1 p-4 pr-14 rounded-2xl border border-purple-200 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700/80 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
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
            <div className="max-w-3xl mx-auto mt-2 text-xs text-center text-gray-400 dark:text-gray-500">
              Your conversations are private and secure
            </div>
          </div>
        </main>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

