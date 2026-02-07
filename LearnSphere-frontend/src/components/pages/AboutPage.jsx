import React from 'react'
import PublicNavbar from '../layout/PublicNavbar'

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar />

            <div className="pt-24 pb-12 lg:pt-32 lg:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LearnSphere-Platform</span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                        We are on a mission to democratize education and provide accessible, high-quality technical capability to learners around the globe.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl rotate-3 opacity-20 blur-lg transform translate-y-4 translate-x-4"></div>
                        <div className="relative bg-gray-900 rounded-3xl p-2 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                alt="Team collaborating"
                                className="rounded-2xl w-full h-full object-cover opacity-90"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="inline-block px-4 py-1.5 bg-white border border-blue-100 text-blue-700 font-bold rounded-full mb-6 shadow-sm">Our Vision</div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">Empowering the Next Generation of Tech Leaders</h2>
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            LearnSphere-Platform was founded with a simple yet ambitious goal: to democratize access to high-quality technical education. We believe that <span className="text-blue-600 font-bold">talent is universal</span>, but opportunity is not.
                        </p>
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                            Through our platform, we bridge the gap between aspirational learners and expert instructors, fostering a community where knowledge is shared freely and effectively.
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

                {/* Values Section */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Accessibility", desc: "Education should be available to everyone, regardless of their background or location." },
                            { title: "Quality", desc: "We are committed to providing the highest quality content and learning experience." },
                            { title: "Community", desc: "We believe in the power of community to support and inspire one another." }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Note: Footer will be handled globally in App.jsx in the future, 
                but for now we might include it here or rely on App.jsx. 
                I will include it here temporarily if App.jsx doesn't have it yet, 
                but ideally I should remove it once App.jsx has it. 
                Actually, I will NOT include Footer here, I will add it to App.jsx global layout.
            */}
        </div>
    )
}

export default AboutPage
