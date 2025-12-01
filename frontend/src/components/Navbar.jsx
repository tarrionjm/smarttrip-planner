import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/images/logo.png'

const Navbar = () => {
  const navigate = useNavigate()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Placeholder user data (will be replaced with real auth data later)
  const user = {
    firstName: 'John',
    lastName: 'Doe'
  }

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    // TODO: Add actual logout logic with backend call
    console.log('Logging out')
    navigate('/')
  }
  
  // Adds black background to button when a navbar button is selected 
  const linkClass = ({isActive}) => 
                    isActive ? 'text-white bg-black border-4 border-black font-black uppercase rounded-md px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all' 
                  : 'text-white font-bold uppercase rounded-md px-3 py-2 hover:bg-black transition-all'
  
  return (
    <nav className="bg-indigo-900 border-b-4 border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <NavLink className="flex flex-shrink-0 items-center" to="/homepage">
            <img
              className="h-10 w-auto"
              src={logo}
              alt="SmartTrip Planner"
            />
            <span className="hidden sm:block text-white text-xl sm:text-2xl font-black uppercase ml-2"
              >SmarTrip Planner</span
            >
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink
              to="/homepage"
              className={linkClass}
              >Home
            </NavLink>
            <NavLink
              to="/upcoming-trips-page"
              className={linkClass}
              > Upcoming Trips
            </NavLink>
            <NavLink
              to="/past-trips"
              className={linkClass}
              >Past Trips
            </NavLink>

            {/* Profile Button with Dropdown - Desktop */}
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <FaUser className="text-indigo-900 text-xl" />
              </button>

              {/* Dropdown Card */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
                  <div className="p-4 border-b-4 border-black">
                    <p className="font-black text-lg uppercase">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        navigate('/profile')
                      }}
                      className="w-full text-left px-4 py-3 font-bold hover:bg-gray-100 border-2 border-transparent hover:border-black rounded transition-all flex items-center gap-2"
                    >
                      <FaUser /> View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-3 font-bold hover:bg-red-50 border-2 border-transparent hover:border-red-600 rounded transition-all flex items-center gap-2 text-red-600"
                    >
                      <FaSignOutAlt /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden w-12 h-12 bg-white border-4 border-black rounded flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            {showMobileMenu ? (
              <FaTimes className="text-indigo-900 text-xl" />
            ) : (
              <FaBars className="text-indigo-900 text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-indigo-800 border-t-4 border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="px-4 py-4 space-y-3">
            <NavLink
              to="/homepage"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-white bg-black border-4 border-black font-black uppercase rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'block text-white font-bold uppercase rounded-md px-4 py-3 hover:bg-black transition-all'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/upcoming-trips-page"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-white bg-black border-4 border-black font-black uppercase rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'block text-white font-bold uppercase rounded-md px-4 py-3 hover:bg-black transition-all'
              }
            >
              Upcoming Trips
            </NavLink>
            <NavLink
              to="/past-trips"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-white bg-black border-4 border-black font-black uppercase rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'block text-white font-bold uppercase rounded-md px-4 py-3 hover:bg-black transition-all'
              }
            >
              Past Trips
            </NavLink>

            {/* Mobile Profile Section */}
            <div className="pt-4 border-t-4 border-black space-y-3">
              <div className="px-4 py-2">
                <p className="font-black text-white uppercase text-sm">Signed in as</p>
                <p className="font-bold text-white text-lg">{user.firstName} {user.lastName}</p>
              </div>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  navigate('/profile')
                }}
                className="w-full text-left px-4 py-3 font-bold text-white hover:bg-indigo-900 rounded transition-all flex items-center gap-2"
              >
                <FaUser /> View Profile
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
                className="w-full text-left px-4 py-3 font-bold text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded transition-all flex items-center gap-2"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar