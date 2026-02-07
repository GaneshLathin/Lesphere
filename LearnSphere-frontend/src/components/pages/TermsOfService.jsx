import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Book, Scale, AlertTriangle, CheckCircle } from 'lucide-react'

const TermsOfService = () => {
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
                            <Scale size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-10">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Book className="text-indigo-500" size={24} />
                            1. Acceptance of Terms
                        </h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p>
                                By accessing and using LearnSphere-Platform, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-indigo-500" size={24} />
                            2. User Conduct
                        </h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p className="mb-4">
                                You agree to use LearnSphere-Platform only for lawful purposes. You are prohibited from posting on or transmitting through LearnSphere-Platform any material that is unlawfully threatening, libelous, defamatory, obscene, scandalous, or profane.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You must safeguard your account login credentials.</li>
                                <li>You may not reproduce, duplicate, copy, sell, resell or exploit any portion of the service.</li>
                                <li>Harassment in any manner or form on the site, including via e-mail or chat, is strictly forbidden.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-indigo-500" size={24} />
                            3. Intellectual Property
                        </h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p>
                                All content included on this site, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of LearnSphere-Platform or its content suppliers and protected by international copyright laws.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Termination</h2>
                        <div className="prose prose-indigo text-gray-600 leading-relaxed">
                            <p>
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </div>
                    </section>

                    <div className="pt-8 border-t border-gray-100">
                        <p className="text-gray-500 text-sm">
                            If you have any questions about these Terms, please contact us at <a href="mailto:legal@learnsphere.com" className="text-indigo-600 hover:underline">legal@learnsphere.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TermsOfService
