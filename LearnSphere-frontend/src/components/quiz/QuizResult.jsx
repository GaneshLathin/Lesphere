import React from "react";
import { CheckCircle, Clock, RotateCcw, ArrowLeft, Award, BookOpen, Share2 } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

export default function QuizResult({ result, onRetry, onBack }) {
  const score = result.score?.toFixed ? Number(result.score.toFixed(0)) : result.score;
  const passed = score >= 70;

  // Premium Theme Configuration
  const theme = passed
    ? {
      bg: "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700",
      accent: "text-emerald-500",
      lightBg: "bg-emerald-50/50",
      border: "border-emerald-100",
      ring: "ring-emerald-200",
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
    }
    : {
      bg: "bg-gradient-to-br from-amber-500 via-orange-500 to-red-600",
      accent: "text-orange-500",
      lightBg: "bg-orange-50/50",
      border: "border-orange-100",
      ring: "ring-orange-200",
      button: "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
    };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Course</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Result Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

            {/* Status Header */}
            <div className={`${passed ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-orange-500 to-red-600'} px-8 py-12 text-white text-center relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                  {passed ? (
                    <Award className="w-10 h-10 text-yellow-300 drop-shadow-md" />
                  ) : (
                    <RotateCcw className="w-10 h-10 text-white drop-shadow-md" />
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">
                  {passed ? "Excellent Work!" : "Keep Learning!"}
                </h1>
                <p className="text-white/90 text-lg max-w-xl mx-auto font-medium">
                  {passed
                    ? "You represent mastery of this topic. Great job!"
                    : "Don't give up. Review the material and try again to achieve your badge."}
                </p>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="p-8">
              <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Performance Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Score</p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * score) / 100} strokeLinecap="round" className={passed ? 'text-emerald-500' : 'text-orange-500'} />
                    </svg>
                    <span className={`absolute text-2xl font-bold ${passed ? 'text-emerald-700' : 'text-orange-700'}`}>{score}%</span>
                  </div>
                </div>

                {/* Timer Card */}
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Time Taken</p>
                  <p className="text-2xl font-bold text-gray-900">{result.timeSpent || "0"}s</p>
                </div>

                {/* Status Card */}
                <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${passed ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-3 ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {passed ? <CheckCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <p className={`text-sm font-semibold uppercase tracking-wide ${passed ? 'text-emerald-600' : 'text-orange-600'}`}>Status</p>
                  <p className={`text-2xl font-bold ${passed ? 'text-emerald-800' : 'text-orange-800'}`}>
                    {passed ? "Qualified" : "Not Qualified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-gray-900 mb-6">Next Steps</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {passed
                ? "You have successfully completed this assessment. You can now proceed to the next topic or return to the course overview."
                : "We recommend reviewing the module content again before retaking the assessment to ensure you are fully prepared."}
            </p>

            <div className="space-y-4">
              <div className="space-y-4">
                {score < 100 && (
                  <Button
                    onClick={onRetry}
                    size="lg"
                    className={`w-full justify-center py-4 text-base font-bold shadow-lg ${passed ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'}`}
                  >
                    {passed ? "Retake to Improve" : "Try Again"}
                  </Button>
                )}

                <Button
                  onClick={onBack}
                  variant={score === 100 ? "primary" : "outline"}
                  className={`w-full justify-center py-3 ${score === 100 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 font-bold' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Return to Course
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
