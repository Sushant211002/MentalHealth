import React, { useState } from "react"
import { User, Bot, Play, Pause } from "lucide-react"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
    audio?: string
  }
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user"
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

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
          <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
          {message.audio && (
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={togglePlayback}
                className="p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <audio
                ref={audioRef}
                src={message.audio}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

