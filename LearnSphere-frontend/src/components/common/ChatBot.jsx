import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, ChevronRight, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../services/api';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: "Hi! I'm your **AI Mentor**. \n\nI can help you with:\n- Course Progress 📊\n- Quiz Results 📝\n- Certification Status 🏆\n\nHow can I assist you today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedQuestions = [
        "How am I doing in my courses?",
        "Show my recent quiz scores",
        "Do I have any certificates?",
        "What should I study next?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMessage = text.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/chat', { message: userMessage });
            const botResponse = response.data.response;

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting right now. Please check if the Python service is running.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col h-[600px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/10">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base flex items-center gap-2">
                                        AI Mentor <Sparkles size={14} className="text-yellow-300" />
                                    </h3>
                                    <p className="text-xs text-purple-100 flex items-center gap-1.5 opacity-90">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                        </span>
                                        Online & Ready
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 relative">
                            {/* Watermark/Background decoration */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                                <GraduationCap size={200} />
                            </div>

                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user'
                                            ? 'bg-indigo-100 border-indigo-200'
                                            : 'bg-white border-purple-100'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <User size={16} className="text-indigo-600" />
                                        ) : (
                                            <Bot size={16} className="text-purple-600" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-md'
                                            }`}
                                    >
                                        {msg.role === 'bot' ? (
                                            <div className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none text-gray-700">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white border border-purple-100 flex items-center justify-center shrink-0">
                                        <Bot size={16} className="text-purple-600" />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-md flex items-center gap-2">
                                        <span className="flex gap-1">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Chips */}
                        {messages.length < 3 && !isLoading && (
                            <div className="px-4 pb-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar mask-fade-sides">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(q)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs rounded-full hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-1"
                                    >
                                        {q} <ChevronRight size={12} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-inner">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-gray-400"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 active:scale-95"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-gray-400 mt-2">
                                AI responses may be inaccurate. Check important info.
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
                    <Sparkles size={24} className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-4 group-hover:translate-y-[-12px]" />
                    <MessageCircle size={28} className="transition-transform duration-300 group-hover:scale-90" />

                    <span className="absolute right-0 top-0 flex h-3 w-3 -mt-1 -mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] flex items-center justify-center">1</span>
                    </span>
                </motion.button>
            )}
        </div>
    );
};

export default ChatBot;
