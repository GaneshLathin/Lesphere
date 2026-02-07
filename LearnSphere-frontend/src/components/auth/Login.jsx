import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../store/slices/authSlice'
import { Mail, Lock, LogIn, BookOpen, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const result = await dispatch(login(formData))
    if (result.type === 'auth/login/fulfilled') {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex relative z-10 animate-fade-in-up min-h-[600px]">
        {/* Left Side - Image/Decor */}
        <div className="hidden lg:flex w-1/2 bg-blue-900 relative items-center justify-center p-12 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              alt="Background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-900/90 mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 mx-auto shadow-inner border border-white/20">
              <BookOpen size={40} className="text-white drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-black mb-6 tracking-tight">Welcome Back!</h2>
            <p className="text-lg text-blue-100 leading-relaxed max-w-sm mx-auto">
              Note: Your access leads to opportunity. Continue your journey with LearnSphere-Platform.
            </p>
          </div>
          {/* Animated Blobs */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-[50px] opacity-30 animate-pulse" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[50px] opacity-30 animate-pulse delay-1000" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative bg-white">
          <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
            <div className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </div>
          </Link>

          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg text-white shadow-lg">
                  <BookOpen size={20} />
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">LearnSphere-Platform</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Sign In</h1>
              <p className="text-gray-500 font-medium">Please enter your details to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={Mail}
                  className="mt-0"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                    <AlertCircle size={14} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between mb-1.5 ml-1">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-500">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    icon={Lock}
                    className="mt-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                    <AlertCircle size={14} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Backend Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-fade-in-up">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-bold">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full text-base py-3 font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 rounded-xl mt-2"
                icon={LogIn}
              >
                {loading ? 'Logging in...' : 'Sign in'}
              </Button>

              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-500 font-medium text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login