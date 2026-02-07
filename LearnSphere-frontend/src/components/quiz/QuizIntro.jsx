import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { getAttempts } from '../../services/attemptApi';
import { useSelector } from 'react-redux';
import { Clock, Trophy, CheckCircle, Play, ArrowLeft, Info, BarChart } from 'lucide-react';
import Button from '../common/Button';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

const QuizIntro = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { topicId, courseId } = location.state || {};

    useEffect(() => {
        fetchQuizDetails();
    }, [quizId]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);
            const data = await quizService.getQuizById(quizId);
            setQuiz(data);

            if (user?.studentId) {
                try {
                    const attemptsRes = await getAttempts(quizId, user.studentId);
                    // attemptApi.getAttempts returns list (since backend now returns List<DTO>)
                    // If wrapper exists (ApiResponse), handle it, otherwise direct array.
                    const attemptsList = Array.isArray(attemptsRes) ? attemptsRes : (attemptsRes?.data || []);
                    setAttempts(Array.isArray(attemptsList) ? attemptsList : []);
                } catch (err) {
                    console.error("Failed to load attempts:", err);
                    setAttempts([]);
                }
            }
        } catch (error) {
            console.error("Error fetching quiz details:", error);
            toast.error("Failed to load quiz details");
        } finally {
            setLoading(false);
        }
    };

    const handleStart = () => {
        navigate(`/quiz/play/${quizId}`, {
            state: { topicId, courseId, quizId }
        });
    };

    const handleBack = () => {
        courseId ? navigate(`/courses/${courseId}`) : navigate(-1);
    };

    if (loading) return <Loader />;
    if (!quiz) return <div className="text-center py-10 text-gray-500">Quiz not found</div>;

    const isStudent = user?.role === 'STUDENT';

    // Logic to ensure professional titles for students
    let displayTitle = quiz.title;
    if (isStudent) {
        if (quiz.topic?.name) {
            displayTitle = `${quiz.topic.name} Assessment`;
        } else {
            // Remove "AI", "Generated", "Manual", "Quiz" case-insensitively
            const cleaned = quiz.title?.replace(/\b(AI|Generated|Manual|Quiz)\b/gi, "").trim();
            // If cleaned string is valid, use it + "Assessment". Else fallback to "Module Assessment"
            displayTitle = cleaned ? `${cleaned} Assessment` : "Module Assessment";
        }
    }

    const highestScore = attempts.length > 0
        ? Math.max(...attempts.map(a => a.score))
        : 0;

    const isPassed = highestScore >= 70;
    const attemptsCount = attempts.length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Course</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <h1 className="text-3xl font-bold mb-3 tracking-tight relative z-10">
                                {displayTitle}
                            </h1>
                            <p className="text-blue-100 text-lg leading-relaxed relative z-10 max-w-2xl">
                                Verify your understanding of {quiz.topic?.name || 'this module'} with this comprehensive assessment.
                            </p>
                        </div>

                        <div className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-indigo-600" />
                                Instructions
                            </h3>
                            <div className="prose prose-blue max-w-none text-gray-600">
                                <ul className="space-y-4 list-none pl-0">
                                    {[
                                        "This assessment consists of multiple-choice questions designed to test your mastery of the topic.",
                                        "A score of 70% or higher is required to unlock the 'Completed' status for this topic.",
                                        "You may retake this assessment as many times as needed to improve your score.",
                                        "Please ensure you have a stable internet connection before beginning."
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center mr-3 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                            </div>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats Panel */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
                        <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Assessment Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-4 text-blue-600 border border-gray-100">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</p>
                                    <p className="font-bold text-gray-900">{quiz.duration} minutes</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-4 text-purple-600 border border-gray-100">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Passing Score</p>
                                    <p className="font-bold text-gray-900">70%</p>
                                </div>
                            </div>

                            <div className={`flex items-center p-3 rounded-xl transition-colors ${isPassed ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
                                <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-4 border border-gray-100 ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isPassed ? <CheckCircle className="w-5 h-5" /> : <BarChart className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${isPassed ? 'text-green-700' : 'text-orange-700'}`}>Your Best</p>
                                    <p className={`font-bold ${isPassed ? 'text-green-800' : 'text-orange-800'}`}>
                                        {attemptsCount > 0 ? `${highestScore.toFixed(0)}%` : 'Not Attempted'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Button
                                onClick={handleStart}
                                size="lg"
                                className="w-full justify-center py-4 text-base font-bold shadow-lg shadow-indigo-500/20 transform transition-transform hover:-translate-y-0.5"
                                icon={Play}
                            >
                                {attemptsCount > 0 ? 'Retake Assessment' : 'Start Assessment'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizIntro;
