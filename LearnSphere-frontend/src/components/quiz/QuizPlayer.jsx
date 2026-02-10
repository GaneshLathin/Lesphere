import React, { useEffect, useState, useRef, useCallback } from "react";
import { getQuestionsByQuiz } from "../../services/quizApi";
import { submitAttempt } from "../../services/attemptApi";
import QuizResult from "./QuizResult";
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  ArrowLeft,
  Play,
  Maximize,
  AlertOctagon,
  MonitorX,
  Copy,
  MousePointer2,
  Lock
} from 'lucide-react';

export default function QuizPlayer({ quizId, topicId, quizTitle = "Assessment", courseName = "Course Module" }) {
  const { user } = useSelector((state) => state.auth);
  
  // -- Core Data State --
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // -- Quiz State --
  const [gameState, setGameState] = useState('INSTRUCTIONS'); // INSTRUCTIONS, SECURITY, PLAYING, REVIEW, RESULT
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionText }
  const [markedForReview, setMarksForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitted, setSubmitted] = useState(null);
  
  // -- Security State --
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isSecurityAccepted, setIsSecurityAccepted] = useState(false);

  // -- Refs for Event Listeners --
  const answersRef = useRef(answers);
  const submittedRef = useRef(submitted);
  const gameStateRef = useRef(gameState);
  const timerRef = useRef(null);

  // Sync refs
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Load Questions
  useEffect(() => {
    load();
  }, [quizId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getQuestionsByQuiz(quizId);
      setQuestions(data || []);
      // Set default duration if not provided (e.g. 1 min per question or fixed 10 mins)
      // Assuming 1 minute per question for now or default 10 mins
      setTimeLeft((data?.length || 10) * 60); 
    } catch (err) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // -- Timer Logic --
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit("Time Expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft]);

  // -- Security Listeners --
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (gameStateRef.current === 'PLAYING' && document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        toast.error("Tab switch detected! Quiz Auto-Submitted for security violation.", { 
            duration: 5000, 
            icon: '🚨',
            style: { border: '1px solid #EF4444', color: '#B91C1C' }
        });
        handleAutoSubmit("Security Violation: Tab Switch");
      }
    };

    const handleFullScreenChange = () => {
        // Optional: Enforce Fullscreen
    };

    const preventActions = (e) => {
      if (gameStateRef.current === 'PLAYING') {
        e.preventDefault();
        toast.error("Action Prohibited: " + e.type, { id: 'security-warning', icon: '🚫' });
      }
    };

    const handleKeyUp = (e) => {
        if (gameStateRef.current === 'PLAYING') {
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText(""); // Clear clipboard
                toast.error("Screenshots are strictly prohibited!", { icon: '📸' });
                // Optional: Auto submit on screenshot
                // handleAutoSubmit("Security Violation: Screenshot Attempt");
            }
        }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", preventActions);
    document.addEventListener("copy", preventActions);
    document.addEventListener("cut", preventActions);
    document.addEventListener("paste", preventActions);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventActions);
      document.removeEventListener("copy", preventActions);
      document.removeEventListener("cut", preventActions);
      document.removeEventListener("paste", preventActions);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // -- Handlers --

  const handleStartSecurity = () => {
    setGameState('SECURITY');
  };

  const handleStartQuiz = () => {
    if (!isSecurityAccepted) return;
    
    // Request Full Screen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Fullscreen denied", err));
    }

    setGameState('PLAYING');
    toast.success("Quiz Started! Good Luck.", { icon: '🚀' });
  };

  const handleAnswerSelect = (optionText) => {
    const currentQ = questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionText }));
  };

  const toggleReviewMark = () => {
    const currentQ = questions[currentQuestionIndex];
    setMarksForReview(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentQ.id)) newSet.delete(currentQ.id);
        else newSet.add(currentQ.id);
        return newSet;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState('REVIEW');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    if(gameState === 'REVIEW') setGameState('PLAYING');
  };

  const handleAutoSubmit = useCallback((reason) => {
      if (submittedRef.current) return;
      toast(reason, { icon: '⚠️' });
      handleSubmit(true); 
  }, []);

  const handleSubmit = async (isAuto = false) => {
    if (submittedRef.current) return;
    
    // Exit Fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    }

    if (!user?.studentId) {
      console.error("Student ID missing");
      return;
    }

    const currentAnswers = answersRef.current;
    
    // Format for backend
    const formatted = Object.entries(currentAnswers).map(([qid, ans]) => ({
      questionId: qid,
      answerText: ans,
    }));

    const body = {
      studentId: user.studentId,
      topicId: topicId,
      timeSpent: (questions.length * 60) - timeLeft, // Calculate time spent
      answers: formatted,
    };

    try {
      const result = await submitAttempt(quizId, body);
      setSubmitted(result);
      setGameState('RESULT');
      if (isAuto) toast.error("Quiz Auto-Submitted.");
      else toast.success("Quiz Submitted Successfully!");
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit quiz");
    }
  };

  // -- Format Helper --
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // -- RENDERERS --

  if (loading) return <div className="p-12 text-center text-gray-500">Loading assessment...</div>;
  if (submitted) return <QuizResult result={submitted} />;


  // --- SCREEN 1: INSTRUCTIONS ---
  if (gameState === 'INSTRUCTIONS') {
    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">{quizTitle}</h1>
                <div className="flex items-center space-x-4 text-blue-100 text-sm">
                    <span className="flex items-center"><List size={16} className="mr-1"/> {questions.length} Questions</span>
                    <span className="flex items-center"><Clock size={16} className="mr-1"/> {Math.ceil(timeLeft / 60)} Mins</span>
                    <span className="flex items-center"><Shield size={16} className="mr-1"/> Proctored</span>
                </div>
            </div>

            <div className="p-8">
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <MonitorX className="mr-2 text-blue-600" size={20}/> 
                            Assessment Overview
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            This assessment is designed to evaluate your understanding of <strong>{topicName}</strong> within the <strong>{courseName}</strong>. 
                            Questions may range from multiple choice to scenario-based problems.
                        </p>
                    </section>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-2">Rules & Guidelines</h4>
                            <ul className="space-y-2 text-sm text-blue-900">
                                <li className="flex items-start"><CheckCircle size={16} className="mr-2 mt-0.5 text-blue-600"/> Answer all questions.</li>
                                <li className="flex items-start"><CheckCircle size={16} className="mr-2 mt-0.5 text-blue-600"/> No negative marking.</li>
                                <li className="flex items-start"><CheckCircle size={16} className="mr-2 mt-0.5 text-blue-600"/> Review before submitting.</li>
                            </ul>
                        </div>
                        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                            <h4 className="font-bold text-orange-800 mb-2">Technical Requirements</h4>
                            <ul className="space-y-2 text-sm text-orange-900">
                                <li className="flex items-start"><AlertOctagon size={16} className="mr-2 mt-0.5 text-orange-600"/> Don't minimize window.</li>
                                <li className="flex items-start"><AlertOctagon size={16} className="mr-2 mt-0.5 text-orange-600"/> Stable internet required.</li>
                                <li className="flex items-start"><AlertOctagon size={16} className="mr-2 mt-0.5 text-orange-600"/> No tab switching allowed.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleStartSecurity}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transform hover:-translate-y-1 transition-all flex items-center"
                    >
                        Proceed to Security Check <ArrowLeft className="ml-2 rotate-180" size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- SCREEN 2: SECURITY PROTOCOL ---
  if (gameState === 'SECURITY') {
    return (
        <div className="max-w-4xl mx-auto">
             <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100 relative">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                
                <div className="p-8 text-center pb-0">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Shield className="text-red-600 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Protocol & Anti-Cheat System</h2>
                    <p className="text-gray-500">Please review and acknowledge the security measures below.</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Warning Banner */}
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex items-start">
                             <AlertTriangle className="text-red-600 mt-1 mr-3 flex-shrink-0" />
                             <div>
                                 <h4 className="font-bold text-red-800">Strict Anti-Cheat Policy Active</h4>
                                 <p className="text-sm text-red-700 mt-1">
                                     Our system actively monitors session integrity. 
                                     <strong> Any attempt to switch tabs, minimize the browser, or copy content will result in immediate auto-submission.</strong>
                                 </p>
                             </div>
                        </div>
                    </div>

                    {/* Prohibited Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center bg-gray-50 opacity-80">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-red-500 font-bold border border-gray-100">
                                <MonitorX size={20}/>
                            </div>
                            <div>
                                <h5 className="font-bold text-gray-700">Tab Switching</h5>
                                <p className="text-xs text-gray-500">Strictly Prohibited</p>
                            </div>
                            <X className="ml-auto text-red-500" />
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center bg-gray-50 opacity-80">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-red-500 font-bold border border-gray-100">
                                <Copy size={20}/>
                            </div>
                            <div>
                                <h5 className="font-bold text-gray-700">Copy / Paste</h5>
                                <p className="text-xs text-gray-500">Disabled System-wide</p>
                            </div>
                            <X className="ml-auto text-red-500" />
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center bg-gray-50 opacity-80">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-red-500 font-bold border border-gray-100">
                                <MousePointer2 size={20}/>
                            </div>
                            <div>
                                <h5 className="font-bold text-gray-700">Right Click</h5>
                                <p className="text-xs text-gray-500">Context Menu Blocked</p>
                            </div>
                            <X className="ml-auto text-red-500" />
                        </div>
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center bg-gray-50 opacity-80">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-red-500 font-bold border border-gray-100">
                                <Lock size={20}/>
                            </div>
                            <div>
                                <h5 className="font-bold text-gray-700">Full Screen</h5>
                                <p className="text-xs text-gray-500">Required for Duration</p>
                            </div>
                            <CheckCircle className="ml-auto text-green-500" />
                        </div>
                    </div>

                    {/* Pre-flight Checklist */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-3">Before You Start Check:</h4>
                        <div className="space-y-2">
                             <label className="flex items-center cursor-pointer">
                                 <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                                    checked={isSecurityAccepted}
                                    onChange={(e) => setIsSecurityAccepted(e.target.checked)}
                                 />
                                 <span className="ml-3 text-blue-800 font-medium text-sm">
                                     I understand the rules and agree to take this assessment honestly without external aid.
                                 </span>
                             </label>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                         <button 
                            onClick={() => setGameState('INSTRUCTIONS')}
                            className="text-gray-500 hover:text-gray-700 font-medium px-4"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleStartQuiz}
                            disabled={!isSecurityAccepted}
                            className={`
                                py-3 px-8 rounded-xl font-bold shadow-lg transition-all flex items-center
                                ${isSecurityAccepted 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-200 transform hover:-translate-y-1' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            <Shield size={20} className="mr-2"/>
                            I Understand & Start Quiz
                        </button>
                    </div>

                </div>
             </div>
        </div>
    );
  }

  // --- SCREEN 3: PLAYER & REVIEW --- 
  
  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isWarning = timeLeft < 180; // 3 mins
  const isCritical = timeLeft < 60; // 1 min

  return (
    <div className="flex flex-col h-screen max-h-[90vh] bg-gray-50 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 select-none">
        
       {/* Top Bar */}
       <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm h-16">
            <div className="flex items-center space-x-4">
                <div className="md:hidden">
                    <List /> 
                </div>
                <h2 className="font-bold text-gray-800 hidden md:block">{quizTitle}</h2>
            </div>
            
            <div className="flex items-center space-x-6">
                <div className="flex flex-col items-end">
                    <div className={`flex items-center font-mono text-xl font-bold ${isCritical ? 'text-red-500 animate-pulse' : isWarning ? 'text-orange-500' : 'text-blue-600'}`}>
                        <Clock size={20} className="mr-2"/>
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <button 
                    onClick={() => setGameState(gameState === 'PLAYING' ? 'REVIEW' : 'PLAYING')}
                    className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                    <List size={20} className="mr-2"/>
                    {gameState === 'REVIEW' ? 'Return to Quiz' : 'Review'}
                </button>
            </div>
       </div>

       {/* Main Content Area */}
       <div className="flex flex-1 overflow-hidden relative">
            
            {/* Sidebar (Question Palette) */}
            <div className="w-16 md:w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto hidden md:flex z-10">
                <div className="p-4 border-b border-gray-100">
                     <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4">Question Palette</h3>
                     <div className="grid grid-cols-5 gap-2">
                         {questions.map((q, idx) => {
                             const isAnswered = !!answers[q.id];
                             const isCurrent = idx === currentQuestionIndex;
                             const isFlagged = markedForReview.has(q.id);
                             
                             return (
                                 <button
                                    key={q.id}
                                    onClick={() => jumpToQuestion(idx)}
                                    className={`
                                        h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all relative
                                        ${isCurrent 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 ring-2 ring-blue-100' 
                                            : isAnswered 
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }
                                    `}
                                 >
                                     {idx + 1}
                                     {isFlagged && <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>}
                                 </button>
                             )
                         })}
                     </div>
                </div>
                <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200">
                     <div className="space-y-2 text-xs text-gray-500">
                         <div className="flex items-center"><div className="w-3 h-3 rounded bg-blue-600 mr-2"></div> Current</div>
                         <div className="flex items-center"><div className="w-3 h-3 rounded bg-blue-50 border border-blue-200 mr-2"></div> Answered</div>
                         <div className="flex items-center"><div className="w-3 h-3 rounded bg-gray-100 mr-2"></div> Not Answered</div>
                         <div className="flex items-center"><div className="w-3 h-3 rounded bg-orange-500 mr-2"></div> Flagged</div>
                     </div>
                </div>
            </div>

            {/* Question Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50 relative">
                {gameState === 'PLAYING' ? (
                <div className="max-w-3xl mx-auto p-6 md:p-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
                                Question {currentQuestionIndex + 1} of {questions.length}
                             </span>
                             <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                                {currentQ.questionText}
                             </h2>
                        </div>
                        <button 
                            onClick={toggleReviewMark}
                            className={`p-2 rounded-full transition-colors ${markedForReview.has(currentQ.id) ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:bg-gray-100'}`}
                            title="Mark for Review"
                        >
                            <Flag size={20} fill={markedForReview.has(currentQ.id) ? "currentColor" : "none"}/>
                        </button>
                    </div>

                    <div className="space-y-3 mb-10">
                        {currentQ.answers.map((op) => (
                            <label 
                                key={op.id}
                                className={`
                                    flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer group
                                    ${answers[currentQ.id] === op.optionText 
                                        ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-white bg-white'}
                                `}
                            >
                                <div className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors
                                    ${answers[currentQ.id] === op.optionText ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                                `}>
                                    {answers[currentQ.id] === op.optionText && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                </div>
                                <input
                                  type="radio"
                                  name={`q${currentQ.id}`}
                                  value={op.optionText}
                                  checked={answers[currentQ.id] === op.optionText}
                                  onChange={() => handleAnswerSelect(op.optionText)}
                                  className="hidden"
                                />
                                <span className={`font-medium ${answers[currentQ.id] === op.optionText ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {op.optionText}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-200">
                        <button 
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${currentQuestionIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                        >
                            <ChevronLeft size={20} className="mr-1"/> Previous
                        </button>

                        <button 
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transform hover:-translate-y-0.5 transition-all flex items-center"
                        >
                            {isLastQuestion ? 'Review Answers' : 'Next Question'}
                            {!isLastQuestion && <ChevronRight size={20} className="ml-2"/>}
                        </button>
                    </div>
                </div>
                ) : (
                // --- REVIEW SCREEN ---
                <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <List className="mr-3 text-blue-600"/> Review Your Answers
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {questions.map((q, idx) => (
                             <div 
                                key={q.id} 
                                onClick={() => jumpToQuestion(idx)}
                                className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${answers[q.id] ? 'bg-white border-green-200' : 'bg-orange-50 border-orange-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                     <span className="font-bold text-gray-500 text-xs uppercase">Question {idx + 1}</span>
                                     {answers[q.id] ? <CheckCircle size={16} className="text-green-500"/> : <AlertTriangle size={16} className="text-orange-500"/>}
                                </div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{q.questionText}</p>
                                <div className="text-xs text-gray-500">
                                    {answers[q.id] ? <span className="text-green-600 font-semibold">Answered</span> : <span className="text-orange-600 font-semibold">Not Answered</span>}
                                </div>
                             </div>
                        ))}
                    </div>

                    <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 p-6 -mx-8 -mb-8 mt-auto flex justify-between items-center shadow-lg">
                        <div className="text-sm text-gray-500">
                            <strong>{Object.keys(answers).length}</strong> of <strong>{questions.length}</strong> questions answered
                        </div>
                        <div className="flex space-x-4">
                             <button 
                                onClick={() => setGameState('PLAYING')}
                                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                             >
                                Back to Quiz
                             </button>
                             <button
                                onClick={() => handleSubmit(false)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-200 transform hover:-translate-y-1 transition-all"
                             >
                                Submit Assessment
                             </button>
                        </div>
                    </div>
                </div>
                )}
            </main>
       </div>
    </div>
  );
}
