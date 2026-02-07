import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import {
  Menu,
  X,
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  Plus,
  ChevronDown,
  Settings,
  BarChart2
} from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Role-based navigation links
  const getNavLinks = () => {
    const baseLinks = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]

    let roleLinks = []
    if (user?.role === 'INSTRUCTOR') {
      roleLinks = [
        { name: 'My Courses', path: '/courses', icon: BookOpen },
        { name: 'Create Course', path: '/courses/create', icon: Plus },
      ]
    } else if (user?.role === 'STUDENT') {
      roleLinks = [
        { name: 'Browse Courses', path: '/courses', icon: BookOpen },
        { name: 'My Courses', path: '/my-courses', icon: BookOpen },
      ]
    } else {
      roleLinks = [
        { name: 'All Courses', path: '/courses', icon: BookOpen },
        { name: 'Users', path: '/dashboard/users', icon: User },
      ]
    }

    return [
      ...baseLinks,
      ...roleLinks,
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">LS</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LearnSphere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Profile Dropdown */}
            <div className="ml-4 pl-4 border-l border-gray-200 relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 group-hover:text-indigo-500 ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-lg shadow-indigo-500/10 border border-gray-100 py-2 transform opacity-100 scale-100 transition-all z-50 origin-top-right animate-fadeIn">
                  {/* Tooltip Arrow / Speech Bubble Connector */}
                  <div className="absolute -top-[6px] right-6 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45 z-0"></div>

                  {/* Content Container (z-10 to sit above arrow) */}
                  <div className="relative z-10 bg-white rounded-2xl overflow-hidden">

                    {/* Header: User Info */}
                    <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate font-medium mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50/80 hover:text-indigo-600 transition-all mx-2 rounded-xl group"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-white group-hover:text-indigo-600 transition-colors shadow-sm">
                          <Settings size={18} />
                        </div>
                        <span>Account Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50/80 transition-all mx-2 mt-1 rounded-xl text-left group"
                      >
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-white group-hover:text-red-600 transition-colors shadow-sm">
                          <LogOut size={18} />
                        </div>
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Profile Indicator (Simplified) */}
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {getInitials(user?.name)}
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 z-40">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 bg-indigo-50 rounded-xl mb-4">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-medium"
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              )
            })}

            <div className="pt-3 border-t border-gray-200 mt-2 space-y-2">
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={20} />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <LogOut size={20} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar