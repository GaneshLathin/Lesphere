// Author: Gowtham B
// LearnSphere-Platform – AI-Driven Adaptive Learning and Exam Generator


// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Pages
import LandingPage from './components/pages/LandingPage'
import Login from './components/auth/Login'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import CertificateVerify from './components/certificate/CertificateVerify'

import Register from './components/auth/Register'
import StudentDashboard from './components/dashboard/StudentDashboard'
import InstructorDashboard from './components/dashboard/InstructorDashboard'
import AdminDashboard from './components/dashboard/AdminDashboard'
import AdminUsers from './components/dashboard/AdminUsers'
import AnalyticsDashboard from './components/dashboard/analytics/AnalyticsDashboard'
import CourseList from './components/course/CourseList'
import CourseDetail from './components/course/CourseDetail'
import CreateCourse from './components/course/CreateCourse'
import EditCourse from './components/course/EditCourse'
import EnrolledCourses from './components/student/EnrolledCourses'
import Profile from './components/profile/Profile'

// Quiz Pages
import QuizPlayPage from './components/quiz/QuizPlayPage'
import QuizIntro from './components/quiz/QuizIntro'

// Components
import PrivateRoute from './components/common/PrivateRoute'
import Navbar from './components/common/Navbar'

import ProgressTracker from './components/progress/ProgressTracker'
import LearningPath from './components/progress/LearningPath'

// Layout
import Footer from './components/layout/Footer'
import AboutPage from './components/pages/AboutPage'
import ContactPage from './components/pages/ContactPage'
import PrivacyPolicy from './components/pages/PrivacyPolicy'
import TermsOfService from './components/pages/TermsOfService'

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Don't show the main app navbar on the landing page, login, or register
  const hideNavbarRoutes = ['/', '/login', '/register', '/about', '/contact', '/privacy', '/terms']
  const shouldShowNavbar = isAuthenticated && !hideNavbarRoutes.includes(location.pathname)

  // Logic to hide footer on specific immersive/sensitive pages
  // - Quiz Play/Intro: prevent distraction during assessment
  // - Auth Pages: focused entry points
  // - Course Sub-pages (Detail, Create, Edit): maximizes workspace, avoids accidental exit
  // - Verification: clean, standalone proof page
  const hideFooterPrefixes = ['/quiz/play', '/quiz/intro', '/login', '/register', '/forgot-password', '/reset-password', '/verify']
  let shouldHideFooter = hideFooterPrefixes.some(prefix => location.pathname.startsWith(prefix))

  // Also hide on ALL course sub-pages (Create, Edit, Detail)
  // e.g. /courses/create, /courses/edit/1, /courses/1
  // But SHOW on the main list /courses
  if (!shouldHideFooter && location.pathname.startsWith('/courses/')) {
    shouldHideFooter = true
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {shouldShowNavbar && <Navbar />}

      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/forgot-password"
            element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/reset-password"
            element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />}
          />

          {/* Certificate Verification (Public) */}
          <Route path="/verify/:uid" element={<CertificateVerify />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {user?.role === 'STUDENT' && <StudentDashboard />}
                {user?.role === 'INSTRUCTOR' && <InstructorDashboard />}
                {user?.role === 'ADMIN' && <AdminDashboard />}
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/users"
            element={
              <PrivateRoute roles={['ADMIN']}>
                <AdminUsers />
              </PrivateRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses"
            element={<CourseList />}
          />

          <Route
            path="/courses/create"
            element={
              <PrivateRoute roles={['INSTRUCTOR']}>
                <CreateCourse />
              </PrivateRoute>
            }
          />

          <Route
            path="/courses/:id"
            element={<CourseDetail />}
          />

          <Route
            path="/courses/edit/:id"
            element={
              <PrivateRoute roles={['INSTRUCTOR']}>
                <EditCourse />
              </PrivateRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/my-courses"
            element={
              <PrivateRoute roles={['STUDENT']}>
                <EnrolledCourses />
              </PrivateRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <PrivateRoute roles={['STUDENT']}>
                <ProgressTracker />
              </PrivateRoute>
            }
          />

          <Route
            path="/learning-path"
            element={
              <PrivateRoute roles={['STUDENT']}>
                <LearningPath />
              </PrivateRoute>
            }
          />

          {/* Quiz play page (student full page, instructor view/read-only) */}
          <Route
            path="/quiz/play/:quizId"
            element={
              <PrivateRoute>
                <QuizPlayPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/quiz/intro/:quizId"
            element={
              <PrivateRoute>
                <QuizIntro />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {!shouldHideFooter && <Footer />}
    </div>
  )
}

export default App
