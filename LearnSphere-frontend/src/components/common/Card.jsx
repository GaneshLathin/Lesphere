// src/components/common/Card.jsx
import React from 'react'

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md overflow-hidden 
        ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''} 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}`}
      style={{ pointerEvents: onClick ? 'auto' : 'initial' }}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

