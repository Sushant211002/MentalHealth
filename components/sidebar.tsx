"use client"

import type React from "react"
import { X, Home, History, Settings, HelpCircle, MessageSquare, Heart } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
                <span className="text-white font-bold">M</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Mindful</h2>
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
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active }) => {
  return (
    <a
      href="#"
      className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
        active
          ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
          : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:text-purple-800 dark:hover:text-purple-200"
      }`}
    >
      <span className="mr-3 flex items-center justify-center">{icon}</span>
      <span className="font-medium truncate">{text}</span>
    </a>
  )
}

export default Sidebar

