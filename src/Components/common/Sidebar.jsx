"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Activity, BookOpen, ChevronRight, Cpu, FileText, HelpCircle, Home, Menu, Users,Calendar, LayoutList, Compass } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import { use } from "react"

// Brand colors with additional shades for consistency
const brandColors = {
  primary: "#003366",
  primaryLight: "#004080",
  secondary: "#336699",
  secondaryLight: "#4080BF",
  accent: "#6699CC",
  accentLight: "#85B8E5",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
  gray: "#E5E7EB"
}

// Grouped into tiers: Tracks is the primary, recommended way to use the app.
// "Browse Everything" is the escape hatch for unfiltered, all-subject views.
// Account groups billing/scheduling utilities at the bottom.
const SIDEBAR_GROUPS = [
  {
    label: null,
    items: [
      { name: "Dashboard", icon: Home, href: "/overview" },
      { name: "My Tracks", icon: Compass, href: "/tracks" },
    ],
  },
  {
    label: "Browse Everything",
    items: [
      { name: "Programs", icon: FileText, href: "/programs" },
      { name: "Learning Hub", icon: BookOpen, href: "/learning-management" },
      { name: "Assessments", icon: Activity, href: "/assessment-management" },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Marketplace", icon: FileText, href: "/marketplace" },
      { name: "Invoice", icon: LayoutList, href: "/invoice-page" },
      { name: "Calendar", icon: Calendar, href: "/calendar-page" },
    ],
  },
]

const SIDEBAR_ITEMS = SIDEBAR_GROUPS.flatMap((group) => group.items)

// Mock user data - in a real app this would come from auth context or API


const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState({})
  // Labeled groups (Browse Everything, Account) start collapsed — Tracks is the
  // primary path. Remembered per-browser so it doesn't re-collapse every visit.
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sidebarCollapsedGroups') || 'null')
      return saved || { 'Browse Everything': true, 'Account': true }
    } catch {
      return { 'Browse Everything': true, 'Account': true }
    }
  })

  const toggleGroup = (label) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] }
      localStorage.setItem('sidebarCollapsedGroups', JSON.stringify(next))
      return next
    })
  }
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  // Responsive handling
  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = window.innerWidth < 1024
      setIsMobile(mobileCheck)
      if (mobileCheck) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-expand parent items based on current route
  useEffect(() => {
    const newExpandedItems = {}
    SIDEBAR_ITEMS.forEach((item) => {
      if (item.subItems && item.subItems.some(subItem => 
        location.pathname.startsWith(subItem.href)
      )) {
        newExpandedItems[item.name] = true
      }
    })
    setExpandedItems(newExpandedItems)
  }, [location])

  const toggleItemExpand = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }))
  }

  const isItemActive = (href, exact = false) => {
    return exact 
      ? location.pathname === href
      : location.pathname.startsWith(href)
  }
  
  useEffect(()=>{

    
  })
  const showDetails = () => {
    if (!localStorage.getItem("token")) return 0
    // Supabase JWTs use `sub` for user id — profile fields live in the users table,
    // stored in localStorage by loginUser under the "user" key.
    const profile = JSON.parse(localStorage.getItem("user") || "{}")
    const firstName = profile.first_name || profile.firstName || ""
    const lastName = profile.last_name || profile.lastName || ""
    return {
      name: `${firstName} ${lastName}`.trim() || "User",
      role: profile.category || profile.role || "",
      avatarUrl: null,
      initials: `${firstName[0] || ""}${lastName[0] || ""}`.trim() || "U",
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className="fixed lg:relative z-30 h-full flex-shrink-0"
        animate={{
          width: isSidebarOpen ? "280px" : "80px",
          x: isMobile && !isSidebarOpen ? "-100%" : 0
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          backgroundColor: brandColors.primary,
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 pb-4 border-b"
            style={{ borderColor: brandColors.secondary }}
          >
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: brandColors.accent }}
                  >
                    <Home size={18} color={brandColors.white} />
                  </div>
                  <span className="text-xl font-bold text-white">
                    Gifted
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-opacity-20 hover:bg-white transition-all"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={24} color={brandColors.white} />
            </button>
          </div>

          {/* Profile Section - NEW */}
          <div className="px-4 py-3 border-b" style={{ borderColor: brandColors.secondary }}>
            <Link to="/profile">
              <motion.div 
                className={`flex items-center p-2 rounded-lg transition-colors ${isItemActive('/profile') ? 'bg-white bg-opacity-10' : 'hover:bg-white hover:bg-opacity-5'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Avatar/Initial Circle */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: showDetails().avatarUrl ? 'transparent' : brandColors.accent,
                    border: `2px solid ${brandColors.accentLight}`
                  }}
                  onClick={()=>{window.location.reload()}}
                >
                  {showDetails().avatarUrl ? (
                    <img 
                      src={showDetails().avatarUrl} 
                      alt={showDetails().name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">{showDetails().initials}</span>
                  )}
                </div>
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.div
                      className="ml-3 overflow-hidden"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <span className="block text-white font-medium">{showDetails().name}</span>
                      <span className="block text-xs text-white text-opacity-70">{showDetails().role}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.div
                      className="ml-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ChevronRight size={18} color={brandColors.accentLight} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
            {SIDEBAR_GROUPS.map((group, groupIndex) => {
              const hasActiveItem = group.items.some((item) => isItemActive(item.href))
              const isCollapsed = group.label && !!collapsedGroups[group.label] && !hasActiveItem
              return (
            <div key={group.label || `group-${groupIndex}`} className={groupIndex > 0 ? "mt-4 pt-4 border-t" : ""} style={groupIndex > 0 ? { borderColor: brandColors.secondary } : undefined}>
              {group.label && isSidebarOpen && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 mb-1 py-1 rounded hover:bg-white hover:bg-opacity-5 transition-colors"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: brandColors.accentLight }}>
                    {group.label}
                  </span>
                  <ChevronRight size={14} className={`transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} color={brandColors.accentLight} />
                </button>
              )}
              {(!group.label || !isCollapsed || !isSidebarOpen) && (
              <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>
                    <motion.div
                      className={`flex items-center p-3 rounded-lg transition-colors ${isItemActive(item.href) ? 'bg-white bg-opacity-10' : 'hover:bg-white hover:bg-opacity-5'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-md ${isItemActive(item.href) ? 'bg-accent' : 'bg-white bg-opacity-10'}`}>
                        <item.icon 
                          size={20} 
                          color={isItemActive(item.href) ? brandColors.white : brandColors.accentLight} 
                        />
                      </div>
                      
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.div
                            className="flex items-center justify-between flex-1 ml-3 overflow-hidden"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                          >
                            <span className="text-white font-medium">
                              {item.name}
                            </span>
                            {item.subItems && (
                              <ChevronRight
                                size={18}
                                className={`transition-transform duration-200 ${expandedItems[item.name] ? 'rotate-90' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleItemExpand(item.name)
                                }}
                                color={brandColors.accentLight}
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>

                  {/* Sub-items */}
                  <AnimatePresence>
                    {isSidebarOpen && item.subItems && expandedItems[item.name] && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-12 pl-2 mt-1 space-y-1"
                      >
                        {item.subItems.map((subItem) => (
                          <li key={subItem.href}>
                            <Link to={subItem.href}>
                              <motion.div
                                className={`py-2 px-3 rounded-md text-sm transition-colors ${isItemActive(subItem.href, true) ? 'text-accent font-medium' : 'text-white text-opacity-80 hover:text-opacity-100'}`}
                                whileHover={{ x: 4 }}
                              >
                                {subItem.name}
                              </motion.div>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              ))}
              </ul>
              )}
            </div>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t"
            style={{ borderColor: brandColors.secondary }}
          >
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="text-xs text-white text-opacity-60">
                    v2.4.1
                  </div>
                  <button
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: brandColors.secondary,
                      color: brandColors.white,
                      ":hover": {
                        backgroundColor: brandColors.secondaryLight
                      }
                    }}
                  >
                    <HelpCircle size={16} />
                    <span>Help Center</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile toggle button (floating) */}
      {isMobile && !isSidebarOpen && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed z-20 bottom-6 left-6 p-3 rounded-full shadow-lg flex items-center justify-center"
          style={{
            backgroundColor: brandColors.primary,
            boxShadow: `0 4px 12px ${brandColors.primary}40`
          }}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} color={brandColors.white} />
        </motion.button>
      )}
    </>
  )
}

export default Sidebar