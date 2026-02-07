import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CourseReviewModal = ({ isOpen, onClose, onSubmitSuccess, courseId, user }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Please add a comment");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                courseId: Number(courseId),
                studentId: user.studentId,
                userId: user.userId,
                studentName: user.name,
                rating,
                comment
            };

            await reviewService.addReview(payload);
            toast.success("Thank you for your feedback!");
            onSubmitSuccess(); // This will trigger the next modal
        } catch (err) {
            console.error("Submit review failed", err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star size={32} fill="white" className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-center">Rate Your Experience</h2>
                    <p className="text-blue-100 text-center mt-1 text-sm">How was your learning journey?</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-center text-sm font-medium text-gray-700 mb-3">Select Rating</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-125 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                >
                                    <Star fill={star <= rating ? "currentColor" : "none"} size={40} strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>
                        <p className="text-center mt-2 text-xs font-medium text-gray-500">
                            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} className="text-blue-500" />
                            Your Review
                        </label>
                        <textarea
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400"
                            rows="4"
                            placeholder="Tell us what you liked or how we can improve..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl shadow-lg shadow-blue-500/20"
                            icon={Send}
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseReviewModal;
