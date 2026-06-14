"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, ExternalLink, Sparkles } from "lucide-react"

// Brand colors with additional shades
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
  gray: "#E5E7EB",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B"
}

const StatCard = ({
  name,
  icon: Icon,
  value,
  color = brandColors.accent,
  trend,
  description,
  isLoading = false,
  onClick,
  chartData = [4, 7, 5, 9, 6, 8, 7, 8, 9, 8, 7, 9],
  isNew = false,
  isHighlighted = false
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Determine trend direction and colors
  const trendDirection = trend ? (trend > 0 ? "up" : trend < 0 ? "down" : "neutral") : null
  const trendColor = trendDirection === "up" ? brandColors.success : 
                    trendDirection === "down" ? brandColors.error : 
                    brandColors.gray
  const TrendIcon = trendDirection === "up" ? ArrowUpRight : ArrowDownRight

  // Format trend value
  const formattedTrend = trend ? `${Math.abs(trend)}%` : null

  // Generate sparkline points
  const maxDataValue = Math.max(...chartData)
  const minDataValue = Math.min(...chartData)
  const range = maxDataValue - minDataValue
  const normalizedData = chartData.map((value) => ((value - minDataValue) / (range || 1)) * 40)

  // Create sparkline path
  const sparklinePoints = normalizedData
    .map((value, index) => `${(index / (normalizedData.length - 1)) * 100},${100 - value}`)
    .join(" ")

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ${
        isHighlighted ? "border-accent/50" : "border-gray-700"
      }`}
      style={{
        background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
        cursor: onClick ? "pointer" : "default"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        scale: 1.02,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Highlight border */}
      {isHighlighted && (
        <div className="absolute inset-0 rounded-xl border-2 border-accent/30 pointer-events-none" />
      )}

      {/* Gradient accent */}
      <div
        className="absolute top-0 left-0 h-1 w-full opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      {/* New badge */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-medium text-white shadow-md"
            style={{ backgroundColor: brandColors.accent }}
          >
            <Sparkles size={12} className="shrink-0" />
            <span>New</span>
          </motion.div>
        </div>
      )}

      <div className="relative px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-3 text-sm font-medium text-gray-200">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg backdrop-blur-sm"
              style={{ 
                backgroundColor: `${color}20`,
                boxShadow: `0 4px 6px ${color}10`
              }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            {name}
          </span>

          {onClick && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="rounded-full p-1 transition-colors hover:bg-white/10"
            >
              <ExternalLink size={16} className="text-gray-300 hover:text-white" />
            </motion.div>
          )}
        </div>

        {/* Value */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 h-9 w-32 animate-pulse rounded-md"
              style={{ backgroundColor: `${brandColors.secondary}80` }}
            />
          ) : (
            <motion.p
              key="value"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-3xl font-bold tracking-tight text-white"
            >
              {value}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Trend and description row */}
        <div className="mt-4 flex items-end justify-between">
          {/* Trend */}
          {trend !== undefined && !isLoading && (
            <div className="flex items-center gap-1">
              <motion.span
                className="flex items-center text-sm font-medium"
                style={{ color: trendColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <TrendIcon size={16} className="mr-1" />
                {formattedTrend}
              </motion.span>
              <span className="text-xs text-gray-400">vs last period</span>
            </div>
          )}

          {/* Description */}
          {description && !isLoading && (
            <motion.p
              className="text-right text-sm"
              style={{ color: brandColors.accentLight }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Sparkline chart */}
        {chartData && !isLoading && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.8 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Area fill */}
              <motion.path
                d={`M0,100 L${sparklinePoints} L100,100 Z`}
                fill={`${color}20`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              {/* Line */}
              <motion.path
                d={`M0,${100 - normalizedData[0]} L${sparklinePoints}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              />
              {/* Current value indicator */}
              {isHovered && (
                <circle
                  cx="100"
                  cy={100 - normalizedData[normalizedData.length - 1]}
                  r="3"
                  fill={color}
                  stroke={brandColors.white}
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard