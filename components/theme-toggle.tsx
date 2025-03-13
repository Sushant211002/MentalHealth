"use client"

import type React from "react"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun size={20} className="transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={20} className="transition-transform duration-300 hover:-rotate-45" />
      )}
    </button>
  )
}

export default ThemeToggle

