import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { BookOpen } from 'lucide-react'
import Button from '../common/Button'

const PublicNavbar = () => {
    const { isAuthenticated } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    return (
        <nav className="fixed w-full bg-indigo-50/80 backdrop-blur-xl z-50 border-b border-indigo-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg transition-transform transform group-hover:scale-110 shadow-lg shadow-blue-500/30">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                            LearnSphere-Platform
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors hover:bg-white/50 px-3 py-2 rounded-lg">Home</Link>
                        {/* Features link - anchor on home, redirect to home on other pages */}
                        <a href="/#features" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors hover:bg-white/50 px-3 py-2 rounded-lg">Features</a>
                        <Link to="/about" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors hover:bg-white/50 px-3 py-2 rounded-lg">About</Link>
                        <Link to="/contact" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors hover:bg-white/50 px-3 py-2 rounded-lg">Contact</Link>

                        {isAuthenticated ? (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="primary"
                                size="sm"
                                className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                            >
                                Go to Dashboard
                            </Button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors px-3">
                                    Login
                                </Link>
                                <Link to="/register?role=STUDENT">
                                    <Button variant="outline" size="sm" className="h-9 border-indigo-200 hover:border-blue-500 hover:bg-white font-bold text-xs bg-white/50">
                                        Join as Student
                                    </Button>
                                </Link>
                                <Link to="/register?role=INSTRUCTOR">
                                    <Button variant="primary" size="sm" className="h-9 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 font-bold text-xs">
                                        Become Instructor
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default PublicNavbar
