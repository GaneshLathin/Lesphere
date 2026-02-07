import React, { useState } from 'react'
import axios from 'axios'
import { Download, Loader, Award, Eye, Lock, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import CertificatePreviewModal from './CertificatePreviewModal'
import Button from '../common/Button'

const CertificateDownload = ({ courseId, isCompleted, studentId }) => {
    const [generating, setGenerating] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [showPreview, setShowPreview] = useState(false)

    const generateCertificate = async () => {
        if (!studentId) {
            toast.error("Student ID missing. Please refresh or contact support.");
            return;
        }
        setGenerating(true)
        try {
            const token = localStorage.getItem('token')
            const genResponse = await axios.post(
                `http://localhost:8080/api/certificates/generate/${courseId}?studentId=${studentId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const cert = genResponse.data
            return cert.uid
        } catch (err) {
            console.error('Certificate generation error:', err)
            // Extract error message from backend response
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to generate certificate.'
            console.log('Backend error message:', errorMessage)
            toast.error(errorMessage)
            throw err
        } finally {
            setGenerating(false)
        }
    }

    const handlePreview = async () => {
        try {
            const uid = await generateCertificate()
            const token = localStorage.getItem('token')
            const downloadResponse = await axios.get(
                `http://localhost:8080/api/certificates/download/${uid}`,
                {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            const url = window.URL.createObjectURL(new Blob([downloadResponse.data], { type: 'application/pdf' }))
            setPreviewUrl(url)
            setShowPreview(true)
        } catch (err) {
            // Toast handled in generateCertificate
        }
    }

    const handleDownload = async () => {
        try {
            const uid = await generateCertificate()
            const token = localStorage.getItem('token')
            const downloadResponse = await axios.get(
                `http://localhost:8080/api/certificates/download/${uid}`,
                {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            const url = window.URL.createObjectURL(new Blob([downloadResponse.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `certificate-${uid}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('Certificate Downloaded!')
        } catch (err) {
            // Toast handled above
        }
    }

    // 1. INCOMPLETE STATE
    if (!isCompleted) {
        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center justify-between opacity-75 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-200 p-2 rounded-full flex-shrink-0">
                        <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-700">Certificate Locked</h3>
                        <p className="text-gray-500 text-xs">Complete the course to unlock.</p>
                    </div>
                </div>

                <Button
                    disabled
                    variant="secondary"
                    size="sm"
                    className="cursor-not-allowed opacity-50 w-full sm:w-auto"
                    icon={Download}
                >
                    Download
                </Button>
            </div>
        )
    }

    // 2. COMPLETE STATE (Compact & Professional)
    return (
        <>
            <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Icon & Text */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-100">
                            <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Certificate Ready</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <p className="text-gray-500 text-xs">Official & Verified</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            onClick={handlePreview}
                            disabled={generating || !studentId}
                            variant="outline"
                            size="sm"
                            title={!studentId ? "Student ID Missing" : "Preview Certificate"}
                            className="flex-1 sm:flex-none justify-center"
                        >
                            {/* Pass custom content to children for correct alignment */}
                            <div className="flex items-center gap-2">
                                {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                <span>Preview</span>
                            </div>
                        </Button>

                        <Button
                            onClick={handleDownload}
                            disabled={generating || !studentId}
                            variant="primary"
                            size="sm"
                            title={!studentId ? "Student ID Missing" : "Download Certificate"}
                            className="flex-1 sm:flex-none justify-center shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>Download PDF</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            <CertificatePreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                pdfUrl={previewUrl}
            />
        </>
    )
}
export default CertificateDownload
