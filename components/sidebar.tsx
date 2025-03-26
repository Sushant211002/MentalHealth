"use client"

import type React from "react"
import { X, Home, History, Settings, HelpCircle, MessageSquare, Heart, Phone } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedPersona: string
  onPersonaChange: (persona: string) => void
}

const PERSONAS = [
  "Arjun (Empathetic Counselor)",
  "Anjali (Mindful Guide)",
  "Rohan (Insightful Therapist)",
  "Priya (Caring Mentor)"
]

const HELPLINES = [
  { name: "KIRAN", number: "1800-599-0019", description: "24/7 Mental Health Support" },
  { name: "AASRA", number: "91-22-2754 6669", description: "Crisis Intervention" },
  { name: "Vandrevala", number: "1860-266-2345", description: "Mental Health Support" }
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedPersona, onPersonaChange }) => {
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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Vista</h2>
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
              <SidebarItem icon={<Home size={20} />} text="Home" active />
              <SidebarItem icon={<MessageSquare size={20} />} text="New Chat" />
              <SidebarItem icon={<History size={20} />} text="History" />
              <SidebarItem icon={<Heart size={20} />} text="Self-Care Tools" />

              {/* Persona Selection */}
              <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-900">
                <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-2 px-3">Select Persona</h3>
                <select
                  value={selectedPersona}
                  onChange={(e) => onPersonaChange(e.target.value)}
                  className="w-full mx-3 p-2 rounded-lg bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {PERSONAS.map((persona) => (
                    <option key={persona} value={persona} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      {persona}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emergency Helplines */}
              <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-900">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 px-3">Emergency Helplines</h3>
                <div className="space-y-2 px-3">
                  {HELPLINES.map((helpline) => (
                    <div key={helpline.name} className="text-sm">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Phone size={14} className="mr-1" />
                        <span className="font-medium">{helpline.name}:</span>
                      </div>
                      <div className="ml-5 text-gray-600 dark:text-gray-400">{helpline.number}</div>
                      <div className="ml-5 text-xs text-gray-500 dark:text-gray-500">{helpline.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-purple-100 dark:border-purple-900">
                <SidebarItem icon={<HelpCircle size={20} />} text="Help & Resources" />
                <SidebarItem icon={<Settings size={20} />} text="Settings" />
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

