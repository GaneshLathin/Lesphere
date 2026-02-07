import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { BookOpen, Users, Clock, Edit, Trash2, Share2, Eye, Tag } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const KanbanView = ({
    courses,
    isInstructor,
    onDelete,
    onShare,
    parseTags,
    onCourseUpdate
}) => {
    const navigate = useNavigate();
    const [draggedCourse, setDraggedCourse] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Separate courses by status
    const draftCourses = courses.filter(c => !c.isPublished);
    const publishedCourses = courses.filter(c => c.isPublished);

    const handleDragStart = (e, course) => {
        setDraggedCourse(course);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, columnType) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnType);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedCourse) return;

        const shouldPublish = targetStatus === 'published';

        // Don't update if already in correct status
        if (draggedCourse.isPublished === shouldPublish) {
            setDraggedCourse(null);
            return;
        }

        try {
            if (shouldPublish) {
                await courseService.publishCourse(draggedCourse.id);
                toast.success('Course published successfully!');
            } else {
                // Unpublish course (would need backend endpoint)
                toast.info('Unpublish functionality needs backend endpoint');
            }

            // Notify parent to refresh courses
            if (onCourseUpdate) {
                onCourseUpdate();
            }
        } catch (error) {
            console.error('Error updating course status:', error);
            toast.error('Failed to update course status');
        }

        setDraggedCourse(null);
    };

    const CourseCard = ({ course }) => (
        <div
            draggable={isInstructor}
            onDragStart={(e) => handleDragStart(e, course)}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-move hover:shadow-md transition-shadow ${draggedCourse?.id === course.id ? 'opacity-50' : ''
                }`}
            onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'courses' } })}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.difficultyLevel === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                            course.difficultyLevel === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {course.difficultyLevel}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                {course.title}
            </h3>

            {/* Tags */}
            {course.tags && parseTags(course.tags).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {parseTags(course.tags).slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            <Tag size={8} />
                            {tag}
                        </span>
                    ))}
                    {parseTags(course.tags).length > 3 && (
                        <span className="text-xs text-gray-500">+{parseTags(course.tags).length - 3}</span>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{course.totalEnrollments || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{course.duration || 0}m</span>
                </div>
                <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    <span>{course.totalTopics || 0} Lessons</span>
                </div>
                {course.viewsCount !== undefined && (
                    <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{course.viewsCount || 0}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            {isInstructor && (
                <div className="flex items-center gap-1 pt-2 border-t">
                    <Button
                        onClick={(e) => { e.stopPropagation(); onShare(e, course); }}
                        size="sm"
                        variant="secondary"
                        icon={Share2}
                        className="flex-1 text-xs"
                    >
                        Share
                    </Button>
                    <Button
                        onClick={(e) => { e.stopPropagation(); navigate(`/courses/edit/${course.id}`); }}
                        size="sm"
                        variant="secondary"
                        icon={Edit}
                        className="flex-1 text-xs"
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={(e) => { e.stopPropagation(); onDelete(e, course); }}
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        className="flex-1 text-xs"
                    >
                        Delete
                    </Button>
                </div>
            )}
        </div>
    );

    const Column = ({ title, courses, status, count, bgColor }) => (
        <div className="flex-1 min-w-[300px]">
            <div className={`${bgColor} rounded-t-lg px-4 py-3 border-b-2 border-gray-300`}>
                <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                    <span>{title}</span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-sm">{count}</span>
                </h3>
            </div>

            <div
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={`bg-gray-50 rounded-b-lg p-4 min-h-[600px] transition-colors ${dragOverColumn === status ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'border-2 border-transparent'
                    }`}
            >
                {courses.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No courses</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <Column
                title="Draft"
                courses={draftCourses}
                status="draft"
                count={draftCourses.length}
                bgColor="bg-yellow-100"
            />
            <Column
                title="Published"
                courses={publishedCourses}
                status="published"
                count={publishedCourses.length}
                bgColor="bg-green-100"
            />
        </div>
    );
};

export default KanbanView;
