import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Camera, Mail, Phone, User, Save, Trash2,
    CheckCircle, Loader2, Award, Shield, Bell,
    Calendar, Clock, Edit2, Flame, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

import { profileService } from '../../services/profileService';
import { enrollmentService } from '../../services/enrollmentService';
import api from '../../services/api'; // For certificate generation
import { updateUser } from '../../store/slices/authSlice';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import ActivityHeatmap from './ActivityHeatmap';
import { BookOpen, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all duration-300">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon size={24} className={color.split(' ')[1]} />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{value}</h3>
        </div>
    </div>
);

const CompletedCourseCard = ({ course, onDownloadCertificate }) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await onDownloadCertificate(course.courseId);
        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-300">
            <div>
                <h4 className="text-lg font-bold text-gray-900">{course.courseTitle}</h4>
                <p className="text-sm text-gray-500 mt-1">
                    Completed on {course.completedAt ? new Date(course.completedAt).toLocaleDateString() : 'Unknown Date'}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 inline-block px-2 py-1 rounded-md">
                    {course.instructorName ? `Instr. ${course.instructorName}` : 'LearnSphere-Platform Course'}
                </p>
            </div>

            <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 hover:text-green-800 transition-colors border border-green-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>{downloading ? 'Generating...' : 'Certificate'}</span>
            </button>
        </div>
    );
};

const BadgeItem = ({ label }) => (
    <div className="flex flex-col items-center group cursor-default w-24">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 border-2 border-amber-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <Award size={32} className="text-amber-600 drop-shadow-sm" />
        </div>
        {/* User Request: 'Fully Show Case' (No Truncate) */}
        <span className="mt-2 text-xs font-bold text-gray-700 text-center px-1 py-0.5 rounded-md leading-tight break-words w-full">
            {label}
        </span>
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`
      flex items-center space-x-3 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full text-left
      ${active
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }
    `}
    >
        <Icon size={18} />
        <span>{label}</span>
    </button>
);

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [isProfileUploading, setIsProfileUploading] = useState(false);
    const [isBannerUploading, setIsBannerUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [showBannerMenu, setShowBannerMenu] = useState(false);

    // Resume Generation
    const generateResume = () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Colors
            const darkGrey = [62, 68, 74]; // #3e444a - Header Background
            const textGrey = [80, 80, 80]; // Body Text
            const sectionGrey = [50, 50, 50]; // Section Headers

            // --- HEADER SECTION (Dark Background) ---
            doc.setFillColor(...darkGrey);
            doc.rect(0, 0, pageWidth, 55, 'F');

            // Initials Box
            const initials = formData.name
                ? (formData.name.charAt(0) + (formData.name.split(' ')[1]?.charAt(0) || '')).toUpperCase()
                : 'ST';

            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(1);
            doc.rect(15, 12, 30, 30); // Box for initials

            doc.setFontSize(28);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "normal");
            doc.text(initials, 30, 31, { align: 'center' }); // Centered initials

            // Name
            doc.setFontSize(26);
            doc.setFont("helvetica", "bold");
            doc.text((formData.name || 'Student Name').toUpperCase(), 55, 22);

            // Contact Info
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(200, 200, 200);

            let contactY = 32;
            doc.text(formData.email || '', 55, contactY);
            contactY += 5;
            if (formData.phone) {
                doc.text(formData.phone, 55, contactY);
            }
            // Role/Title
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text((formData.role || 'Student').toUpperCase(), 55, 48);


            // --- BODY CONTENT ---
            let currentY = 70;
            const leftMargin = 15;
            const contentWidth = pageWidth - (leftMargin * 2);

            // Helper for Section Headers
            const addSectionHeader = (title) => {
                doc.setFontSize(11);
                doc.setTextColor(...sectionGrey);
                doc.setFont("helvetica", "bold");
                doc.text(title.toUpperCase(), leftMargin, currentY);

                currentY += 2;
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(leftMargin, currentY, pageWidth - leftMargin, currentY);
                currentY += 8;
            };

            // 1. SUMMARY
            if (formData.bio) {
                addSectionHeader('Summary');

                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...textGrey);

                const splitBio = doc.splitTextToSize(formData.bio, contentWidth);
                doc.text(splitBio, leftMargin, currentY);
                currentY += (splitBio.length * 5) + 10;
            }

            // 2. SKILLS (Badges & Stats & User Skills)
            if (formData.studentStats || formData.skills) {
                addSectionHeader('Skills & Achievements');

                // 2 Column Layout for Skills
                const col1X = leftMargin + 5;
                const col2X = pageWidth / 2 + 5;
                let skillY = currentY;

                const userSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];

                const skillsList = [
                    ...userSkills
                ];

                doc.setFontSize(10);
                doc.setTextColor(...textGrey);

                skillsList.forEach((skill, index) => {
                    const xPos = index % 2 === 0 ? col1X : col2X;
                    if (index % 2 === 0 && index > 0) skillY += 6;

                    doc.text(`•  ${skill}`, xPos, skillY);
                });

                currentY = skillY + 15;
            } else {
                // Push down if no stats (unlikely for student)
                currentY += 5;
            }

            // 3. EXPERIENCE (Mapped to Completed Courses)
            if (completedCourses.length > 0) {
                addSectionHeader('Recent Completed Courses');

                completedCourses.forEach(course => {
                    // Check page break
                    if (currentY > pageHeight - 30) {
                        doc.addPage();
                        currentY = 20;
                    }

                    // Title & Instructor
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(60, 60, 60);
                    doc.text(course.courseTitle, leftMargin, currentY);

                    // Date (Right Aligned)
                    const dateStr = new Date(course.completedAt).toLocaleDateString();
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(9);
                    doc.text(dateStr, pageWidth - leftMargin, currentY, { align: 'right' });

                    currentY += 5;

                    // Instructor / Platform
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Instructor: ${course.instructorName || 'LearnSphere'}`, leftMargin, currentY);

                    currentY += 8;
                });
                currentY += 5;
            }

            // 4. EDUCATION (Static / Join Date)
            addSectionHeader('Education & Training');

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(60, 60, 60);
            doc.text("LearnSphere Educational Platform", leftMargin, currentY);

            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text(new Date(formData.createdAt).getFullYear().toString(), pageWidth - leftMargin, currentY, { align: 'right' });

            currentY += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Active Student - Level ${formData.studentStats?.currentLevel || 'Beginner'}`, leftMargin, currentY);

            // Save
            const safeName = formData.name ? formData.name.replace(/\s+/g, '_') : 'My';
            doc.save(`${safeName}_Resume.pdf`);
            toast.success("Resume downloaded successfully!");
        } catch (error) {
            console.error("Resume generation failed", error);
            toast.error("Failed to generate resume.");
        }
    };

    // Modal States
    const [showBannerHintModal, setShowBannerHintModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // 'profile' or 'banner'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        role: '',
        skills: '', // New Field
        profileImage: null,
        bannerImage: null,
        studentStats: null,
        createdAt: null
    });

    const [completedCourses, setCompletedCourses] = useState([]);
    const [skillInput, setSkillInput] = useState(''); // Local state for input

    // Pagination for Learning History
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchProfile();
        // Fetch enrollments if student
        if (user?.role === 'STUDENT') {
            fetchCompletedCourses();
        }

        const handleClickOutside = () => {
            setShowPhotoMenu(false);
            setShowBannerMenu(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [user?.role]); // added dependency

    const fetchCompletedCourses = async () => {
        try {
            if (user?.id) {
                const enrollments = await enrollmentService.getStudentEnrollments(user.id);
                const completed = enrollments.filter(e => e.isCompleted || e.completionPercentage === 100);
                completed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                setCompletedCourses(completed);
            }
        } catch (err) {
            console.error("Failed to fetch completed courses", err);
        }
    };

    const downloadCertificate = async (courseId) => {
        try {
            // 1. Generate/Get DTO
            const res = await api.post(`/certificates/generate/${courseId}?studentId=${user.userId}`);
            const { uid } = res.data;

            const pdfRes = await api.get(`/certificates/download/${uid}`, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate-${uid}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Certificate downloaded successfully!");

        } catch (error) {
            console.error("Certificate download failed", error);
            toast.error("Failed to download certificate. Please try again.");
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await profileService.getProfile();
            const data = res.data;

            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                role: data.role || '',
                skills: data.skills || '', // Fetch skills
                profileImage: data.profileImage,
                bannerImage: data.bannerImage,
                studentStats: data.studentStats,
                createdAt: data.createdAt
            });

            dispatch(updateUser(data));
        } catch (error) {
            console.error('Failed to load profile', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Skill Handlers
    const handleAddSkill = (e) => {
        e.preventDefault();
        if (!skillInput.trim()) return;

        const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        if (!currentSkills.includes(skillInput.trim())) {
            const newSkills = [...currentSkills, skillInput.trim()].join(',');
            setFormData(prev => ({ ...prev, skills: newSkills }));
        }
        setSkillInput('');
    };

    const handleRemoveSkill = (skillToRemove) => {
        const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const newSkills = currentSkills.filter(s => s !== skillToRemove).join(',');
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await profileService.updateProfile({
                name: formData.name,
                phone: formData.phone,
                bio: formData.bio,
                skills: formData.skills // Send skills
            });

            toast.success('Profile updated successfully');
            setActiveTab('overview');
            fetchProfile();
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
        setShowPhotoMenu(false);
    };

    const triggerBannerUpload = () => {
        setShowBannerMenu(false);
        // User Request: Indicate Width via Modal instead of Alert
        setShowBannerHintModal(true);
    };

    const confirmBannerUpload = () => {
        setShowBannerHintModal(false);
        bannerInputRef.current?.click();
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const imageFormData = new FormData();
        imageFormData.append('file', file);

        try {
            setIsProfileUploading(true);
            const res = await profileService.uploadProfileImage(imageFormData);
            setFormData((prev) => ({ ...prev, profileImage: res.data.profileImage }));
            dispatch(updateUser({ profileImage: res.data.profileImage }));
            toast.success('Profile photo updated');
        } catch (error) {
            console.error('Image upload failed', error);
            toast.error('Failed to upload image');
        } finally {
            setIsProfileUploading(false);
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // Larger limit for banner
            toast.error('Banner size must be less than 5MB');
            return;
        }

        const imageFormData = new FormData();
        imageFormData.append('file', file);

        try {
            setIsBannerUploading(true);
            const res = await profileService.uploadBannerImage(imageFormData);
            setFormData((prev) => ({ ...prev, bannerImage: res.data.bannerImage }));
            toast.success('Banner updated successfully');
        } catch (error) {
            console.error('Banner upload failed', error);
            toast.error('Failed to upload banner');
        } finally {
            setIsBannerUploading(false);
        }
    };

    const requestDeleteImage = () => {
        setDeleteTarget('profile');
        setShowPhotoMenu(false);
        setShowDeleteConfirmModal(true);
    };

    const requestDeleteBanner = () => {
        setDeleteTarget('banner');
        setShowBannerMenu(false);
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirmModal(false);

        if (deleteTarget === 'profile') {
            try {
                setIsProfileUploading(true);
                await profileService.deleteProfileImage();
                setFormData((prev) => ({ ...prev, profileImage: null }));
                dispatch(updateUser({ profileImage: null }));
                toast.success('Profile photo removed');
            } catch (error) {
                console.error('Delete image failed', error);
                toast.error('Failed to remove image');
            } finally {
                setIsProfileUploading(false);
            }
        } else if (deleteTarget === 'banner') {
            try {
                setIsBannerUploading(true);
                await profileService.deleteBannerImage();
                setFormData((prev) => ({ ...prev, bannerImage: null }));
                toast.success('Banner removed');
            } catch (error) {
                console.error('Delete banner failed', error);
                toast.error('Failed to remove banner');
            } finally {
                setIsBannerUploading(false);
            }
        }
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowPhotoMenu(!showPhotoMenu);
        setShowBannerMenu(false); // Close other menu
    };

    const toggleBannerMenu = (e) => {
        e.stopPropagation();
        setShowBannerMenu(!showBannerMenu);
        setShowPhotoMenu(false); // Close other menu
    };

    if (loading && !formData.email) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    // Formatting date
    const joinDate = formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

    // Smart Formatting for Hours
    const totalMinutes = formData.studentStats?.totalLearningMinutes || 0;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const learningTimeDisplay = `${hrs}h ${mins}m`;

    const badges = formData.studentStats?.badges || [];
    const streak = formData.studentStats?.weeklyStreak || 0;

    // Default Banner if none uploaded
    const defaultBanner = "/images/default-banner.png";
    const displayBanner = formData.bannerImage || defaultBanner;

    return (
        // ✨ MAIN CONTENT WRAPPER
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

            {/* MODALS */}
            <Modal
                isOpen={showBannerHintModal}
                onClose={() => setShowBannerHintModal(false)}
                title="Update Banner Image"
                size="sm"
            >
                <div className="space-y-5">
                    <p className="text-gray-600 leading-relaxed">
                        Upload a banner image to personalize your profile header.
                    </p>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <div className="mt-0.5 text-blue-600">
                            <ImageIcon size={20} />
                        </div>
                        <div className="text-sm">
                            <h4 className="font-semibold text-blue-900 mb-1">Recommended Dimensions</h4>
                            <p className="text-blue-800">
                                <span className="font-bold">1920 x 400 pixels</span> works best.
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center justify-between px-1">
                        <span>Max file size: 5MB</span>
                        <span>Formats: JPG, PNG</span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowBannerHintModal(false)} className="px-5 text-gray-700 border-gray-300 hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={confirmBannerUpload} className="px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            Upload Image
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                title="Delete Image?"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to remove your {deleteTarget === 'banner' ? 'profile cover' : 'profile photo'}?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} className="px-5 border-gray-200 text-gray-600">
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={confirmDelete} className="px-5 bg-red-600 text-white hover:bg-red-700 shadow-red-200">
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* --- HEADER SECTION --- */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">

                {/* BANNER SECTION */}
                <div className="h-56 relative group overflow-hidden bg-gray-900">
                    <img
                        src={displayBanner}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>

                    {/* Banner Loading Overlay */}
                    {isBannerUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-white/10 p-3 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
                                <Loader2 className="animate-spin text-white" size={32} />
                            </div>
                        </div>
                    )}

                    {/* BANNER EDIT CONTROLS - Top Right */}
                    <div className="absolute top-4 right-4 z-30">
                        <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleBannerUpload}
                        />

                        <div className="relative">
                            <button
                                onClick={formData.bannerImage ? toggleBannerMenu : triggerBannerUpload}
                                className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20 transition-all font-medium text-sm shadow-sm"
                            >
                                <Camera size={16} />
                                <span>{formData.bannerImage ? 'Edit Cover' : 'Add Cover'}</span>
                            </button>

                            {/* Banner Menu Popover (Speech Bubble Style) */}
                            {showBannerMenu && formData.bannerImage && (
                                <div onClick={handleMenuClick} className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn origin-top-right">
                                    {/* Speech Bubble Arrow (Up) */}
                                    <div className="absolute -top-[6px] right-4 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                                    <div className="relative z-10 bg-white rounded-xl overflow-hidden">
                                        <button onClick={triggerBannerUpload} className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <ImageIcon size={16} /> Change Cover
                                        </button>
                                        <button onClick={requestDeleteBanner} className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                            <Trash2 size={16} /> Remove Cover
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-end -mt-20 mb-6">

                        {/* Avatar with Smart Logic */}
                        <div className="relative group mr-8">
                            <div className="w-40 h-40 rounded-full border-[6px] border-white shadow-2xl bg-white flex items-center justify-center overflow-hidden z-10 relative">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                        <span className="text-5xl font-bold text-slate-300">
                                            {formData.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {isProfileUploading && (
                                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                                        <Loader2 className="animate-spin text-blue-600" size={24} />
                                    </div>
                                )}
                            </div>

                            {/* BUTTON LOGIC: Camera (Upload) vs Edit (Menu) */}
                            <div className="absolute bottom-2 right-2 z-30">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    disabled={isProfileUploading}
                                />

                                {formData.profileImage ? (
                                    // HAS IMAGE: Show Edit Pencil -> Toggle Menu
                                    <div className="relative">
                                        <button
                                            onClick={toggleMenu}
                                            className="p-3 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>

                                        {/* Popover Menu (Speech Bubble Style) */}
                                        {showPhotoMenu && (
                                            <div onClick={handleMenuClick} className="absolute left-full ml-4 bottom-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn origin-bottom-left">
                                                {/* Speech Bubble Arrow (Left) */}
                                                <div className="absolute -left-[6px] bottom-4 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45"></div>

                                                <div className="relative z-10 bg-white rounded-xl overflow-hidden">
                                                    <button onClick={triggerFileUpload} className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                        <ImageIcon size={16} /> Change Photo
                                                    </button>
                                                    <button onClick={requestDeleteImage} className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 size={16} /> Remove Photo
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // NO IMAGE: Show Camera -> Trigger Upload Directly
                                    <button
                                        onClick={triggerFileUpload}
                                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-blue-700 hover:scale-105 transition-all"
                                        title="Upload Photo"
                                        disabled={isProfileUploading}
                                    >
                                        <Camera size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Name & Simplified Meta */}
                        <div className="flex-1 text-center md:text-left pt-14 md:pt-0">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 drop-shadow-sm">{formData.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-600">
                                {formData.createdAt && (
                                    <span className="flex items-center space-x-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>Joined {joinDate}</span>
                                    </span>
                                )}
                                <span className="flex items-center space-x-1.5 text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100 font-bold text-xs uppercase tracking-wide">
                                    <CheckCircle size={14} />
                                    <span>Verified</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* --- DATA-DRIVEN STATS --- */}
                    {formData.role === 'STUDENT' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                            <StatCard
                                icon={Clock}
                                label="Time Spent Learning"
                                value={learningTimeDisplay}
                                color="bg-blue-50 text-blue-600"
                            />

                            <StatCard
                                icon={Flame}
                                label="Current Streak"
                                value={<span>{streak} <span className="text-sm font-medium text-gray-400">days</span></span>}
                                color="bg-orange-50 text-orange-500"
                            />

                            <StatCard
                                icon={Award}
                                label="Badges Unlocked"
                                value={badges.length}
                                color="bg-yellow-50 text-yellow-600"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* --- CONTENT LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-2 sticky top-6">
                        <TabButton
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                            icon={User}
                            label="Overview"
                        />
                        <TabButton
                            active={activeTab === 'edit'}
                            onClick={() => setActiveTab('edit')}
                            icon={Edit2}
                            label="Edit Profile"
                        />
                        <TabButton
                            active={activeTab === 'notifications'}
                            onClick={() => setActiveTab('notifications')}
                            icon={Bell}
                            label="Notifications"
                        />
                        {formData.role === 'STUDENT' && (
                            <TabButton
                                active={activeTab === 'learning'}
                                onClick={() => setActiveTab('learning')}
                                icon={BookOpen}
                                label="My Learning"
                            />
                        )}
                        <TabButton
                            active={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                            icon={Shield}
                            label="Security"
                        />

                        <div className="pt-2 mt-2 border-t border-gray-100">
                            <button
                                onClick={generateResume}
                                className="flex items-center space-x-3 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full text-left text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                                <Download size={18} />
                                <span>Download Resume</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="animate-fadeIn space-y-10">

                                {/* STUDENT VIEW: Gamified Dashboard Style */}
                                {formData.role === 'STUDENT' ? (
                                    <>
                                        {/* Activity Graph Section */}
                                        <div className="animate-fadeIn delay-100">
                                            <ActivityHeatmap
                                                streak={streak}
                                                joinedAt={formData.createdAt}
                                            />
                                        </div>

                                        {/* 🔥 GAMIFICATION & PROGRESS SECTION */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-blue-100 relative overflow-hidden">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">

                                                {/* CIRCLE CHART */}
                                                <div className="flex-shrink-0">
                                                    <div className="relative w-40 h-40">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle
                                                                cx="80"
                                                                cy="80"
                                                                r="70"
                                                                stroke="currentColor"
                                                                strokeWidth="10"
                                                                fill="transparent"
                                                                className="text-white/50"
                                                            />
                                                            <circle
                                                                cx="80"
                                                                cy="80"
                                                                r="70"
                                                                stroke="currentColor"
                                                                strokeWidth="10"
                                                                fill="transparent"
                                                                strokeDasharray={2 * Math.PI * 70}
                                                                strokeDashoffset={(2 * Math.PI * 70) - ((Math.min((formData.studentStats?.totalPoints || 0) / 200, 1) * 100) / 100) * (2 * Math.PI * 70)}
                                                                strokeLinecap="round"
                                                                className="text-blue-600 transition-all duration-1000 ease-out"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Points</span>
                                                            <span className="text-3xl font-black text-gray-900">{formData.studentStats?.totalPoints || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* LEVEL INFO */}
                                                <div className="flex-1 text-center md:text-left">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                        Level: <span className="text-blue-600">{formData.studentStats?.currentLevel || 'Beginner'}</span>
                                                    </h3>
                                                    <p className="text-gray-600 mb-4">
                                                        Keep learning to unlock new badges and reach the next level!
                                                        You are doing great.
                                                    </p>

                                                    {/* XP Bar */}
                                                    <div className="w-full bg-white/50 rounded-full h-3 mb-2 border border-blue-100">
                                                        <div
                                                            className="bg-blue-500 h-full rounded-full transition-all duration-500 shadow-sm"
                                                            style={{ width: `${Math.min(((formData.studentStats?.totalPoints || 0) % 100) / 100 * 100, 100)}%` }} // Example logic
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                                                        <span>Current Progress</span>
                                                        <span>Next Level</span>
                                                    </div>
                                                </div>

                                                {/* DECORATIVE ICON */}
                                                <div className="hidden md:block opacity-10 transform rotate-12">
                                                    <Award size={120} className="text-blue-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* BADGES SECTION */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                                <Award className="text-amber-500" size={24} />
                                                <span>Achievements Showcase</span>
                                            </h3>

                                            {badges.length > 0 ? (
                                                <div className="flex flex-wrap gap-8">
                                                    {badges.map((badge, idx) => (
                                                        <BadgeItem key={idx} label={badge} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                                                    <p className="text-gray-900 font-semibold mb-1">No badges yet</p>
                                                    <p className="text-sm text-gray-500">Complete your first course to earn a badge!</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bio & Contact (Footer style for Students) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-100">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">About Me</h4>
                                                <p className={`text-gray-600 leading-relaxed ${!formData.bio && 'italic text-gray-400'}`}>
                                                    {formData.bio || "This user hasn't written a bio yet."}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Contact Info</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 text-gray-700">
                                                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Mail size={18} /></div>
                                                        <span className="font-medium">{formData.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3 text-gray-700">
                                                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><Phone size={18} /></div>
                                                        <span className="font-medium">{formData.phone || 'Not provided'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* INSTRUCTOR/ADMIN VIEW: Professional Profile Style */
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* Main Content: About Me */}
                                        <div className="md:col-span-2 flex flex-col">
                                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-full">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                                    <User size={20} className="text-blue-600" />
                                                    <span>About Me</span>
                                                </h3>
                                                <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${!formData.bio && 'italic text-gray-400'}`}>
                                                    {formData.bio || "No professional bio provided yet."}
                                                </p>
                                            </div>

                                            {/* Additional Professional Details could go here */}
                                        </div>

                                        {/* Sidebar Content: Contact & Info */}
                                        <div className="md:col-span-1 space-y-6">
                                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                                <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider">Contact Information</h3>
                                                <div className="space-y-5">
                                                    <div className="group flex items-center space-x-3 text-gray-700">
                                                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><Mail size={18} /></div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs text-gray-400 font-medium uppercase">Email</p>
                                                            <p className="font-medium truncate text-sm" title={formData.email}>{formData.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="group flex items-center space-x-3 text-gray-700">
                                                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors"><Phone size={18} /></div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-medium uppercase">Phone</p>
                                                            <p className="font-medium text-sm">{formData.phone || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="group flex items-center space-x-3 text-gray-700">
                                                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors"><Shield size={18} /></div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-medium uppercase">Role</p>
                                                            <p className="font-medium text-sm capitalize">{formData.role?.toLowerCase()}</p>
                                                        </div>
                                                    </div>
                                                    {/* Join Date for Professional View */}
                                                    <div className="group flex items-center space-x-3 text-gray-700">
                                                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors"><Calendar size={18} /></div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-medium uppercase">Member Since</p>
                                                            <p className="font-medium text-sm">{joinDate}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EDIT PROFILE */}
                        {activeTab === 'edit' && (
                            <div className="max-w-2xl animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Profile Details</h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="5"
                                            maxLength="300"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all resize-none outline-none text-gray-700"
                                            placeholder="Tell us about yourself..."
                                        />
                                        <div className="flex justify-end mt-1">
                                            <span className={`text-xs ${formData.bio.length >= 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                {formData.bio.length}/300
                                            </span>
                                        </div>
                                    </div>

                                    {/* SKILLS INPUT */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                placeholder="Add a skill (e.g. Java, React, Communication)"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                            />
                                            <Button type="button" onClick={handleAddSkill} variant="primary" className="px-6">
                                                Add
                                            </Button>
                                        </div>

                                        {/* Skill Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills && formData.skills.split(',').filter(s => s.trim()).map((skill, idx) => (
                                                <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill.trim())}
                                                        className="hover:text-blue-900 ml-1 focus:outline-none"
                                                    >
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" variant="primary" icon={Save} disabled={loading} className="px-8 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 text-white">
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* PLACEHOLDERS */}
                        {(activeTab === 'notifications' || activeTab === 'security') && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                    <Shield size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Coming Soon</h3>
                                <p className="text-gray-500 max-w-sm mt-2">
                                    This section is currently under development. Stay tuned for future updates!
                                </p>
                            </div>
                        )}

                        {/* COMPLETED COURSES */}
                        {activeTab === 'learning' && formData.role === 'STUDENT' && (
                            <div className="animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <BookOpen className="text-blue-600" size={24} />
                                    <span>My Learning Journey</span>
                                </h3>

                                {completedCourses.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-4">
                                            {completedCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(course => (
                                                <CompletedCourseCard
                                                    key={course.id}
                                                    course={course}
                                                    onDownloadCertificate={downloadCertificate}
                                                />
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={currentPage}
                                            itemsPerPage={itemsPerPage}
                                            totalItems={completedCourses.length}
                                            onPageChange={setCurrentPage}
                                        />
                                    </>
                                ) : (
                                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h4 className="text-lg font-semibold text-gray-900">No completed courses yet</h4>
                                        <p className="text-gray-500 mt-2">Finish a course to earn your first certificate!</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
