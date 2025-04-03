"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Menu, X, Volume2, VolumeX } from "lucide-react"
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

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
  audioUrl?: string
  id: string
}

interface ChatHistory {
  id: string
  title: string
  messages: ChatMessage[]
  persona: string
  createdAt: number
  updatedAt: number
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0])
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)
  const [currentlyPlayingMessage, setCurrentlyPlayingMessage] = useState<ChatMessage | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load chat histories from localStorage on component mount
  useEffect(() => {
    const savedHistories = localStorage.getItem('chatHistories')
    if (savedHistories) {
      setChatHistories(JSON.parse(savedHistories))
    }
  }, [])

  // Save chat histories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatHistories', JSON.stringify(chatHistories))
  }, [chatHistories])

  // Initialize first message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hello! I'm here to support your mental wellbeing. How are you feeling today?",
        timestamp: Date.now(),
        id: `msg-${Date.now()}`
      }])
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, messagesEndRef])

  const createNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [{
        role: "assistant",
        content: `Hello! I'm ${selectedPersona.split(' ')[0]}, and I'm here to support your mental wellbeing. How are you feeling today?`,
        timestamp: Date.now(),
        id: `msg-${Date.now()}`
      }],
      persona: selectedPersona,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setChatHistories(prev => [...prev, newChat])
    setCurrentChatId(newChat.id)
    setMessages(newChat.messages)
  }

  const loadChat = (chatId: string) => {
    console.log("Loading chat:", chatId)
    const chat = chatHistories.find(h => h.id === chatId)
    if (chat) {
      console.log("Found chat:", chat)
      setCurrentChatId(chat.id)
      setMessages(chat.messages)
      setSelectedPersona(chat.persona)
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    } else {
      console.error("Chat not found:", chatId)
    }
  }

  const updateChatTitle = (chatId: string, title: string) => {
    setChatHistories(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title, updatedAt: Date.now() }
        : chat
    ))
  }

  const deleteChat = (chatId: string) => {
    setChatHistories(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
      createNewChat()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
      id: `msg-${Date.now()}`
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("Sending request to:", `${API_URL}/chat`)
      console.log("Request payload:", { message: input.trim(), persona: selectedPersona })
      
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: input.trim(),
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

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
        id: `msg-${Date.now()}`
      }

      // Update messages and chat history
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage]
        if (currentChatId) {
          setChatHistories(prev => prev.map(chat => 
            chat.id === currentChatId
              ? { 
                  ...chat, 
                  messages: newMessages,
                  updatedAt: Date.now(),
                  title: chat.title === "New Chat" ? input.slice(0, 30) + (input.length > 30 ? "..." : "") : chat.title
                }
              : chat
          ))
        }
        return newMessages
      })

    } catch (error) {
      console.error("Detailed error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again later.",
        timestamp: Date.now(),
        id: `msg-${Date.now()}`
      }
      setMessages(prev => [...prev, errorMessage])
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
    createNewChat()
  }

  const toggleTTS = () => {
    setIsTTSEnabled(!isTTSEnabled)
    if (!isTTSEnabled && currentlyPlayingMessage) {
      audioRef.current?.play()
    } else if (isTTSEnabled && currentlyPlayingMessage) {
      audioRef.current?.pause()
    }
  }

  const handleTTSPlayback = async (message: ChatMessage) => {
    try {
      console.log('Starting TTS playback for message:', message.id);
      
      // Stop currently playing message if any
      if (currentlyPlayingMessage && currentlyPlayingMessage !== message) {
        const audio = document.getElementById(`audio-${currentlyPlayingMessage.id}`) as HTMLAudioElement;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }

      // If clicking the same message that's currently playing, toggle play/pause
      if (currentlyPlayingMessage === message) {
        const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
        if (audio) {
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
          return;
        }
      }

      // Generate new audio
      console.log('Fetching TTS from:', `${API_URL}/tts`);
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.content,
          persona: selectedPersona
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS response not OK:', response.status, errorText);
        throw new Error(`Failed to generate speech: ${response.status} ${errorText}`);
      }

      // Get the response as a blob
      const blob = await response.blob();
      console.log('Received blob:', blob.type, blob.size);
      
      if (blob.size === 0) {
        throw new Error('Received empty audio data');
      }

      // Create an object URL from the Blob
      const audioUrl = URL.createObjectURL(blob);
      console.log('Created audio URL:', audioUrl);

      // Update the audio source
      const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
      if (!audio) {
        console.error('Audio element not found:', `audio-${message.id}`);
        throw new Error('Audio element not found');
      }

      // Revoke the old object URL if it exists
      if (audio.src) {
        URL.revokeObjectURL(audio.src);
      }

      // Set up audio event listeners
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        setCurrentlyPlayingMessage(null);
      };

      audio.oncanplaythrough = () => {
        console.log('Audio can play through');
      };

      audio.onloadeddata = () => {
        console.log('Audio data loaded');
      };

      audio.onloadstart = () => {
        console.log('Audio loading started');
      };

      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded');
      };

      audio.src = audioUrl;
      console.log('Set audio source, attempting to play');
      
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        console.log('Audio playback started');
        setCurrentlyPlayingMessage(message);
      } catch (playError) {
        console.error('Error playing audio:', playError);
        URL.revokeObjectURL(audioUrl);
        throw playError;
      }
    } catch (error) {
      console.error('TTS error:', error);
      setCurrentlyPlayingMessage(null);
      // Don't show error to user, just log it
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any existing audio object URLs
      messages.forEach(message => {
        const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
        if (audio && audio.src) {
          URL.revokeObjectURL(audio.src);
        }
      });
    };
  }, [messages]);

  // Handle audio ended
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setCurrentlyPlayingMessage(null)
      }
    }
  }, [])

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
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          chatHistories={chatHistories}
          currentChatId={currentChatId}
          onLoadChat={loadChat}
          onCreateNewChat={createNewChat}
          onDeleteChat={deleteChat}
        />

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
                {isSidebarOpen ? <X size={20} className="text-gray-800 dark:text-gray-100" /> : <Menu size={20} className="text-gray-800 dark:text-gray-100" />}
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">V</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Vista</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTTS}
                className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                aria-label="Toggle TTS"
              >
                {isTTSEnabled ? (
                  <Volume2 size={20} className="text-purple-600 dark:text-purple-400" />
                ) : (
                  <VolumeX size={20} className="text-gray-400 dark:text-gray-500" />
                )}
              </button>
              <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            </div>
          </header>

          {/* Chat container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div key={index}>
                  <ChatMessage 
                    message={message} 
                    onPlayTTS={handleTTSPlayback}
                    isCurrentlyPlaying={currentlyPlayingMessage?.id === message.id}
                  />
                  <audio
                    id={`audio-${message.id}`}
                    className="hidden"
                    controls
                    onEnded={() => setCurrentlyPlayingMessage(null)}
                    preload="auto"
                    onError={(e) => {
                      console.error('Audio error:', e);
                      setCurrentlyPlayingMessage(null);
                    }}
                    onLoadedData={() => console.log(`Audio loaded for message ${message.id}`)}
                    onLoadStart={() => console.log(`Audio loading started for message ${message.id}`)}
                    onLoadedMetadata={() => console.log(`Audio metadata loaded for message ${message.id}`)}
                  />
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

      {/* Add audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

