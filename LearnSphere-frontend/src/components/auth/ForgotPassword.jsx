import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('Email is required')
            return
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email')
            return
        }

        setLoading(true)
        setError('')

        try {
            await authService.forgotPassword(email)
            setIsSent(true)
            toast.success('Reset link sent to your email!')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
            toast.error('Failed to send email')
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
                        <h2 className="text-4xl font-black mb-6 tracking-tight">Recovery</h2>
                        <p className="text-lg text-blue-100 leading-relaxed max-w-sm mx-auto">
                            Don't worry, we've got your back. Reset your password and get back to learning.
                        </p>
                    </div>
                    {/* Animated Blobs */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-[50px] opacity-30 animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-[50px] opacity-30 animate-pulse delay-1000" />
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative bg-white">
                    <Link to="/login" className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
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

                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                                {isSent ? <CheckCircle2 size={32} /> : <Mail size={32} />}
                            </div>

                            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                                {isSent ? 'Check your email' : 'Forgot Password?'}
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {isSent
                                    ? `We've sent a password reset link to ${email}. Please check your inbox.`
                                    : 'Enter your email address and we\'ll send you a link to reset your password.'}
                            </p>
                        </div>

                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            if (error) setError('')
                                        }}
                                        placeholder="Enter your email"
                                        icon={Mail}
                                    />
                                    {error && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium ml-1 animate-pulse">
                                            <AlertCircle size={14} /> {error}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={loading}
                                    className="w-full text-base py-3 font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 rounded-xl"
                                    icon={Send}
                                >
                                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <Button
                                    onClick={() => setIsSent(false)}
                                    variant="outline"
                                    size="lg"
                                    className="w-full text-base py-3 font-bold border-2 rounded-xl"
                                >
                                    Try another email
                                </Button>
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm">
                                        Did not receive the email?{' '}
                                        <button onClick={handleSubmit} disabled={loading} className="text-blue-600 font-bold hover:underline">
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="text-center mt-8 pt-6 border-t border-gray-100">
                            <Link to="/login" className="text-gray-500 font-bold hover:text-gray-700 flex items-center justify-center gap-2 transition-colors">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
