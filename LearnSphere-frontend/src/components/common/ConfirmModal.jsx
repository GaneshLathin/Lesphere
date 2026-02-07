import React, { useEffect, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // danger | primary
    isLoading = false
}) => {
    const [show, setShow] = useState(isOpen)

    useEffect(() => {
        setShow(isOpen)
    }, [isOpen])

    if (!isOpen) return null

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30'
            case 'primary':
            default:
                return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`
        relative bg-white rounded-2xl shadow-2xl w-full max-w-sm 
        transform transition-all duration-300 ease-out border border-gray-100
        ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
      `}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
            ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}
          `}>
                        <AlertTriangle size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`
                px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                ${getVariantStyles()}
              `}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
