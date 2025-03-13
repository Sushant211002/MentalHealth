import type React from "react"

interface DecorativeBlobProps {
  className?: string
}

const DecorativeBlob: React.FC<DecorativeBlobProps> = ({ className = "" }) => {
  return (
    <div className={`absolute pointer-events-none opacity-30 blur-3xl ${className}`}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="600" height="600" className="animate-float">
        <path
          fill="url(#blob-gradient)"
          d="M45.3,-59.1C58.9,-51.1,70.3,-37.8,75.6,-22.1C80.9,-6.4,80.2,11.7,73.2,26.8C66.2,41.9,52.9,54,38.1,62.3C23.3,70.6,7,75.1,-8.6,73.8C-24.2,72.5,-39.1,65.4,-51.8,54.6C-64.5,43.8,-75,29.3,-78.3,13.1C-81.6,-3.1,-77.7,-20.9,-68.5,-34.9C-59.3,-48.9,-44.8,-59,-30.2,-66.7C-15.6,-74.4,-0.8,-79.7,13.1,-77.5C27,-75.3,41,-67.1,45.3,-59.1Z"
          transform="translate(100 100)"
        />
        <defs>
          <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default DecorativeBlob

