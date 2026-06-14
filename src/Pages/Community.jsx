"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  ChevronDown,
  Filter,
  Globe,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { getAllGroups } from "../lib/api"
import { useNavigate } from "react-router-dom"

// Brand colors
const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  accent: "#6699CC",
  background: "#F0F4F8",
  text: "#333333",
  white: "#FFFFFF",
}

// Community data with added properties
const communities = [

]

// Generate random avatars for community members
const generateAvatars = (count) => {
  return Array.from({ length: Math.min(count, 5) }, (_, i) => ({
    id: i,
    src: `/placeholder.svg?height=100&width=100&text=${i + 1}`,
    alt: `Member ${i + 1}`,
  }))
}

// Add avatars to communities
const communitiesWithAvatars = communities.map((community) => ({
  ...community,
  avatars: generateAvatars(community.members),
}))

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [filterOpen, setFilterOpen] = useState(null) // null = all, true = open only, false = closed only
  const [visibleCommunities, setVisibleCommunities] = useState(communitiesWithAvatars)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // const navigate = useNavigate()

  const categories = ["All", ...Array.from(new Set(communities.map((community) => community.category)))]

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter communities based on search, category, and open/closed status
  useEffect(() => {

    const loadCommunities = async()=>{

    const response = await getAllGroups()
    let filtered = response.groups
    console.log(response)


    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (community) =>
          community.name.toLowerCase().includes(query) ||
          community.description.toLowerCase().includes(query)
          // community.topics.some((topic) => topic.toLowerCase().includes(query)),
      )
      console.log(searchQuery)
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((community) => community.category === selectedCategory)
    }

    if (filterOpen !== null) {
      filtered = filtered.filter((community) => community.isOpen === filterOpen)
    }
    setVisibleCommunities(filtered)
  }
  loadCommunities()

  }, [searchQuery, selectedCategory, filterOpen])

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ backgroundColor: brandColors.background }}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-block mb-3 rounded-full px-4 py-1 text-sm font-medium"
            style={{ backgroundColor: `${brandColors.accent}30`, color: brandColors.primary }}
          >
            Connect & Collaborate
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandColors.primary }}>
            STEAM Communities
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: brandColors.secondary }}>
            Join specialized groups to discuss, learn, and collaborate with peers in your field
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-10 bg-white rounded-2xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full md:w-1/2">
              <div
                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                style={{ color: brandColors.secondary }}
              >
                <Search size={18} />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                placeholder="Search communities, topics, or discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderColor: `${brandColors.secondary}30`,
                  backgroundColor: brandColors.white,
                  boxShadow: `0 0 0 2px ${brandColors.accent}00`,
                }}
              />
            </div>

            {/* Filter Toggle */}
           

            {/* Results Count */}
            {/* <div className="ml-auto text-sm" style={{ color: brandColors.secondary }}>
              Showing <span className="font-semibold">{visibleCommunities.length}</span> of{" "}
              <span className="font-semibold">{communities.length}</span> communities
            </div> */}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="pt-4 mt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4"
                  style={{ borderColor: `${brandColors.secondary}20` }}
                >
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.secondary }}>
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className="px-3 py-1 rounded-full text-sm transition-all"
                          style={{
                            backgroundColor:
                              selectedCategory === category ? brandColors.primary : `${brandColors.secondary}10`,
                            color: selectedCategory === category ? brandColors.white : brandColors.secondary,
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Access Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: brandColors.secondary }}>
                      Access Type
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFilterOpen(null)}
                        className="px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-all"
                        style={{
                          backgroundColor: filterOpen === null ? brandColors.primary : `${brandColors.secondary}10`,
                          color: filterOpen === null ? brandColors.white : brandColors.secondary,
                        }}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterOpen(true)}
                        className="px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-all"
                        style={{
                          backgroundColor: filterOpen === true ? brandColors.primary : `${brandColors.secondary}10`,
                          color: filterOpen === true ? brandColors.white : brandColors.secondary,
                        }}
                      >
                        <Globe size={14} /> Open
                      </button>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-all"
                        style={{
                          backgroundColor: filterOpen === false ? brandColors.primary : `${brandColors.secondary}10`,
                          color: filterOpen === false ? brandColors.white : brandColors.secondary,
                        }}
                      >
                        <Lock size={14} /> Closed
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

   

        {/* All Communities */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: brandColors.primary }}>
              {searchQuery ? "Search Results" : "All Communities"}
            </h2>

            {/* Create Community Button */}
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: brandColors.accent, color: brandColors.white }}
            >
              <Plus size={16} />
              Create Community
            </motion.button> */}
          </div>

          {visibleCommunities.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl p-8 text-center"
            >
              <div
                className="mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColors.accent}20` }}
              >
                <Search size={24} style={{ color: brandColors.accent }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.primary }}>
                No communities found
              </h3>
              <p style={{ color: brandColors.secondary }}>Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {isLoading
                ? // Skeleton loaders for communities
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden h-80 animate-pulse">
                      <div className="h-40 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))
                : visibleCommunities.map((community) => <CommunityCard key={community.id} community={community} />)}
            </motion.div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 p-8 md:p-12 rounded-2xl text-center relative overflow-hidden"
          style={{ backgroundColor: brandColors.primary }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-40 h-40 rounded-full"
              style={{ backgroundColor: brandColors.accent, filter: "blur(60px)" }}
            ></div>
            <div
              className="absolute bottom-0 right-0 w-60 h-60 rounded-full"
              style={{ backgroundColor: brandColors.secondary, filter: "blur(80px)" }}
            ></div>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${brandColors.white}20` }}
            >
              <Users size={28} color={brandColors.white} />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the STEM Community</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Connect with like-minded individuals, share knowledge, and collaborate on projects. Our communities are
              the perfect place to grow your network and expertise.
            </p>

            <motion.button
              className="px-6 py-3 rounded-xl font-medium transition-all"
              whileHover={{ scale: 1.05, backgroundColor: brandColors.white, color: brandColors.primary }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: brandColors.accent,
                color: brandColors.white,
              }}
            >
              Explore All Communities
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Featured Community Card Component


// Regular Community Card Component
function CommunityCard({ community }) {
  const navigate = useNavigate()
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -8, boxShadow: "0 15px 30px -10px rgba(0, 51, 102, 0.15)" }}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 flex flex-col h-full"
      style={{ border: `1px solid ${brandColors.accent}10` }}
    >
      <div className="relative h-40 overflow-hidden">
        {community.trending && (
          <div
            className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
            style={{ backgroundColor: "#EC4899", color: brandColors.white }}
          >
            <TrendingUp size={10} />
            Trending
          </div>
        )}
        <img
          src={community.image || "/placeholder.svg"}
          alt={community.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex justify-between items-center">
            <span
              className="text-xs font-semibold text-white px-2 py-1 rounded-full"
              style={{ backgroundColor: brandColors.accent }}
            >
              {community.category}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white">
              {community.isOpen ? <Globe size={10} /> : <Lock size={10} />}
              {community.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="text-lg font-bold mb-2" style={{ color: brandColors.primary }}>
            {community.name}
          </h3>
          <p className="text-sm mb-4 line-clamp-2" style={{ color: brandColors.text }}>
            {community.description}
          </p>

          <div className="flex items-center gap-2 mb-4">
            
            <span className="text-xs font-medium" style={{ color: brandColors.secondary }}>
              {community.members.length} members
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: brandColors.accent,
              color: brandColors.white,
            }}
            onClick={()=>{navigate("/channel-page",{state:community.name});localStorage.setItem("channelId",community._id)}}
          >
            Join Now
          </button>
         
        </div>
      </div>
    </motion.div>
  )
}

