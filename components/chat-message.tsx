import React from "react"
import { User, Bot, Play, Pause } from "lucide-react"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
    timestamp: number
    audioUrl?: string
    id: string
  }
  onPlayTTS: (message: ChatMessageProps["message"]) => void
  isCurrentlyPlaying: boolean
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onPlayTTS, isCurrentlyPlaying }) => {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}>
        <div
          className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
            isUser
              ? "bg-gradient-to-br from-purple-500 to-purple-700 ml-3"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 mr-3"
          } shadow-md transition-transform duration-300 group-hover:scale-110`}
        >
          {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
        </div>
        <div
          className={`p-4 rounded-2xl shadow-sm transition-all duration-300 ${
            isUser
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-tr-none"
              : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-gray-100 border border-purple-100 dark:border-purple-900 rounded-tl-none"
          } group-hover:shadow-md`}
        >
          <div className="prose dark:prose-invert max-w-none">
            {message.content}
          </div>
          {message.role === "assistant" && (
            <div className="mt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => onPlayTTS(message)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Play message"
              >
                {isCurrentlyPlaying ? (
                  <Pause className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Play className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

