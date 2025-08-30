"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import Button from "../UI/Button"
import Input from "../UI/Input"

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateEmailForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateResetForm = () => {
    const newErrors = {}

    if (!formData.otp) {
      newErrors.otp = "OTP is required"
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmailForm()) return

    setLoading(true)
    const result = await forgotPassword(formData.email)

    if (result.success) {
      setStep(2)
    }
    setLoading(false)
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()

    if (!validateResetForm()) return

    setLoading(true)
    const result = await resetPassword(formData.email, formData.otp, formData.newPassword)

    if (result.success) {
      navigate("/login")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-gray-600">
              {step === 1
                ? "Enter your email address and we'll send you an OTP to reset your password"
                : "Enter the OTP sent to your email and create a new password"}
            </p>
          </div>

          {step === 1 ? (
            <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Button type="submit" className="w-full" loading={loading} disabled={loading}>
                Send OTP
              </Button>

              <div className="text-center">
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleResetSubmit}>
              <Input
                label="OTP Code"
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                error={errors.otp}
                required
                maxLength={6}
              />

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                required
                showPasswordToggle={true}
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                showPasswordToggle={true}
              />

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" loading={loading} disabled={loading}>
                  Reset Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
