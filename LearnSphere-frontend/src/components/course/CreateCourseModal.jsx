import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse } from '../../store/slices/courseSlice';
import { X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const CreateCourseModal = ({ isOpen, onClose }) => {
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!courseName.trim()) {
            toast.error('Please enter a course name');
            return;
        }

        setLoading(true);
        try {
            const result = await dispatch(createCourse({
                courseData: {
                    title: courseName.trim(),
                    description: '',
                    difficultyLevel: 'BEGINNER',
                    duration: 0,
                    thumbnailUrl: '',
                    category: 'DEVELOPMENT',
                    tags: ''
                },
                instructorId: user?.userId
            }));

            if (result.type === 'course/createCourse/fulfilled') {
                const courseId = result.payload?.id;
                toast.success('Course created! Redirecting to edit page...');
                onClose();
                setCourseName('');

                // Redirect to edit page
                if (courseId) {
                    navigate(`/courses/edit/${courseId}`);
                }
            } else {
                toast.error('Failed to create course');
            }
        } catch (error) {
            console.error('Create course error:', error);
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCourseName('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6 relative">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Course</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Enter a course name to get started. You'll be able to add more details on the next page.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Course Name"
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="e.g., Introduction to Web Development"
                        required
                        autoFocus
                        disabled={loading}
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={loading || !courseName.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateCourseModal;
