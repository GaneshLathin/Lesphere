// //AWS S3
// import React, { useState } from 'react'
// import { X, Play, Pause, Volume2, VolumeX, Maximize, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react'
// import Button from '../common/Button'
// import { materialProgressService } from "../../services/materialProgressService";
// import { useSelector } from "react-redux";
// import toast from "react-hot-toast";


// const MaterialViewer = ({ material, onClose }) => {
//   const { user } = useSelector((state) => state.auth);
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [isMuted, setIsMuted] = useState(false)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const [pdfViewMode, setPdfViewMode] = useState('google')
//   const videoRef = React.useRef(null)

//   if (!material) return null

//   // Always return S3 URL directly
//   const getFileUrl = () => material.filePath

//   // PDF viewer S3 compatible
//   const getPdfViewUrl = () => {
//     const originalUrl = getFileUrl()

//     if (pdfViewMode === 'google') {
//       return `https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}&embedded=true`
//     }

//     if (pdfViewMode === 'mozilla') {
//       return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(originalUrl)}`
//     }

//     return originalUrl
//   }

//   const handlePlayPause = () => {
//     if (!videoRef.current) return
//     if (isPlaying) videoRef.current.pause()
//     else videoRef.current.play()
//     setIsPlaying(!isPlaying)
//   }

//   const handleTimeUpdate = () => {
//     if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
//   }

//   const handleLoadedMetadata = () => {
//     if (videoRef.current) setDuration(videoRef.current.duration)
//   }

//   const handleSeek = (e) => {
//     const seekTime = (e.target.value / 100) * duration
//     if (videoRef.current) {
//       videoRef.current.currentTime = seekTime
//       setCurrentTime(seekTime)
//     }
//   }

//   const handleMuteToggle = () => {
//     if (!videoRef.current) return
//     videoRef.current.muted = !isMuted
//     setIsMuted(!isMuted)
//   }

//   const handleFullscreen = () => {
//     if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen()
//   }

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = Math.floor(seconds % 60)
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`
//   }

//   const handleDownload = () => {
//     const link = document.createElement('a')
//     link.href = getFileUrl()
//     link.download = material.fileName || material.title
//     link.target = '_blank'
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer')

//   const progress = duration > 0 ? (currentTime / duration) * 100 : 0

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
//       <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">

//         {/* Header */}
//         <div className="bg-white px-6 py-4 flex items-center justify-between rounded-t-xl">
//           <div className="flex-1 mr-4">
//             <h2 className="text-xl font-bold text-gray-900">{material.title}</h2>
//             {material.description && (
//               <p className="text-sm text-gray-600 mt-1">{material.description}</p>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X size={24} className="text-gray-600" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="bg-white">

//           {/* VIDEO */}
//           {material.materialType === 'VIDEO' && (
//             <div className="relative bg-black">
//               <video
//                 ref={videoRef}
//                 className="w-full h-auto max-h-[70vh]"
//                 onTimeUpdate={handleTimeUpdate}
//                 onLoadedMetadata={handleLoadedMetadata}
//                 onEnded={() => setIsPlaying(false)}
//                 src={getFileUrl()}
//               />

//               {/* Video Controls */}
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">

//                 {/* Progress Bar */}
//                 <div className="mb-3">
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={progress}
//                     onChange={handleSeek}
//                     className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                     style={{
//                       background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
//                     }}
//                   />
//                   <div className="flex justify-between text-xs text-white mt-1">
//                     <span>{formatTime(currentTime)}</span>
//                     <span>{formatTime(duration)}</span>
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex items-center space-x-4">
//                   <button
//                     onClick={handlePlayPause}
//                     className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full"
//                   >
//                     {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
//                   </button>

//                   <button
//                     onClick={handleMuteToggle}
//                     className="p-2 hover:bg-gray-800 rounded-full"
//                   >
//                     {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
//                   </button>

//                   <div className="flex-1"></div>

//                   <button
//                     onClick={handleFullscreen}
//                     className="p-2 hover:bg-gray-800 rounded-full"
//                   >
//                     <Maximize size={20} className="text-white" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* PDF */}
//           {material.materialType === 'PDF' && (
//             <div className="bg-gray-50">

//               {/* Mode Switch */}
//               <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <AlertCircle size={16} className="text-blue-600" />
//                     <span className="text-sm text-blue-800">PDF Viewer Mode:</span>
//                   </div>

//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => setPdfViewMode('google')}
//                       className={`px-3 py-1 text-xs rounded-md ${pdfViewMode === 'google'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-white text-blue-600 border border-blue-300'}`}
//                     >
//                       Google Viewer
//                     </button>

//                     <button
//                       onClick={() => setPdfViewMode('mozilla')}
//                       className={`px-3 py-1 text-xs rounded-md ${pdfViewMode === 'mozilla'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-white text-blue-600 border border-blue-300'}`}
//                     >
//                       Mozilla Viewer
//                     </button>
//                   </div>
//                 </div>

//                 <p className="text-xs text-blue-600 mt-1">Switch if PDF fails to load</p>
//               </div>

//               {/* Iframe */}
//               <div className="h-[70vh] bg-gray-100">
//                 <iframe
//                   src={getPdfViewUrl()}
//                   className="w-full h-full"
//                   title={material.title}
//                 />
//               </div>

//               {/* Tips */}
//               <div className="px-6 py-4 bg-yellow-50 border-t">
//                 <div className="flex items-start space-x-3">
//                   <FileText size={20} className="text-yellow-600" />
//                   <div>
//                     <p className="text-sm font-medium text-yellow-800">PDF Issues?</p>
//                     <p className="text-xs text-yellow-700">
//                       • Try changing viewer<br />
//                       • Open in new tab<br />
//                       • Download PDF
//                     </p>

//                     <div className="flex space-x-3 mt-3">
//                       <Button
//                         onClick={() => openInNewTab(getFileUrl())}
//                         variant="secondary"
//                         size="sm"
//                         icon={ExternalLink}
//                       >
//                         Open in New Tab
//                       </Button>
//                       <Button
//                         onClick={handleDownload}
//                         variant="primary"
//                         size="sm"
//                         icon={Download}
//                       >
//                         Download PDF
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//             </div>
//           )}

//           {/* LINK */}
//           {material.materialType === 'LINK' && (
//             <div className="p-6">
//               <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-4">
//                 <h3 className="font-semibold text-blue-900">External Link</h3>
//                 <p className="text-sm text-blue-800">Click below to open.</p>

//                 <a
//                   href={material.externalUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="mt-3 inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg"
//                 >
//                   <span>Open Link</span>
//                   <ExternalLink size={16} />
//                 </a>
//               </div>

//               <iframe
//                 src={material.externalUrl}
//                 className="w-full h-[500px] border"
//                 title={material.title}
//                 sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
//               />
//             </div>
//           )}

//           {/* Footer */}
//           <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl flex justify-between">
//             <div className="text-sm text-gray-600">
//               <span className="font-medium">Type:</span> {material.materialType}
//               {material.fileName && (
//                 <>
//                   <span className="mx-2">•</span>
//                   <span className="font-medium">File:</span> {material.fileName}
//                 </>
//               )}
//             </div>

//             <div className="flex space-x-3">
//               {/* ✔ Mark Material Completed Button */}
//               {/* In Backend We set as Completed Topic If Quiz is Attemt or not */}
//               {/* <Button
//                 onClick={async () => {
//                   try {
//                     await materialProgressService.markMaterialCompleted(
//                       user.userId,
//                       material.id
//                     );
//                     toast.success("Material marked as completed!");
//                   } catch (err) {
//                     console.error(err);
//                     toast.error("Failed to mark completed");
//                   }
//                 }}
//                 variant="success"
//                 size="sm"
//               >
//                 Mark Completed
//               </Button> */}

//               {(material.materialType === 'VIDEO' || material.materialType === 'PDF') && (
//                 <Button
//                   onClick={handleDownload}
//                   variant="secondary"
//                   size="sm"
//                   icon={Download}
//                 >
//                   Download
//                 </Button>
//               )}

//               <Button onClick={onClose} variant="primary" size="sm">
//                 Close
//               </Button>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default MaterialViewer


// // src/components/material/MaterialViewer.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   X,
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   Maximize,
//   Download,
//   ExternalLink,
//   FileText,
//   AlertCircle,
// } from 'lucide-react';
// import Button from '../common/Button';
// import { materialProgressService } from '../../services/materialProgressService';
// import api from '../../services/api'; // make sure path is correct
// import { useSelector } from 'react-redux';
// import toast from 'react-hot-toast';

// const TIME_REPORT_INTERVAL = 20; // seconds — report every 20s
// const COMPLETE_THRESHOLD = 0.85; // 85% watched -> auto-complete
// const MIN_SECONDS_TO_REPORT = 5; // don't report tiny fragments

// const MaterialViewer = ({ material, topicId, onClose }) => {
//   const { user } = useSelector((state) => state.auth);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [pdfViewMode, setPdfViewMode] = useState('google');
//   const videoRef = useRef(null);

//   // auto-complete / reporting refs
//   const reportedSecondsRef = useRef(0); // seconds already reported to server in this session
//   const lastReportAtRef = useRef(0); // last time we reported (seconds)
//   const hasMarkedCompletedRef = useRef(false); // ensure markMaterialCompleted called once
//   const reportTimerRef = useRef(null);

//   if (!material) return null;

//   const getFileUrl = () => material.filePath;

//   const getPdfViewUrl = () => {
//     const originalUrl = getFileUrl();
//     if (pdfViewMode === 'google') {
//       return `https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}&embedded=true`;
//     }
//     if (pdfViewMode === 'mozilla') {
//       return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(originalUrl)}`;
//     }
//     return originalUrl;
//   };

//   // Helper to send time to topic-add-time endpoint (throttled)
//   const sendTimeReport = async (secondsToAdd) => {
//     if (!user?.studentId) return;
//     if (secondsToAdd < MIN_SECONDS_TO_REPORT) return;

//     try {
//       await api.post('/progress/topic/add-time', {
//         studentId: user.studentId,
//         topicId: topicId,
//         seconds: Math.round(secondsToAdd),
//       });
//       // accumulate local reported seconds so we don't double-send
//       reportedSecondsRef.current += secondsToAdd;
//       lastReportAtRef.current = currentTime;
//       // optional toast.debug or console
//       // console.debug('Reported seconds', secondsToAdd);
//     } catch (err) {
//       console.error('Time report failed:', err);
//       // do NOT auto-logout here; handle gracefully.
//     }
//   };

//   // Mark material completed once (guarded)
//   const markMaterialCompletedOnce = async () => {
//     if (hasMarkedCompletedRef.current) return;
//     if (!user?.userId && !user?.studentId) return;

//     try {
//       // Prefer studentId if you use that consistently on backend
//       const sid = user.studentId ?? user.userId;
//       await materialProgressService.markMaterialCompleted(sid, material.id);
//       hasMarkedCompletedRef.current = true;
//       toast.success('Material marked completed');
//     } catch (err) {
//       console.error('Auto-complete failed:', err);
//       // if 403 comes, do not force logout here — show a toast
//       if (err?.response?.status === 401) {
//         toast.error('Session expired. Please login again.');
//       } else {
//         toast.error('Could not mark material completed (server error).');
//       }
//     }
//   };

//   // This function is called by timeupdate and periodically by timer.
//   // It will decide whether to send a time report and whether to auto-complete.
//   const attemptAutoCompleteGuarded = () => {
//     if (!videoRef.current) return;
//     const now = videoRef.current.currentTime || currentTime;
//     setCurrentTime(now);

//     // Decide to report delta seconds since last report
//     const lastReportedAt = lastReportAtRef.current || 0;
//     const toReport = now - lastReportedAt;
//     if (toReport >= TIME_REPORT_INTERVAL) {
//       sendTimeReport(toReport).catch(() => {});
//     }

//     // If we've watched sufficiently (percentage threshold), mark completed
//     if (duration > 0) {
//       const watchedRatio = now / duration;
//       if (watchedRatio >= COMPLETE_THRESHOLD) {
//         markMaterialCompletedOnce();
//       }
//     }
//   };

//   // Start a periodic background timer that also saves time if user is playing.
//   const startReportTimer = () => {
//     stopReportTimer();
//     reportTimerRef.current = setInterval(() => {
//       if (!videoRef.current) return;
//       if (videoRef.current.paused) return;
//       // report the seconds since lastReportAtRef
//       const now = videoRef.current.currentTime;
//       const toReport = now - (lastReportAtRef.current || 0);
//       if (toReport >= TIME_REPORT_INTERVAL) {
//         sendTimeReport(toReport).catch(() => {});
//       }
//     }, 1000 * 5); // check every 5 seconds (not too often)
//   };

//   const stopReportTimer = () => {
//     if (reportTimerRef.current) {
//       clearInterval(reportTimerRef.current);
//       reportTimerRef.current = null;
//     }
//   };

//   // Video event handlers
//   const handlePlayPause = () => {
//     if (!videoRef.current) return;
//     if (videoRef.current.paused) {
//       videoRef.current.play();
//       setIsPlaying(true);
//       startReportTimer();
//     } else {
//       videoRef.current.pause();
//       setIsPlaying(false);
//       // on pause, send a final small report
//       const now = videoRef.current.currentTime;
//       const toReport = now - (lastReportAtRef.current || 0);
//       if (toReport >= MIN_SECONDS_TO_REPORT) sendTimeReport(toReport).catch(() => {});
//       stopReportTimer();
//     }
//   };

//   const handleTimeUpdate = () => {
//     // update local currentTime
//     if (videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//     }
//     // do guarded checks (throttled by internal logic)
//     attemptAutoCompleteGuarded();
//   };

//   const handleLoadedMetadata = () => {
//     if (videoRef.current) {
//       setDuration(videoRef.current.duration || 0);
//     }
//   };

//   const handleSeek = (e) => {
//     const seekTime = (e.target.value / 100) * duration;
//     if (videoRef.current) {
//       videoRef.current.currentTime = seekTime;
//       setCurrentTime(seekTime);
//     }
//   };

//   const handleMuteToggle = () => {
//     if (!videoRef.current) return;
//     videoRef.current.muted = !isMuted;
//     setIsMuted(!isMuted);
//   };

//   const handleFullscreen = () => {
//     if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen();
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };

//   const handleDownload = () => {
//     const link = document.createElement('a');
//     link.href = getFileUrl();
//     link.download = material.fileName || material.title;
//     link.target = '_blank';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

//   // When video ends: final report + final complete
//   const handleEnded = async () => {
//     setIsPlaying(false);
//     stopReportTimer();

//     // final seconds to send
//     const now = videoRef.current?.currentTime ?? currentTime;
//     const toReport = now - (lastReportAtRef.current || 0);
//     if (toReport >= MIN_SECONDS_TO_REPORT) {
//       await sendTimeReport(toReport).catch(() => {});
//     }

//     // mark material completed once
//     await markMaterialCompletedOnce().catch(() => {});
//   };

//   // Cleanup timers on unmount
//   useEffect(() => {
//     return () => {
//       stopReportTimer();
//     };
//   }, []);

//   // computed progress percent for UI
//   const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
//       <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="bg-white px-6 py-4 flex items-center justify-between rounded-t-xl">
//           <div className="flex-1 mr-4">
//             <h2 className="text-xl font-bold text-gray-900">{material.title}</h2>
//             {material.description && <p className="text-sm text-gray-600 mt-1">{material.description}</p>}
//           </div>
//           <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <X size={24} className="text-gray-600" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="bg-white">
//           {/* VIDEO */}
//           {material.materialType === 'VIDEO' && (
//             <div className="relative bg-black">
//               <video
//                 ref={videoRef}
//                 className="w-full h-auto max-h-[70vh]"
//                 onTimeUpdate={handleTimeUpdate}
//                 onLoadedMetadata={() => {
//                   handleLoadedMetadata();
//                   // reset refs when new metadata loads
//                   reportedSecondsRef.current = 0;
//                   lastReportAtRef.current = 0;
//                   hasMarkedCompletedRef.current = false;
//                 }}
//                 onEnded={handleEnded}
//                 src={getFileUrl()}
//                 controls={false} // using custom controls below
//               />

//               {/* Video Controls */}
//               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
//                 {/* Progress Bar */}
//                 <div className="mb-3">
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={percent}
//                     onChange={handleSeek}
//                     className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                     style={{
//                       background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percent}%, #4b5563 ${percent}%, #4b5563 100%)`,
//                     }}
//                   />
//                   <div className="flex justify-between text-xs text-white mt-1">
//                     <span>{formatTime(currentTime)}</span>
//                     <span>{formatTime(duration)}</span>
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex items-center space-x-4">
//                   <button onClick={handlePlayPause} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full">
//                     {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
//                   </button>

//                   <button onClick={handleMuteToggle} className="p-2 hover:bg-gray-800 rounded-full">
//                     {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
//                   </button>

//                   <div className="flex-1" />

//                   <button onClick={handleFullscreen} className="p-2 hover:bg-gray-800 rounded-full">
//                     <Maximize size={20} className="text-white" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* PDF */}
//           {material.materialType === 'PDF' && (
//             <div className="bg-gray-50">
//               {/* Mode Switch */}
//               <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <AlertCircle size={16} className="text-blue-600" />
//                     <span className="text-sm text-blue-800">PDF Viewer Mode:</span>
//                   </div>

//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => setPdfViewMode('google')}
//                       className={`px-3 py-1 text-xs rounded-md ${pdfViewMode === 'google' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-300'}`}
//                     >
//                       Google Viewer
//                     </button>

//                     <button
//                       onClick={() => setPdfViewMode('mozilla')}
//                       className={`px-3 py-1 text-xs rounded-md ${pdfViewMode === 'mozilla' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-300'}`}
//                     >
//                       Mozilla Viewer
//                     </button>
//                   </div>
//                 </div>

//                 <p className="text-xs text-blue-600 mt-1">Switch if PDF fails to load</p>
//               </div>

//               {/* Iframe */}
//               <div className="h-[70vh] bg-gray-100">
//                 <iframe src={getPdfViewUrl()} className="w-full h-full" title={material.title} />
//               </div>

//               {/* Tips */}
//               <div className="px-6 py-4 bg-yellow-50 border-t">
//                 <div className="flex items-start space-x-3">
//                   <FileText size={20} className="text-yellow-600" />
//                   <div>
//                     <p className="text-sm font-medium text-yellow-800">PDF Issues?</p>
//                     <p className="text-xs text-yellow-700">
//                       • Try changing viewer
//                       <br />
//                       • Open in new tab
//                       <br />
//                       • Download PDF
//                     </p>

//                     <div className="flex space-x-3 mt-3">
//                       <Button onClick={() => openInNewTab(getFileUrl())} variant="secondary" size="sm" icon={ExternalLink}>
//                         Open in New Tab
//                       </Button>
//                       <Button onClick={handleDownload} variant="primary" size="sm" icon={Download}>
//                         Download PDF
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* LINK */}
//           {material.materialType === 'LINK' && (
//             <div className="p-6">
//               <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-4">
//                 <h3 className="font-semibold text-blue-900">External Link</h3>
//                 <p className="text-sm text-blue-800">Click below to open.</p>

//                 <a href={material.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg">
//                   <span>Open Link</span>
//                   <ExternalLink size={16} />
//                 </a>
//               </div>

//               <iframe src={material.externalUrl} className="w-full h-[500px] border" title={material.title} sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
//             </div>
//           )}

//           {/* Footer */}
//           <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl flex justify-between">
//             <div className="text-sm text-gray-600">
//               <span className="font-medium">Type:</span> {material.materialType}
//               {material.fileName && (
//                 <>
//                   <span className="mx-2">•</span>
//                   <span className="font-medium">File:</span> {material.fileName}
//                 </>
//               )}
//             </div>

//             <div className="flex space-x-3">
//               {(material.materialType === 'VIDEO' || material.materialType === 'PDF') && (
//                 <Button onClick={handleDownload} variant="secondary" size="sm" icon={Download}>
//                   Download
//                 </Button>
//               )}

//               <Button onClick={onClose} variant="primary" size="sm">
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  ExternalLink,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../common/Button";
import api from "../../services/api";
import toast from "react-hot-toast";
import { fadeIn, scaleIn, slideInLeft } from "../../utils/animations";

const TIME_REPORT_INTERVAL = 20;
const COMPLETE_THRESHOLD = 0.85;
const MIN_SECONDS_TO_REPORT = 5;

const MaterialViewer = ({ material, topicId, onClose, onComplete }) => {
  const { user } = useSelector((state) => state.auth);

  // ⏳ Simple Timer State
  const [startTime, setStartTime] = useState(null);

  // Video Player States
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // PDF Viewer
  const [pdfViewMode, setPdfViewMode] = useState("google");

  // ⏳ PDF/Text Timer State
  const [pdfTimeLeft, setPdfTimeLeft] = useState(0);
  const [isPdfTimerActive, setIsPdfTimerActive] = useState(false);

  // Initialize Timer
  useEffect(() => {
    if ((material?.materialType === "PDF" || material?.materialType === "TEXT") && material.durationMinutes > 0) {
      setPdfTimeLeft(material.durationMinutes * 60);
      setIsPdfTimerActive(true);
    } else {
      setPdfTimeLeft(0);
      setIsPdfTimerActive(false);
    }
  }, [material]);

  // Timer Tick
  useEffect(() => {
    let interval;
    if (isPdfTimerActive && pdfTimeLeft > 0) {
      interval = setInterval(() => {
        setPdfTimeLeft((prev) => {
          if (prev <= 1) {
            handlePdfComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPdfTimerActive, pdfTimeLeft]);

  const handlePdfComplete = async () => {
    setIsPdfTimerActive(false);
    toast.success("Required reading time completed!");
    try {
      if (onComplete) onComplete(material.id);

      if (user?.studentId || user?.userId) {
        const idToUse = user.studentId || user.userId;
        await import('../../services/materialProgressService').then(m => m.materialProgressService.markMaterialCompleted(idToUse, material.id));
      }
    } catch (err) {
      console.error("Failed to mark PDF completed:", err);
    }
  };

  const formatPdfTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (!material) return null;

  const getFileUrl = () => {
    // For materials with attachments (like IMAGE), use the first attachment's fileUrl
    if (material.attachments && material.attachments.length > 0) {
      return material.attachments[0].fileUrl || material.attachments[0].externalUrl;
    }
    // For materials with direct file path (like VIDEO, PDF)
    return material.filePath || material.externalUrl;
  };

  const getPdfViewUrl = () => {
    const original = getFileUrl();
    if (pdfViewMode === "google")
      return `https://docs.google.com/viewer?url=${encodeURIComponent(original)}&embedded=true`;
    return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(original)}`;
  };

  // 🚀 START TIMER ON OPEN
  useEffect(() => {
    setStartTime(Date.now());

    return () => {
      sendTotalTimeAndClose();
    };
  }, []);

  // 🚀 SEND TOTAL TIME TO BACKEND
  const sendTotalTimeAndClose = async () => {
    if (!startTime || !user?.studentId) return;

    const totalSeconds = Math.round((Date.now() - startTime) / 1000);

    if (totalSeconds < 2) return; // ignore accidental opens

    try {
      await api.post("/progress/topic/add-time", {
        studentId: user.studentId,
        topicId: topicId,
        seconds: totalSeconds
      });

      toast.success(`+${totalSeconds}s added`);
    } catch (err) {
      console.error("Failed to add time:", err);
    }
  };

  // Video handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleEnded = async () => {
    setIsPlaying(false);
    toast.success("Video completed!");
    try {
      if (onComplete) onComplete(material.id);
      if (user?.studentId || user?.userId) {
        const idToUse = user.studentId || user.userId;
        await import('../../services/materialProgressService').then(m => m.materialProgressService.markMaterialCompleted(idToUse, material.id));
      }
    } catch (err) {
      console.error("Failed to mark video completed:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = getFileUrl();
    link.download = material.fileName || material.title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get material type icon and color
  const getMaterialTypeInfo = () => {
    switch (material.materialType) {
      case "VIDEO":
        return { icon: Video, color: "from-purple-500 to-pink-500", bg: "bg-purple-100" };
      case "PDF":
        return { icon: FileText, color: "from-blue-500 to-cyan-500", bg: "bg-blue-100" };
      case "IMAGE":
        return { icon: ImageIcon, color: "from-green-500 to-emerald-500", bg: "bg-green-100" };
      case "LINK":
        return { icon: LinkIcon, color: "from-orange-500 to-red-500", bg: "bg-orange-100" };
      case "TEXT":
        return { icon: FileText, color: "from-indigo-500 to-purple-500", bg: "bg-indigo-100" };
      default:
        return { icon: Sparkles, color: "from-gray-500 to-gray-600", bg: "bg-gray-100" };
    }
  };

  const typeInfo = getMaterialTypeInfo();
  const TypeIcon = typeInfo.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            sendTotalTimeAndClose();
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <motion.div
            className={`bg-gradient-to-r ${typeInfo.color} px-6 py-5 flex items-center justify-between relative overflow-hidden`}
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-24 translate-y-24"></div>
            </div>

            <div className="flex-1 mr-4 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  className={`${typeInfo.bg} p-2 rounded-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TypeIcon size={24} className="text-white" />
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold text-white drop-shadow-lg"
                  variants={fadeIn}
                >
                  {material.title}
                </motion.h2>
              </div>
              {material.description && (
                <motion.p
                  className="text-sm text-white/90 ml-14"
                  variants={fadeIn}
                  transition={{ delay: 0.1 }}
                >
                  {material.description}
                </motion.p>
              )}
            </div>

            <motion.button
              onClick={() => {
                sendTotalTimeAndClose();
                onClose();
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors relative z-10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <X size={28} className="text-white" />
            </motion.button>
          </motion.div>

          {/* CONTENT */}
          <motion.div
            className="bg-white overflow-y-auto max-h-[calc(95vh-180px)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >

            {/* VIDEO VIEWER */}
            {material.materialType === "VIDEO" && (
              <div className="relative bg-black group">
                <video
                  ref={videoRef}
                  className="w-full max-h-[70vh]"
                  src={getFileUrl()}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  controls={false}
                />

                {/* Enhanced CONTROLS */}
                <motion.div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Progress Bar with Gradient */}
                  <div className="mb-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                      style={{
                        background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(236, 72, 153) ${duration ? (currentTime / duration) * 100 : 0}%, rgb(75, 85, 99) ${duration ? (currentTime / duration) * 100 : 0}%, rgb(75, 85, 99) 100%)`
                      }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Play/Pause Button */}
                      <motion.button
                        onClick={handlePlayPause}
                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                      </motion.button>

                      {/* Mute Button */}
                      <motion.button
                        onClick={handleMuteToggle}
                        className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </motion.button>

                      {/* Time Display */}
                      <div className="text-white text-sm font-medium">
                        <span className="text-purple-300">{formatTime(currentTime)}</span>
                        <span className="mx-1 text-gray-400">/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Fullscreen Button */}
                    <motion.button
                      onClick={handleFullscreen}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Maximize size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Enhanced PDF VIEWER */}
            {material.materialType === "PDF" && (
              <>
                <motion.div
                  className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50/50 flex justify-between border-b items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-600" />
                    <span className="text-blue-800 font-semibold text-sm">Viewer Mode:</span>
                  </div>

                  {/* Enhanced TIMER DISPLAY */}
                  {(material.durationMinutes > 0) && (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {pdfTimeLeft > 0 ? (
                        <motion.span
                          className={`font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 shadow-sm ${pdfTimeLeft < 30
                            ? 'text-red-600 bg-red-50 border-red-200 animate-pulse'
                            : 'text-orange-600 bg-orange-50 border-orange-200'
                            }`}
                          animate={pdfTimeLeft < 30 ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Clock size={18} />
                          <span className="font-mono">{formatPdfTime(pdfTimeLeft)}</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          className="text-green-600 font-bold flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border-2 border-green-200 shadow-sm"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <CheckCircle size={18} /> Completed!
                        </motion.span>
                      )}
                    </motion.div>
                  )}

                  {/* Modern Mode Switcher */}
                  <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm">
                    <motion.button
                      onClick={() => setPdfViewMode("google")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${pdfViewMode === "google"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Google
                    </motion.button>

                    <motion.button
                      onClick={() => setPdfViewMode("mozilla")}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${pdfViewMode === "mozilla"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Mozilla
                    </motion.button>
                  </div>
                </motion.div>

                <motion.iframe
                  src={getPdfViewUrl()}
                  className="w-full h-[70vh] bg-gray-100"
                  title="PDF Viewer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </>
            )}

            {/* Enhanced LINK VIEWER */}
            {material.materialType === "LINK" && (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-orange-50/20">
                <motion.a
                  href={getFileUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ExternalLink size={20} />
                  <span>Open External Link</span>
                </motion.a>

                <motion.iframe
                  src={getFileUrl()}
                  className="w-full h-[70vh] mt-4 border-2 border-gray-200 rounded-lg shadow-lg bg-white"
                  title="External Link"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
              </div>
            )}

            {/* Enhanced IMAGE VIEWER */}
            {material.materialType === "IMAGE" && (
              <motion.div
                className="p-8 bg-gradient-to-br from-gray-50 to-green-50/20 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="max-w-full max-h-[70vh] overflow-auto rounded-xl shadow-2xl bg-white p-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={getFileUrl()}
                    alt={material.title}
                    className="max-w-full h-auto rounded-lg"
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Enhanced TEXT VIEWER */}
            {material.materialType === "TEXT" && (
              <motion.div
                className="p-8 bg-gradient-to-br from-gray-50 to-indigo-50/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="prose prose-lg max-w-none bg-white p-8 rounded-xl shadow-lg border border-gray-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="text-gray-800 leading-relaxed">
                    <pre className="whitespace-pre-wrap font-sans text-base">
                      {material.content || material.description || "No content available"}
                    </pre>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </motion.div>

          {/* Enhanced FOOTER */}
          <motion.div
            className="px-6 py-5 border-t flex justify-between bg-gradient-to-r from-gray-50 to-purple-50/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Type:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bg} bg-gradient-to-r ${typeInfo.color} text-white`}>
                {material.materialType}
              </span>
            </div>

            <div className="flex space-x-3">
              {(material.materialType === "VIDEO" ||
                material.materialType === "PDF" ||
                material.materialType === "IMAGE") && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      variant="secondary"
                      icon={Download}
                      className="shadow-sm hover:shadow-md transition-shadow"
                    >
                      Download
                    </Button>
                  </motion.div>
                )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    sendTotalTimeAndClose();
                    onClose();
                  }}
                  size="sm"
                  variant="primary"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                >
                  Close
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaterialViewer;
