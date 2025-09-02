"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import Button from "../UI/Button"
import Input from "../UI/Input"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const { register } = useAuth()
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!acceptedTerms) {
      setErrors((prev) => ({ ...prev, terms: "You must accept the Terms and Privacy Policy" }))
      return
    }

    setLoading(true)
    const result = await register(formData.name, formData.email, formData.password)

    if (result.success) {
      navigate("/dashboard")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join us to start managing your tasks efficiently</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

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

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                showPasswordToggle={true}
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                showPasswordToggle={true}
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked)
                  if (e.target.checked && errors.terms) {
                    setErrors((prev) => ({ ...prev, terms: "" }))
                  }
                }}
                required
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-900">
                By signing in,you agree to our{" "}
                <button type="button" onClick={() => setShowTerms(true)} className="text-primary-600 hover:text-primary-500 ">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary-600 hover:text-primary-500 ">
                  Privacy Policy
                </button>
              </label>
            </div>
            {errors.terms && (<p className="text-sm text-red-600">{errors.terms}</p>)}

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

          {/* Terms of Service Modal */}
          {showTerms && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Terms of Service</h3>
                  <button onClick={() => setShowTerms(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-gray-700">
                  <p>Welcome to Daily Task Manager. By creating an account or using our services, you agree to the following Terms of Service:</p>

                  <p><strong>1. Eligibility</strong><br/>
                  You must be at least 13 years old to use this service. If you are under 18, you may use the service only with parental or guardian consent.</p>

                  <p><strong>2. Account Responsibility</strong><br/>
                  You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately if you suspect unauthorized access to your account.</p>

                  <p><strong>3. Acceptable Use</strong><br/>
                  You agree not to misuse the platform, attempt to disrupt service, or engage in unlawful activity. Reverse engineering, automated scraping, or spamming is strictly prohibited.</p>

                  <p><strong>4. Service Availability</strong><br/>
                  We strive to keep the service reliable but cannot guarantee uninterrupted access. We may modify, suspend, or discontinue parts of the service at any time.</p>

                  <p><strong>5. Termination</strong><br/>
                  We reserve the right to suspend or terminate your account if you violate these Terms.</p>

                  <p><strong>6. Changes</strong><br/>
                  We may update these Terms occasionally. Continued use after changes means you accept the updated Terms.</p>

                  <p><strong>7. Limitation of Liability</strong><br/>
                  Daily Task Manager is provided “as is.” We are not liable for any data loss, service interruptions, or damages resulting from use of the service.</p>

                </div>
                <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
                  <button onClick={() => setShowTerms(false)} className="px-4 py-2 rounded border">Close</button>
                  <button
                    onClick={() => { setAcceptedTerms(true); setShowTerms(false); if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" })) }}
                    className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
                  >I Agree</button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy Modal */}
          {showPrivacy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Privacy Policy</h3>
                  <button onClick={() => setShowPrivacy(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-sm text-gray-700">
                  <p>At Daily Task Manager, we respect your privacy and are committed to protecting your personal data. This policy explains how we handle your information:</p>

                  <p><strong>1. Information We Collect</strong><br/>
                  • Account details: name, email, and password (encrypted).<br/>
                  • Usage data: task entries, preferences, and app activity.<br/>
                  • Technical data: browser type, device info, and cookies.</p>

                  <p><strong>2. How We Use Your Data</strong><br/>
                  • To provide core features like task creation, reminders, and storage.<br/>
                  • To improve app performance and user experience.<br/>
                  • To send important service updates (not marketing without consent).</p>

                  <p><strong>3. Data Sharing</strong><br/>
                  We do not sell or rent your data. We may share data only:<br/>
                  • With trusted third-party services necessary to run the app (e.g., hosting).<br/>
                  • If required by law or to protect safety and security.</p>

                  <p><strong>4. Data Security</strong><br/>
                  We use industry-standard measures to safeguard your data. However, no system is 100% secure, and you use the service at your own risk.</p>

                  <p><strong>5. Your Rights</strong><br/>
                  • You can update or delete your account anytime.<br/>
                  • You may request a copy of your stored data.<br/>
                  • You can contact us to request permanent deletion of your information.</p>

                  <p><strong>6. Changes</strong><br/>
                  We may update this Privacy Policy to reflect changes in the app or legal requirements. Updates will be posted here with a revised date.</p>

                  <p><strong>7. Contact</strong><br/>
                  If you have questions about this policy, please contact us at: <a
                    href="mailto:contactdailytaskservice@gmail.com"
                    style={{ color: "green", fontWeight: "bold", textDecoration: "underline" }}
                  >
                    contactdailytaskservice@gmail.com
                  </a>
                  </p>

                </div>
                <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
                  <button onClick={() => setShowPrivacy(false)} className="px-4 py-2 rounded border">Close</button>
                  <button
                    onClick={() => { setAcceptedTerms(true); setShowPrivacy(false); if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" })) }}
                    className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
                  >I Agree</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
