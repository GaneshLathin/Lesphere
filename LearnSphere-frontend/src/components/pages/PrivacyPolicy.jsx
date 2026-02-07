import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, FileText, Eye } from 'lucide-react'
import Button from '../common/Button'

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-6">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="text-indigo-500" size={24} />
                            1. Information We Collect
                        </h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p className="mb-4">
                                We collect information you provide directly to us when you create an account, enroll in a course, participate in interactive features, or communicate with us.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Account Information:</strong> Name, email address, password, and profile details.</li>
                                <li><strong>Course Data:</strong> Progress, quiz scores, and certifications earned.</li>
                                <li><strong>Communications:</strong> Content of messages you send to us or other users (e.g., instructors).</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="text-indigo-500" size={24} />
                            2. How We Use Your Information
                        </h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p className="mb-4">
                                We use the information we collect to provide, maintain, and improve our services, including:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Providing and delivering the learning content you request.</li>
                                <li>Processing transactions and sending related information.</li>
                                <li>Monitoring and analyzing trends, usage, and activities.</li>
                                <li>Personalizing your experience and providing content or features that match your profile.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="text-indigo-500" size={24} />
                            3. Data Security
                        </h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p>
                                We implement appropriate technical and organizational measures to protect specific data from unauthorized access, accidental loss, destruction, or damage. We use industry-standard encryption protocols to safeguard your personal information during transmission and storage.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p>
                                We do not share your personal information with third parties except as described in this policy, such as when you consent to share your certificate or progress on social media, or when required by law.
                            </p>
                        </div>
                    </section>

                    <div className="pt-8 border-t border-gray-100">
                        <p className="text-gray-500 text-sm">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@learnsphere.com" className="text-indigo-600 hover:underline">support@learnsphere.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
