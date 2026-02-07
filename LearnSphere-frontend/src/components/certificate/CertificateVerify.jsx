import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { CheckCircle2, XCircle, ShieldCheck, Calendar, Hash, User, BookOpen, Loader2, ArrowRight } from 'lucide-react'

const CertificateVerify = () => {
    const { uid } = useParams()
    const [certificate, setCertificate] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const verifyCertificate = async () => {
            try {
                // Replace with your actual backend URL or use a configured axios instance
                const response = await axios.get(`http://localhost:8080/api/certificates/public/verify/${uid}`)
                setCertificate(response.data)
            } catch (err) {
                console.error("Verification failed:", err)
                const status = err.response?.status
                const msg = err.response?.data?.message || err.message
                setError(status === 404 ? "Certificate not found" : "Verification Failed")
            } finally {
                setLoading(false)
            }
        }

        if (uid) {
            verifyCertificate()
        }
    }, [uid])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]" />
                <div className="relative z-10 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Verifying Credential...</p>
                </div>
            </div>
        )
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 relative overflow-hidden font-sans">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-50/50 rounded-full blur-[100px]" />

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center relative z-10 border border-red-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid Credential</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        We could not verify the certificate with ID <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-sm font-bold">{uid}</span>. It may be invalid or does not exist.
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                        Return Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none" />

            <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 max-w-lg w-full relative overflow-hidden border border-white/50 backdrop-blur-xl animate-fade-in-up">
                {/* Top Banner Status */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 w-full"></div>

                <div className="p-8 md:p-10 pt-8">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="relative inline-block mb-6">
                            <div className="p-4 bg-emerald-50 rounded-2xl shadow-inner inline-flex">
                                <ShieldCheck className="w-12 h-12 text-emerald-600" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Verified Credential</h1>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Official Certificate</span>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="space-y-4">
                        {/* Student */}
                        <div className="group bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Awarded To</p>
                                <p className="text-lg font-bold text-slate-900">{certificate.studentName}</p>
                            </div>
                        </div>

                        {/* Course */}
                        <div className="group bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">For Course</p>
                                <p className="text-lg font-bold text-indigo-900">{certificate.courseName}</p>
                            </div>
                        </div>

                        {/* Validated Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                    <Calendar size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Issued On</span>
                                </div>
                                <p className="text-slate-900 font-bold">{new Date(certificate.issuedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group overflow-hidden">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                    <Hash size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">ID</span>
                                </div>
                                <p className="text-slate-900 font-mono text-xs break-all font-medium leading-tight relative z-10 w-full truncate" title={certificate.uid}>
                                    {certificate.uid.substring(0, 12)}...
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                                <span className="font-bold text-[10px]">SF</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Verified by LearnSphere-Platform</span>
                        </div>

                        <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group">
                            Validate Another <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CertificateVerify
