import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { BookOpen, Users, GraduationCap, ArrowRight, CheckCircle, Globe, Shield, Award, PlayCircle } from 'lucide-react'
import Button from '../common/Button'
import PublicNavbar from '../layout/PublicNavbar'

import ThreeBackground from './ThreeBackground'
import NeuralText from './NeuralText'

const LandingPage = () => {
    const { isAuthenticated } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navbar - Compact & Tinted */}
            <PublicNavbar />

            {/* Hero Section - Compact to fit visible area */}
            <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden min-h-[90vh] flex flex-col justify-center bg-gradient-to-b from-indigo-50 via-white to-white">
                {/* Three.js Background Animation */}
                <ThreeBackground />

                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>

                {/* Background Blobs - Enriched */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse mix-blend-multiply"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] animate-pulse delay-1000 mix-blend-multiply"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-[120px] -z-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6 animate-fade-in-up border border-blue-100 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        New AI Courses Added Weekly
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight animate-fade-in-up [animation-delay:200ms]">
                        Master Skills with <br />
                        <NeuralText className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                            AI-Driven Learning
                        </NeuralText>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up [animation-delay:400ms] font-medium">
                        Unlock your potential with <span className="text-gray-900 font-bold">personalized learning paths</span>, real-world projects, and expert mentorship.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up [animation-delay:600ms]">
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button size="lg" className="h-14 px-8 text-base gap-2 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 font-bold">
                                    Go to Dashboard
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/register?role=STUDENT">
                                <Button size="lg" className="h-14 px-8 text-base gap-2 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 font-bold">
                                    Start Learning Now
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                        )}
                        <Link to="/courses">
                            <div className="group flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                                <BookOpen className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                                <span className="font-bold text-gray-700 group-hover:text-gray-900">Browse Courses</span>
                            </div>
                        </Link>
                        <a href="#features">
                            <div className="group flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer">
                                <PlayCircle className="text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                                <span className="font-bold text-gray-700 group-hover:text-gray-900">Explore Features</span>
                            </div>
                        </a>
                    </div>

                    <div className="mt-20 pt-12 pb-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm rounded-3xl mx-4 sm:mx-0 animate-fade-in-up [animation-delay:800ms]">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Trusted by learners from top companies</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500">
                            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                                {['Google', 'Microsoft', 'Amazon', 'Netflix', 'Meta'].map((company) => (
                                    <span key={company} className="text-2xl md:text-3xl font-black text-gray-300 hover:text-gray-600 transition-colors duration-300 cursor-default select-none tracking-tight">
                                        {company}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section - Darkened for Contrast */}
            <div id="features" className="min-h-screen flex flex-col justify-center py-20 bg-slate-50 relative">
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Why Choose LearnSphere-Platform?</h2>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
                            Premium tools for a premium learning experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Learn Anywhere",
                                desc: "Seamless synchronization across all your devices. Start on your laptop, finish on your phone.",
                                color: "bg-blue-50 text-blue-600",
                                border: "border-blue-100"
                            },
                            {
                                icon: Shield,
                                title: "Expert Content",
                                desc: "Curated curriculum designed by industry veterans to ensure job-readiness.",
                                color: "bg-purple-50 text-purple-600",
                                border: "border-purple-100"
                            },
                            {
                                icon: Award,
                                title: "Earn Certificates",
                                desc: "Blockchain-verified certificates that add real value to your professional portfolio.",
                                color: "bg-pink-50 text-pink-600",
                                border: "border-pink-100"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className={`group p-8 rounded-3xl bg-white border ${feature.border} shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}>
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div id="about" className="min-h-screen flex flex-col justify-center py-20 bg-gray-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative animate-float">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl rotate-3 opacity-20 blur-lg transform translate-y-4 translate-x-4"></div>
                            <div className="relative bg-gray-900 rounded-3xl p-6 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-default">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                                <h3 className="text-white text-2xl md:text-3xl font-bold z-10 text-center relative px-6">
                                    Transforming Education <br /> Through Innovation
                                </h3>
                            </div>
                        </div>
                        <div>
                            <div className="inline-block px-4 py-1.5 bg-white border border-blue-100 text-blue-700 font-bold rounded-full mb-6 shadow-sm">Our Mission</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">Empowering the Next Generation of Tech Leaders</h2>
                            <p className="text-gray-700 text-lg mb-6 leading-relaxed font-medium">
                                LearnSphere-Platform was founded with a simple yet ambitious goal: to democratize access to high-quality technical education. We believe that <span className="text-blue-600 font-bold">talent is universal</span>, but opportunity is not.
                            </p>
                            <div className="grid grid-cols-2 gap-8 mt-8">
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="text-3xl font-black text-blue-600 mb-1">94%</div>
                                    <div className="text-gray-600 font-semibold text-sm">Completion Rate</div>
                                </div>
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="text-3xl font-black text-purple-600 mb-1">150+</div>
                                    <div className="text-gray-600 font-semibold text-sm">Countries Reached</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section - PREMIUM & READABLE */}
            <div id="cta" className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">

                {/* Subtle decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight drop-shadow-lg">
                        Ready to Start Your Journey?
                    </h2>

                    <div className="max-w-3xl mx-auto mb-12">
                        <p className="text-xl md:text-2xl font-medium text-blue-100 leading-relaxed drop-shadow-md">
                            "Join thousands of learners and instructors on LearnSphere-Platform today. Transform your future with the power of education."
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/register?role=STUDENT">
                            <button className="min-w-[220px] px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-2xl font-bold text-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 ring-1 ring-white/20">
                                Join as Student
                            </button>
                        </Link>

                    </div>
                </div>
            </div>

            {/* Footer - Dark Theme */}
            {/* Footer - Handled globally in App.jsx */}
        </div>
    )
}

export default LandingPage
