import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { courseService } from '../../services/courseService';
import {
    BookOpen, Users, Clock, Edit, Trash2, Share2, Eye, Tag,
    FileText, Globe, Circle, PlayCircle, CheckCircle, GripVertical,
    Layers, Zap, Info, MoreHorizontal, IndianRupee, Shield,
    ArrowRight, ChevronRight, Lock
} from 'lucide-react';
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
    const { user } = useSelector((state) => state.auth);
    const [draggedCourse, setDraggedCourse] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const isStudent = user?.role === 'STUDENT';
    const isAdmin = user?.role === 'ADMIN';

    // Separate courses by status for Instructor/Admin
    const draftCourses = courses.filter(c => !c.isPublished);
    const publishedCourses = courses.filter(c => c.isPublished);

    // Separate courses by progress for Students
    const notStartedCourses = courses.filter(c => !c.progressPercent || c.progressPercent === 0);
    const inProgressCourses = courses.filter(c => c.progressPercent > 0 && c.progressPercent < 100);
    const completedCourses = courses.filter(c => c.progressPercent === 100);

    const handleDragStart = (e, course) => {
        if (!isInstructor && !isAdmin) return;
        setDraggedCourse(course);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, columnType) => {
        if (!isInstructor && !isAdmin) return;
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

        if (!draggedCourse || (!isInstructor && !isAdmin)) return;

        // One-way workflow: Only permit Draft -> Live
        if (targetStatus === 'published' && !draggedCourse.isPublished) {
            try {
                const loadingToast = toast.loading('Publishing course...', {
                    className: 'text-[12px] font-bold text-slate-800'
                });

                await courseService.publishCourse(draggedCourse.id);

                toast.dismiss(loadingToast);
                toast.success('Course published! Content is now live for all students.', {
                    icon: '🚀',
                    className: 'text-[12px] font-bold text-slate-800'
                });

                if (onCourseUpdate) {
                    onCourseUpdate();
                }
            } catch (error) {
                toast.error('Failed to update status. Please check your connection.');
            }
        } else if (targetStatus === 'draft' && draggedCourse.isPublished) {
            // Block unpublishing with professional explanation
            toast.error('Live courses cannot be moved back to drafts to ensure student access continuity.', {
                icon: '🛡️',
                duration: 4000,
                className: 'text-[12px] font-bold text-slate-800 border-l-4 border-rose-500 rounded-none'
            });
        }

        setDraggedCourse(null);
    };

    const CourseCard = ({ course }) => {
        const progress = course.progressPercent || 0;
        const tags = parseTags(course.tags);

        return (
            <div
                draggable={isInstructor || isAdmin}
                onDragStart={(e) => handleDragStart(e, course)}
                className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${(isInstructor || isAdmin) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                    } ${draggedCourse?.id === course.id ? 'opacity-30 scale-95 border-blue-400 border-dashed border-2' : ''}`}
                onClick={() => navigate(`/courses/${course.id}`, { state: { from: 'courses' } })}
            >
                {/* Image Overlay */}
                <div className="relative h-40 overflow-hidden">
                    {course.thumbnailUrl ? (
                        <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                e.target.parentElement.classList.add(
                                    'bg-gradient-to-br', 'from-slate-700', 'to-slate-900'
                                );
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <Layers size={40} className="text-white/20" />
                        </div>
                    )}

                    {/* Badge Overlays */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-40px)]">
                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${course.difficultyLevel === 'BEGINNER' ? 'bg-green-500/80 text-white' :
                            course.difficultyLevel === 'INTERMEDIATE' ? 'bg-amber-500/80 text-white' :
                                'bg-rose-500/80 text-white'
                            }`}>
                            {course.difficultyLevel}
                        </div>
                        {course.isPublished && (isInstructor || isAdmin) && (
                            <div className="px-2 py-1 rounded bg-indigo-600/80 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 flex items-center gap-1">
                                <Lock size={8} /> LIVE
                            </div>
                        )}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg backdrop-blur-xl border border-white/30 ${course.accessRule === 'ON_PAYMENT' ? 'bg-black/60 text-white' :
                            course.accessRule === 'ON_INVITATION' ? 'bg-indigo-600/80 text-white' :
                                'bg-emerald-500/80 text-white'
                            }`}>
                            {course.accessRule === 'ON_PAYMENT' ? (
                                <span className="flex items-center gap-0.5"><IndianRupee size={10} />{course.price}</span>
                            ) : course.accessRule === 'ON_INVITATION' ? 'Premium' : 'Free'}
                        </span>
                    </div>

                    {/* Drag Handle (Center) */}
                    {(isInstructor || isAdmin) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40">
                                <GripVertical className="text-white" size={24} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors h-9">
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-700">
                            {course.instructorName?.charAt(0) || '?'}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 truncate uppercase tracking-tight">
                            {course.instructorName || 'Unknown Instructor'}
                        </span>
                    </div>

                    {/* Progress Bar (Student) */}
                    {isStudent && progress > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tighter">
                                <span className="text-slate-400">Completion</span>
                                <span className={progress === 100 ? 'text-emerald-500' : 'text-blue-500'}>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Features/Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5" title="Enrolled Students">
                                <Users size={12} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-700">{course.totalEnrollments || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Lessons">
                                <BookOpen size={12} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-700">{course.totalTopics || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
                            <Clock size={11} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-600">{course.duration || 0}m</span>
                        </div>
                    </div>
                </div>

                {/* Hover Quick Tools */}
                {(isInstructor || isAdmin) && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <button onClick={(e) => { e.stopPropagation(); onShare(e, course); }} className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-blue-600 hover:scale-110 transition-all border border-slate-200"><Share2 size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/courses/edit/${course.id}`); }} className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-indigo-600 hover:scale-110 transition-all border border-slate-200"><Edit size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(e, course); }} className="p-2 bg-white/95 backdrop-blur shadow-lg rounded-xl text-rose-500 hover:bg-rose-50 hover:scale-110 transition-all border border-slate-200"><Trash2 size={14} /></button>
                    </div>
                )}
            </div>
        );
    };

    const Column = ({ title, courses, status, count, icon: Icon, colorClass, gradientClass, subText }) => (
        <div className="flex-1 min-w-[300px]">
            {/* Minimalist Professional Header */}
            <div className={`group flex items-center justify-between p-3 rounded-2xl mb-4 transition-all duration-300 hover:shadow-md border border-transparent hover:border-slate-200 ${colorClass}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shadow-sm ${gradientClass} text-white`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-sm tracking-tight uppercase">{title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{subText}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600">
                        {count}
                    </span>
                    <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                </div>
            </div>

            {/* Kanban Body */}
            <div
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex flex-col gap-1 min-h-[700px] rounded-3xl p-3 transition-colors duration-500 border-2 ${dragOverColumn === status
                    ? 'bg-blue-50/50 border-blue-400 border-dashed scale-[1.005] ring-8 ring-blue-50'
                    : 'bg-slate-50/30 border-transparent'
                    }`}
            >
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10">
                                <Icon size={32} strokeWidth={1} className="text-slate-300" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-slate-50 rounded-full opacity-50 blur-xl animate-pulse"></div>
                        </div>
                        <h4 className="text-[14px] font-bold text-slate-600 tracking-tight mb-2">
                            Workspace clear: {title}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400 max-w-[200px] leading-relaxed mx-auto italic">
                            There are currently no {status === 'published' ? 'live' : 'draft'} entries. Ready to sync your progress?
                        </p>
                    </div>
                ) : (
                    courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))
                )}

                {/* Dropzone Hint when dragging */}
                {draggedCourse && dragOverColumn !== status && (isInstructor || isAdmin) && (
                    <div className="mt-auto border-2 border-slate-200 border-dashed rounded-2xl p-4 flex items-center justify-center opacity-30">
                        <Zap size={16} className="text-slate-300 mr-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Drop to move</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className={`flex overflow-x-auto pb-8 pt-4 scroll-smooth ${isStudent ? 'gap-8 justify-start lg:justify-center' : 'justify-center'}`}>
                {isStudent ? (
                    <div className="max-w-7xl mx-auto w-full px-2">
                        <div className="flex gap-8 justify-start lg:justify-center">
                            <Column
                                title="Enrollments"
                                subText="Not Started"
                                courses={notStartedCourses}
                                status="notstarted"
                                count={notStartedCourses.length}
                                icon={Circle}
                                colorClass="bg-white"
                                gradientClass="bg-slate-400"
                            />
                            <Column
                                title="Active Study"
                                subText="In Progress"
                                courses={inProgressCourses}
                                status="inprogress"
                                count={inProgressCourses.length}
                                icon={PlayCircle}
                                colorClass="bg-blue-50/50"
                                gradientClass="bg-blue-500"
                            />
                            <Column
                                title="Achieved"
                                subText="Completed"
                                courses={completedCourses}
                                status="completed"
                                count={completedCourses.length}
                                icon={CheckCircle}
                                colorClass="bg-emerald-50/50"
                                gradientClass="bg-emerald-500"
                            />
                        </div>
                    </div>
                ) : (isInstructor || isAdmin) ? (
                    <div className="max-w-7xl mx-auto w-full px-2">
                        <div className="flex gap-8 justify-center">
                            <Column
                                title="Drafts"
                                subText="Draft Workspace"
                                courses={draftCourses}
                                status="draft"
                                count={draftCourses.length}
                                icon={FileText}
                                colorClass="bg-white"
                                gradientClass="bg-orange-500"
                            />
                            <Column
                                title="Live Courses"
                                subText="Live on Store"
                                courses={publishedCourses}
                                status="published"
                                count={publishedCourses.length}
                                icon={Globe}
                                colorClass="bg-indigo-50/30"
                                gradientClass="bg-indigo-600"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto w-full px-4">
                        <Column
                            title="Overview"
                            subText="All Courses"
                            courses={courses}
                            status="all"
                            count={courses.length}
                            icon={BookOpen}
                            colorClass="bg-white"
                            gradientClass="bg-blue-600"
                        />
                    </div>
                )}
            </div>

            {/* Desktop Center Hint */}
            {!isStudent && !isAdmin && (isInstructor || isAdmin) && (
                <div className="flex items-center justify-center py-4 text-slate-300">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                        <ArrowRight size={12} />
                        Drag between columns to synchronize status
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanView;
