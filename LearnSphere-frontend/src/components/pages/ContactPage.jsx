import React from 'react'
import PublicNavbar from '../layout/PublicNavbar'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import Button from '../common/Button'

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar />

            <div className="pt-24 pb-12 lg:pt-32 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Get in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Email</h4>
                                        <p className="text-gray-600">support@learnsphere.com</p>
                                        <p className="text-gray-600">info@learnsphere.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Phone</h4>
                                        <p className="text-gray-600">+1 (555) 123-4567</p>
                                        <p className="text-gray-600">+1 (555) 765-4321</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-pink-50 p-3 rounded-xl text-pink-600">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Office</h4>
                                        <p className="text-gray-600">123 Learning Street,<br />Tech City, TC 90210</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-gray-50 focus:bg-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-gray-50 focus:bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        rows="6"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>
                                <Button size="lg" className="w-full md:w-auto px-8 gap-2 shadow-lg shadow-blue-500/30">
                                    Send Message
                                    <Send size={18} />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactPage
