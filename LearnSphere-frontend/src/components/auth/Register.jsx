import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../../store/slices/authSlice'
import { Mail, Lock, User, UserPlus, BookOpen, AlertCircle, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

const Register = () => {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    phone: '',
    bio: '',
    specialization: ''
  })
  const [errors, setErrors] = useState({})
  const [isRoleLocked, setIsRoleLocked] = useState(false)

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation State
  const [validation, setValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
    match: false
  })

  // Scroll Logic State
  const [showTopArrow, setShowTopArrow] = useState(false)
  const [showBottomArrow, setShowBottomArrow] = useState(true)
  const formContainerRef = useRef(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (roleParam) {
      const normalizedRole = roleParam.toUpperCase()
      if (['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(normalizedRole)) {
        setFormData(prev => ({ ...prev, role: normalizedRole }))
        setIsRoleLocked(true)
      }
    }
  }, [roleParam])

  // Scroll Indicator Logic
  const checkScroll = () => {
    if (!formContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = formContainerRef.current

    // Show top arrow if we've scrolled down at least 20px
    setShowTopArrow(scrollTop > 20)

    // Show bottom arrow if we're not at the bottom (with small buffer)
    // Only show if there IS scrollable content
    const isScrollable = scrollHeight > clientHeight
    const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10
    setShowBottomArrow(isScrollable && !isAtBottom)
  }

  useEffect(() => {
    const container = formContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      // Initial check (delay slightly to ensures UI renders)
      setTimeout(checkScroll, 100)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (container) container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scrollByAmount = (amount) => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollBy({ top: amount, behavior: 'smooth' })
    }
  }

  // Real-time validation
  const validatePassword = (pass, confirmPass) => {
    setValidation({
      minLength: pass.length >= 8,
      hasNumber: /\d/.test(pass),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      match: pass && pass === confirmPass
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Full Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Strict password validation check
    if (!validation.minLength || !validation.hasNumber || !validation.hasSpecial) {
      newErrors.password = 'Password does not meet strength requirements'
    }

    if (!validation.match) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.role === 'INSTRUCTOR' && !formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required for Instructors'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)

    if (name === 'password' || name === 'confirmPassword') {
      validatePassword(
        name === 'password' ? value : formData.password,
        name === 'confirmPassword' ? value : formData.confirmPassword
      )
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const result = await dispatch(register(formData))
    if (result.type === 'auth/register/fulfilled') {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex relative z-10 animate-fade-in-up h-[85vh] max-h-[900px]">

        {/* Left Side - Image/Decor */}
        <div className="hidden lg:flex w-5/12 bg-indigo-900 relative items-center justify-center p-12 text-white overflow-hidden h-full">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              alt="Background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-900/90 mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 mx-auto shadow-inner border border-white/20">
              <BookOpen size={40} className="text-white drop-shadow-md" />
            </div>
            <h2 className="text-4xl font-black mb-6 tracking-tight">Start Your Journey</h2>
            <p className="text-lg text-indigo-100 leading-relaxed max-w-sm mx-auto mb-8">
              {formData.role === 'INSTRUCTOR'
                ? "Inspire the next generation. Share your knowledge and create a lasting impact on global learners."
                : "Unlock your potential. Master the skills that will shape your future and career."}
            </p>

            <div className="space-y-4 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-300 shadow-sm flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-indigo-50 font-medium text-sm">Free access to intro courses</span>
              </div>
              <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-300 shadow-sm flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-indigo-50 font-medium text-sm">Community support & mentorship</span>
              </div>
            </div>
          </div>
          {/* Animated Blobs */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 flex flex-col relative bg-white h-full group">
          {/* Scroll Indicators (Floating) */}
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${showTopArrow ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            onClick={() => scrollByAmount(-200)}
          >
            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md border border-gray-100 cursor-pointer hover:bg-white text-indigo-600 animate-bounce">
              <ChevronUp size={20} />
            </div>
          </div>

          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${showBottomArrow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            onClick={() => scrollByAmount(200)}
          >
            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md border border-gray-100 cursor-pointer hover:bg-white text-indigo-600 animate-bounce">
              <ChevronDown size={20} />
            </div>
          </div>

          <div
            ref={formContainerRef}
            className="flex-1 overflow-y-auto modern-scrollbar p-8 sm:p-12"
          >
            <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10">
              <div className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </div>
            </Link>

            <div className="max-w-md mx-auto w-full pt-4 lg:pt-0">
              <div className="text-center mb-6">
                <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow-lg">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight">LearnSphere-Platform</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Create Account</h1>
                <p className="text-gray-500 font-medium">Join the community and start learning today.</p>
              </div>

              {/* Role Badge (If locked) */}
              {isRoleLocked && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-md shadow-indigo-600/20">
                      {formData.role === 'INSTRUCTOR' ? <UserPlus size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">You are joining as</p>
                      <p className="font-extrabold text-indigo-900 text-lg">{formData.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}</p>
                    </div>
                  </div>
                  <Link to="/register" onClick={() => setIsRoleLocked(false)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline px-2">Change</Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      icon={User}
                      className="mt-0"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                        <AlertCircle size={14} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      icon={Mail}
                      className="mt-0"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                        <AlertCircle size={14} /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        icon={Lock}
                        className={`mt-0 ${validation.minLength && validation.hasNumber && validation.hasSpecial ? "border-green-500 focus:ring-green-200" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Indicators */}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-medium ml-1">
                      <div className={`flex items-center gap-1.5 ${validation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 size={12} /> Min 8 chars
                      </div>
                      <div className={`flex items-center gap-1.5 ${validation.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 size={12} /> At least 1 number
                      </div>
                      <div className={`flex items-center gap-1.5 ${validation.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle2 size={12} /> At least 1 special char
                      </div>
                    </div>

                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                        <AlertCircle size={14} /> {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        icon={Lock}
                        className={`mt-0 ${validation.match && formData.confirmPassword ? "border-green-500 focus:ring-green-200" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <p className={`mt-2 text-sm flex items-center gap-1 font-medium ml-1 ${validation.match ? 'text-green-600' : 'text-red-500'}`}>
                        {validation.match ? (
                          <><CheckCircle2 size={14} /> Passwords match</>
                        ) : (
                          <><AlertCircle size={14} /> Passwords do not match</>
                        )}
                      </p>
                    )}

                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                        <AlertCircle size={14} /> {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Role Select (Only if NOT locked) */}
                  {!isRoleLocked && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white font-medium outline-none transition-all hover:border-blue-300/50 text-gray-700"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  )}

                  {/* Specialization (Instructor Only) */}
                  {formData.role === 'INSTRUCTOR' && (
                    <div className="animate-fade-in-up">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Specialization</label>
                      <Input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Web Development"
                      />
                      {errors.specialization && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-medium ml-1">
                          <AlertCircle size={14} /> {errors.specialization}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start gap-3 mt-4 pt-2">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms || false}
                        onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:border-indigo-400 checked:border-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
                      />
                      <CheckCircle2
                        size={14}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        strokeWidth={4}
                      />
                    </div>
                    <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none leading-tight">
                      I agree to the <Link to="/terms" target="_blank" className="text-indigo-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading || !validation.match || !validation.minLength || !validation.hasNumber || !validation.hasSpecial || !formData.agreeToTerms}
                  className="w-full text-base py-3 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 font-bold transition-all hover:-translate-y-0.5 rounded-xl pt-3 pb-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  icon={UserPlus}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-500 font-medium text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register