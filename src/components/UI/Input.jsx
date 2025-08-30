"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = "",
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [inputType, setInputType] = useState(type)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    setInputType(showPassword ? "password" : "text")
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPasswordToggle ? inputType : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg 
            form-input focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Input
