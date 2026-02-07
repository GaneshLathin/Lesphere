import React from 'react'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 hover:border-blue-300/50 ${error ? 'border-red-500 bg-red-50 focus:ring-red-500/10' : ''
            }`}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Input