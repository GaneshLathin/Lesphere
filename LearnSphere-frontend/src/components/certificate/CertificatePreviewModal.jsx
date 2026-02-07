import React from 'react';
import { X } from 'lucide-react';

const CertificatePreviewModal = ({ isOpen, onClose, pdfUrl }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 backdrop-blur-sm animate-fadeIn">
            {/* Floating Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/20"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Modal Container with strict aspect ratio */}
            <div className="w-full max-w-4xl aspect-[1.414] relative shadow-2xl rounded-lg overflow-hidden bg-transparent">
                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                        className="w-full h-full border-none bg-transparent"
                        title="Certificate Preview"
                    />
                ) : (
                    <div className="text-white flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <p>Loading Certificate...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificatePreviewModal;
