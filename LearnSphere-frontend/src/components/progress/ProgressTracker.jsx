// // src/components/progress/ProgressTracker.jsx
// import React, { useEffect, useState } from "react";
// import { progressService } from "../../services/progressService";
// import { useSelector } from "react-redux";
// import Card from "../common/Card";
// import Loader from "../common/Loader";

// const ProgressTracker = () => {
//   const { user } = useSelector((state) => state.auth);
//   const [progress, setProgress] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user?.studentId) load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   const load = async () => {
//     try {
//       setLoading(true);
//       const res = await progressService.getStudentProgress(user.studentId);

//       const data = res?.data?.data ?? res?.data ?? [];
//       setProgress(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Progress error:", err);
//       setProgress([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <Card className="p-6 mb-6">
//       <h2 className="text-xl font-bold mb-4">Your Progress</h2>

//       {progress.length === 0 ? (
//         <p className="text-gray-600">No progress yet.</p>
//       ) : (
//         progress.map((item) => {
//           // defensive fallback for property names
//           const pct =
//             item?.progressPercent ??
//             item?.completionPercentage ??
//             item?.progressPercentage ??
//             item?.completionPercent ??
//             0;


//           return (
//             <div key={item.courseId || item.courseId} className="mb-3">
//               <p className="font-semibold">{item.courseName ?? item.courseTitle}</p>
//               <div className="w-full h-3 bg-gray-200 rounded">
//                 <div
//                   className="h-3 bg-blue-500 rounded"
//                   style={{ width: `${pct}%` }}
//                 ></div>
//               </div>
//               <p className="text-sm text-gray-600 mt-1">{pct}% completed</p>
//             </div>
//           );
//         })
//       )}
//     </Card>
//   );
// };

// export default ProgressTracker;


// // src/components/progress/ProgressTracker.jsx
// import React, { useEffect, useState } from "react";
// import api from "../../services/api";
// import { useSelector } from "react-redux";
// import {
//   Flame,
//   Star,
//   Clock,
//   Award,
//   Trophy,
//   Zap,
//   BadgeCheck,
// } from "lucide-react";

// const ProgressTracker = () => {
//   const { user } = useSelector((state) => state.auth);
//   const [summary, setSummary] = useState(null);
//   const [courseProgress, setCourseProgress] = useState([]);

//   const [loading, setLoading] = useState(true);

//   // Fetch progress summary
//   const loadProgress = async () => {
//     try {
//       const res1 = await api.get(`/progress/student/${user.studentId}/summary`);
//       const res2 = await api.get(`/progress/student/${user.studentId}`);

//       setSummary(res1.data.data);
//       setCourseProgress(res2.data.data);

//       setLoading(false);
//     } catch (err) {
//       console.error("Progress load failed", err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProgress();
//   }, []);

//   if (loading || !summary) {
//     return <div className="p-6 text-center text-gray-600">Loading progress...</div>;
//   }

//   // Extract values
//   const {
//     totalLearningMinutes,
//     weeklyStreakDays,
//     badges: backendBadges,
//   } = summary;

//   // Compute XP (client-side formula)
//   const completedCourses = courseProgress.filter((c) => c.completionPercentage === 100);
//   const completedTopics = courseProgress.length * 5; // approx top-level placeholder
//   const completedMaterials = courseProgress.length * 3; // approx — backend may add later

//   const XP =
//     completedMaterials * 5 +
//     completedTopics * 15 +
//     totalLearningMinutes * 1;

//   // Build extra badges
//   const extraBadges = [];

//   if (completedCourses.length > 0) extraBadges.push("Course Completed");
//   if (totalLearningMinutes >= 60) extraBadges.push("1-Hour Learner");
//   if (weeklyStreakDays >= 3) extraBadges.push("3-Day Streak");
//   if (weeklyStreakDays >= 7) extraBadges.push("7-Day Streak");

//   // Difficulty based
//   completedCourses.forEach((course) => {
//     if (!course.courseName) return;
//     if (course.courseName.toLowerCase().includes("beginner"))
//       extraBadges.push("Beginner Master");

//     if (course.courseName.toLowerCase().includes("intermediate"))
//       extraBadges.push("Intermediate Champion");

//     if (course.courseName.toLowerCase().includes("advanced"))
//       extraBadges.push("Advanced Pro");
//   });

//   const allBadges = [...new Set([...backendBadges, ...extraBadges])];

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-3xl mx-auto mt-6">
//       <h2 className="text-2xl font-bold text-gray-900 mb-4">Progress Tracker</h2>

//       {/* XP, Streak, Time */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         {/* Streak */}
//         <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center space-x-3">
//           <Flame size={32} className="text-orange-600" />
//           <div>
//             <p className="text-2xl font-bold">{weeklyStreakDays} days</p>
//             <p className="text-sm text-gray-600">7-Day Learning Streak</p>
//           </div>
//         </div>

//         {/* XP */}
//         <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center space-x-3">
//           <Star size={32} className="text-purple-600" />
//           <div>
//             <p className="text-2xl font-bold">{XP} XP</p>
//             <p className="text-sm text-gray-600">Skill Score</p>
//           </div>
//         </div>

//         {/* Total Time */}
//         <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center space-x-3">
//           <Clock size={32} className="text-blue-600" />
//           <div>
//             <p className="text-2xl font-bold">{totalLearningMinutes} min</p>
//             <p className="text-sm text-gray-600">Total Learning Time</p>
//           </div>
//         </div>
//       </div>

//       {/* Badges */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-2">Badges Earned</h3>

//         {allBadges.length === 0 ? (
//           <p className="text-gray-500 text-sm">No badges earned yet.</p>
//         ) : (
//           <div className="flex flex-wrap gap-3">
//             {allBadges.map((badge, index) => (
//               <div
//                 key={index}
//                 className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full text-green-700 font-medium"
//               >
//                 <BadgeCheck size={18} />
//                 <span>{badge}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProgressTracker;


// src/components/progress/ProgressTracker.jsx
import React, { useEffect, useState } from "react";
import { Flame, Star, Clock, Award } from "lucide-react";
import api from "../../services/api";
import { useSelector } from "react-redux";
import Loader from "../common/Loader";

const ProgressTracker = () => {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.studentId) {
      fetchProgressSummary();
    }
  }, [user]);

  const fetchProgressSummary = async () => {
    try {
      setLoading(true); // Ensure loading state is reset on re-fetch
      const res = await api.get(`/progress/student/${user.studentId}/summary`);
      setSummary(res.data.data);
    } catch (err) {
      console.error("Progress summary fetch error:", err);
      // Fallback to default structure on error (e.g., 404 for new user)
      setSummary({
        weeklyStreakDays: 0,
        totalLearningMinutes: 0,
        skillScore: 0,
        badges: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // If summary is still null (shouldn't happen with fallback, but safe check), show empty or return null
  if (!summary) return null;

  const {
    weeklyStreakDays = 0,
    totalLearningMinutes = 0,
    skillScore = 0,
    badges = [],
  } = summary;

  return (
    <div className="w-full  mx-auto space-y-6">

      {/* MAIN CARD - GLASS + GRADIENT */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-[2px] rounded-2xl shadow-xl">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8">

          {/* Title */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            Your Learning Progress
          </h2>

          {/* GRID CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 🔥 Streak */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-md rounded-xl p-6 flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-600 p-4 rounded-xl">
                <Flame size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">7-Day Streak</p>
                <p className="text-2xl font-bold text-gray-900">{weeklyStreakDays} days</p>
              </div>
            </div>

            {/* ⭐ Skill Score */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-md rounded-xl p-6 flex items-center space-x-4">
              <div className="bg-yellow-100 text-yellow-600 p-4 rounded-xl">
                <Star size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Skill Score</p>
                <p className="text-2xl font-bold text-gray-900">{skillScore} XP</p>
              </div>
            </div>

            {/* ⏱ Total Time */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-md rounded-xl p-6 flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Learning</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(totalLearningMinutes / 60)}h {totalLearningMinutes % 60}m
                </p>
              </div>
            </div>
          </div>

          {/* BADGES */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🎖 Badges Earned</h3>

            {badges.length === 0 ? (
              <p className="text-gray-600 text-sm">No badges earned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full shadow-md"
                  >
                    <Award size={18} />
                    <span className="font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
