"use client"

import React from "react"
import { X, Home, History, Settings, HelpCircle, MessageSquare, Heart, Moon, Sun, Trash2 } from "lucide-react"
import PopupModal from "./popup-modal"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface ChatHistory {
  id: string
  title: string
  messages: ChatMessage[]
  persona: string
  createdAt: number
  updatedAt: number
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedPersona: string
  onPersonaChange: (persona: string) => void
  isDarkMode: boolean
  toggleTheme: () => void
  chatHistories: ChatHistory[]
  currentChatId: string | null
  onLoadChat: (chatId: string) => void
  onCreateNewChat: () => void
  onDeleteChat: (chatId: string) => void
}

const PERSONAS = [
  "Arjun (Empathetic Counselor)",
  "Anjali (Mindful Guide)",
  "Rohan (Insightful Therapist)",
  "Priya (Caring Mentor)"
]

const SELF_CARE_TOOLS = [
  {
    title: "Breathing Exercise",
    description: "A simple 4-7-8 breathing technique to help reduce anxiety and stress.",
    steps: [
      "Inhale through your nose for 4 seconds",
      "Hold your breath for 7 seconds",
      "Exhale through your mouth for 8 seconds",
      "Repeat 4 times"
    ]
  },
  {
    title: "Mindful Walking",
    description: "A guided walking meditation to help you stay present and reduce stress.",
    steps: [
      "Find a quiet place to walk",
      "Focus on your breath and footsteps",
      "Notice the sensations in your body",
      "Walk for 10-15 minutes"
    ]
  },
  {
    title: "Gratitude Journal",
    description: "Write down three things you're grateful for each day.",
    steps: [
      "Set aside 5 minutes each day",
      "Write down three things you're grateful for",
      "Reflect on why these things matter to you",
      "Keep your journal in a safe place"
    ]
  }
]

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  selectedPersona, 
  onPersonaChange,
  isDarkMode,
  toggleTheme,
  chatHistories,
  currentChatId,
  onLoadChat,
  onCreateNewChat,
  onDeleteChat
}) => {
  const [activeModal, setActiveModal] = React.useState<string | null>(null)

  const handleModalOpen = (modalName: string) => {
    setActiveModal(modalName)
  }

  const handleModalClose = () => {
    setActiveModal(null)
  }

  const handleChatLoad = (chatId: string) => {
    onLoadChat(chatId)
    handleModalClose()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 md:w-72 bg-white dark:bg-gray-800 shadow-lg md:shadow-none z-50 transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full max-h-screen">
          {/* Sidebar header */}
          <div className="flex-shrink-0 p-4 border-b border-purple-100 dark:border-purple-900 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold">V</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Vista</h2>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
            <nav className="px-4 space-y-1">
              <SidebarItem 
                icon={<Home size={20} />} 
                text="Home" 
                active 
                onClick={() => handleModalOpen("home")}
              />
              <SidebarItem 
                icon={<MessageSquare size={20} />} 
                text="New Chat" 
                onClick={onCreateNewChat}
              />
              <SidebarItem 
                icon={<History size={20} />} 
                text="History" 
                onClick={() => handleModalOpen("history")}
              />
              <SidebarItem 
                icon={<Heart size={20} />} 
                text="Self-Care Tools" 
                onClick={() => handleModalOpen("selfCare")}
              />

              {/* Persona Selection */}
              <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-900">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-3">Select Persona</h3>
                <div className="space-y-2">
                  {PERSONAS.map((persona) => (
                    <button
                      key={persona}
                      onClick={() => onPersonaChange(persona)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedPersona === persona
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                          : "hover:bg-purple-50 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {persona}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-900">
                <SidebarItem 
                  icon={<HelpCircle size={20} />} 
                  text="Help & Resources" 
                  onClick={() => handleModalOpen("help")}
                />
                <SidebarItem 
                  icon={<Settings size={20} />} 
                  text="Settings" 
                  onClick={() => handleModalOpen("settings")}
                />
              </div>
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="flex-shrink-0 p-4 border-t border-purple-100 dark:border-purple-900">
            <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-4">
              <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Daily Affirmation</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                "I am worthy of peace, joy, and all things good."
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Popup Modals */}
      <PopupModal
        isOpen={activeModal === "home"}
        onClose={handleModalClose}
        title="Welcome to Vista"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to Vista, your AI-powered mental health support companion. Here you can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Chat with different personas specialized in mental health support</li>
            <li>Access self-care tools and resources</li>
            <li>View your chat history</li>
            <li>Get immediate access to emergency helplines</li>
          </ul>
        </div>
      </PopupModal>

      <PopupModal
        isOpen={activeModal === "history"}
        onClose={handleModalClose}
        title="Chat History"
      >
        <div className="space-y-4">
          {chatHistories.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">
              No chat history yet. Start a new conversation to begin!
            </p>
          ) : (
            <div className="space-y-2">
              {chatHistories.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    currentChatId === chat.id
                      ? "bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                  }`}
                  onClick={() => handleChatLoad(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {chat.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(chat.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopupModal>

      <PopupModal
        isOpen={activeModal === "selfCare"}
        onClose={handleModalClose}
        title="Self-Care Tools"
      >
        <div className="space-y-6">
          {SELF_CARE_TOOLS.map((tool) => (
            <div key={tool.title} className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {tool.description}
              </p>
              <div className="space-y-2">
                {tool.steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center text-sm text-purple-600 dark:text-purple-300 mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopupModal>

      <PopupModal
        isOpen={activeModal === "help"}
        onClose={handleModalClose}
        title="Help & Resources"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200">Emergency Resources</h3>
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200">KIRAN</h4>
              <p className="text-red-700 dark:text-red-300">1800-599-0019</p>
              <p className="text-sm text-red-600 dark:text-red-400">24/7 Mental Health Support</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200">AASRA</h4>
              <p className="text-red-700 dark:text-red-300">91-22-2754 6669</p>
              <p className="text-sm text-red-600 dark:text-red-400">Crisis Intervention</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200">Vandrevala</h4>
              <p className="text-red-700 dark:text-red-300">1860-266-2345</p>
              <p className="text-sm text-red-600 dark:text-red-400">Mental Health Support</p>
            </div>
          </div>
        </div>
      </PopupModal>

      <PopupModal
        isOpen={activeModal === "settings"}
        onClose={handleModalClose}
        title="Settings"
      >
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon className="text-purple-600 dark:text-purple-400" size={20} />
              ) : (
                <Sun className="text-purple-600 dark:text-purple-400" size={20} />
              )}
              <span className="text-gray-700 dark:text-gray-300">Theme</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="text-purple-600 dark:text-purple-400" size={20} />
              ) : (
                <Moon className="text-purple-600 dark:text-purple-400" size={20} />
              )}
            </button>
          </div>

          {/* Other Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Coming Soon</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                Notification Preferences
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                Privacy Settings
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                Language Preferences
              </div>
            </div>
          </div>
        </div>
      </PopupModal>
    </>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  text: string
  active?: boolean
  onClick?: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
        active
          ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
          : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:text-purple-800 dark:hover:text-purple-200"
      }`}
    >
      <span className="mr-3 flex items-center justify-center">{icon}</span>
      <span className="font-medium truncate">{text}</span>
    </button>
  )
}

export default Sidebar

