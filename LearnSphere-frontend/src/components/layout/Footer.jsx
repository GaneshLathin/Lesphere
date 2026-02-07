import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="relative bg-slate-900 pt-12 pb-6 overflow-hidden font-sans border-t border-slate-800">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">
                    {/* Brand Column - Spans 4 columns */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                LearnSphere
                            </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium text-sm max-w-xs">
                            Empowering learners worldwide with cutting-edge skills, expert mentorship, and a platform designed for growth.
                        </p>
                        <div className="flex gap-3 pt-1">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 border border-slate-700/50">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 - Spans 2 */}
                    <div className="lg:col-span-2 lg:col-start-6">
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-2 text-slate-400 font-medium text-sm">
                            <li><Link to="/courses" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>Browse Courses</Link></li>

                            <li><Link to="/login" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>Login</Link></li>
                            <li><Link to="/register" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>Sign Up</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 - Spans 2 */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
                        <ul className="space-y-2 text-slate-400 font-medium text-sm">
                            <li><Link to="/about" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>About Us</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>Careers</a></li>
                            <li><Link to="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>Contact</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1 group"><span className="w-0 group-hover:w-2 transition-all h-px bg-blue-400"></span>Blog</a></li>
                        </ul>
                    </div>

                    {/* Contact Column - Spans 3 */}
                    <div className="lg:col-span-3">
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
                        <ul className="space-y-3 text-slate-400 font-medium text-sm">
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors mt-0.5">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <a href="mailto:support@learnsphere.com" className="hover:text-white transition-colors">support@learnsphere.com</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 bg-purple-500/10 rounded-md text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors mt-0.5">
                                    <Phone size={16} />
                                </div>
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 bg-pink-500/10 rounded-md text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors mt-0.5">
                                    <MapPin size={16} />
                                </div>
                                <span>123 Learning Street, Tech City</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-slate-500 text-xs font-medium">
                        &copy; {new Date().getFullYear()} LearnSphere-Platform. All rights reserved.
                    </span>
                    <div className="flex gap-6 text-xs font-medium text-slate-500">
                        <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
                        <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
