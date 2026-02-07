import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Validation State
    const [validation, setValidation] = useState({
        minLength: false,
        hasNumber: false,
        hasSpecial: false,
        match: false
    })

    // Real-time validation
    const validatePassword = (pass, confirmPass) => {
        setValidation({
            minLength: pass.length >= 8,
            hasNumber: /\d/.test(pass),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
            match: pass && pass === confirmPass
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        const updatedData = { ...formData, [name]: value }
        setFormData(updatedData)

        validatePassword(
            name === 'password' ? value : formData.password,
            name === 'confirmPassword' ? value : formData.confirmPassword
        )

        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { password, confirmPassword } = formData

        if (!token) {
            setError('Invalid or missing reset token.')
            return
        }

        if (!validation.minLength || !validation.hasNumber || !validation.hasSpecial) {
            setError('Password does not meet requirements.')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        setError('')

        try {
            await authService.resetPassword(token, password)
            setSuccess(true)
            toast.success('Password reset successfully!')
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Token may be expired.')
            toast.error('Reset failed')
        } finally {
            setLoading(false)
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
                            src="https://images.unsplash.com/photo-1555421689-491a97ff2040?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                            alt="Background"
                            className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-900/90 mix-blend-multiply"></div>
                    </div>

                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 mx-auto shadow-inner border border-white/20">
                            <BookOpen size={40} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-4xl font-black mb-6 tracking-tight">Secure Access</h2>
                        <p className="text-lg text-blue-100 leading-relaxed max-w-sm mx-auto">
                            Create a strong password to protect your account and maintain access to your courses.
                        </p>
                    </div>
                    {/* Animated Blobs */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-[50px] opacity-30 animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[50px] opacity-30 animate-pulse delay-1000" />
                </div>

                {/* Right Side - Form/Success Message */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative bg-white">
                    {success ? (
                        <div className="max-w-md w-full mx-auto text-center animate-fade-in-up">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Password Reset!</h2>
                            <p className="text-gray-500 mb-8 font-medium">Your password has been successfully updated. You can now login with your new password.</p>
                            <Link to="/login">
                                <Button variant="primary" size="lg" className="w-full py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto w-full">
                            <div className="text-center mb-10">
                                <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
                                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg text-white shadow-lg">
                                        <BookOpen size={20} />
                                    </div>
                                    <span className="text-lg font-bold text-gray-900 tracking-tight">LearnSphere-Platform</span>
                                </div>
                                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Set New Password</h1>
                                <p className="text-gray-500 font-medium">Please enter and confirm your new password.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            icon={Lock}
                                            className={validation.minLength && validation.hasNumber && validation.hasSpecial ? "border-green-500 focus:ring-green-200" : ""}
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
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium ml-1">
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
                                            placeholder="Re-enter new password"
                                            icon={Lock}
                                            className={validation.match && formData.confirmPassword ? "border-green-500 focus:ring-green-200" : ""}
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
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl flex items-center gap-2 border border-red-100">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={loading || !validation.match || !validation.minLength || !validation.hasNumber || !validation.hasSpecial}
                                    className="w-full text-base py-3 font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    icon={ArrowRight}
                                >
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
