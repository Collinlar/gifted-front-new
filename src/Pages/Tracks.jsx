"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Plus, Compass, Trophy, BookOpen, ClipboardCheck, Tent } from "lucide-react"
import { getAllTracks, getUserTracks, setUserTracks, getTrackContent } from "../lib/api"
import { getTokenUserId } from "../lib/auth"

const brandColors = {
  primary: "#003366",
  secondary: "#336699",
  background: "#F0F4F8",
  border: "#E5E7EB",
}

const FALLBACK_COLORS = ["#336699", "#1D9E75", "#E8A020", "#185FA5", "#9333EA", "#DB2777", "#0EA5E9"]
const fallbackColorFor = (index) => FALLBACK_COLORS[index % FALLBACK_COLORS.length]

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white border p-6 animate-pulse" style={{ borderColor: brandColors.border }}>
    <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4" />
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
    <div className="h-3 bg-gray-100 rounded w-4/5" />
  </div>
)

const TrackCard = ({ track, color, isMine, isSaving, onOpen, onToggle, stats }) => {
  return (
    <div
      className="group rounded-2xl bg-white border overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col"
      style={{ borderColor: brandColors.border }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <div className="p-6 flex flex-col flex-1">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: `${color}1A` }}
        >
          {track.icon || <Compass size={22} style={{ color }} />}
        </div>

        <h3 className="text-lg font-semibold mb-1" style={{ color: brandColors.primary }}>{track.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {track.description || "Olympiads, competitions, camps, resources and assessments for this subject."}
        </p>

        {stats && (
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
            <span className="flex items-center gap-1"><Trophy size={13} /> {stats.competitions}</span>
            <span className="flex items-center gap-1"><Tent size={13} /> {stats.camps}</span>
            <span className="flex items-center gap-1"><BookOpen size={13} /> {stats.courses}</span>
            <span className="flex items-center gap-1"><ClipboardCheck size={13} /> {stats.exams}</span>
          </div>
        )}

        {isMine ? (
          <button
            onClick={onOpen}
            className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color }}
          >
            Open track <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : (
          <button
            disabled={isSaving}
            onClick={onToggle}
            className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
            style={{ borderColor: color, color }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${color}10` }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
          >
            <Plus size={15} /> Add to my tracks
          </button>
        )}
      </div>
    </div>
  )
}

const Tracks = () => {
  const navigate = useNavigate()
  const userId = getTokenUserId()

  const [allTracks, setAllTracks] = useState([])
  const [myTrackIds, setMyTrackIds] = useState([])
  const [statsByTrack, setStatsByTrack] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [tracksRes, userTracksRes] = await Promise.all([
          getAllTracks(),
          userId ? getUserTracks(userId) : Promise.resolve({ tracks: [] }),
        ])
        const tracks = tracksRes.tracks || []
        const myIds = (userTracksRes.tracks || []).map((t) => t.id)
        setAllTracks(tracks)
        setMyTrackIds(myIds)

        // Pull quick content counts only for the user's own tracks
        const myTracks = tracks.filter((t) => myIds.includes(t.id))
        const statResults = await Promise.all(myTracks.map((t) => getTrackContent(t.id).catch(() => null)))
        const nextStats = {}
        myTracks.forEach((t, i) => {
          const res = statResults[i]
          if (res) {
            nextStats[t.id] = {
              competitions: res.competitions.length,
              courses: res.courses.length,
              exams: res.exams.length,
              camps: res.camps.length,
            }
          }
        })
        setStatsByTrack(nextStats)
      } catch (error) {
        console.error("Error loading tracks:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const toggleTrack = async (trackId) => {
    if (!userId) return
    const updated = myTrackIds.includes(trackId)
      ? myTrackIds.filter((id) => id !== trackId)
      : [...myTrackIds, trackId]

    setMyTrackIds(updated)
    setIsSaving(true)
    try {
      await setUserTracks(userId, updated)
    } catch (error) {
      console.error("Error saving track selection:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const myTracks = useMemo(() => allTracks.filter((t) => myTrackIds.includes(t.id)), [allTracks, myTrackIds])
  const otherTracks = useMemo(() => allTracks.filter((t) => !myTrackIds.includes(t.id)), [allTracks, myTrackIds])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-10" style={{ backgroundColor: brandColors.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColors.secondary}1A` }}>
            <Compass size={20} style={{ color: brandColors.secondary }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: brandColors.primary }}>My Tracks</h1>
        </div>
        <p className="text-gray-600 mb-10 max-w-2xl">
          A track bundles every Olympiad, competition, camp, resource and assessment in one subject area, so you always know what to do next.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {myTracks.length > 0 && (
              <div className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 text-gray-400">Your Tracks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myTracks.map((track, i) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      color={track.color || fallbackColorFor(i)}
                      isMine
                      stats={statsByTrack[track.id]}
                      onOpen={() => navigate(`/track/${track.slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 text-gray-400">
                {myTracks.length > 0 ? "Explore Other Tracks" : "Choose Your Tracks"}
              </h2>
              {otherTracks.length === 0 ? (
                <div className="rounded-2xl bg-white border p-8 text-center" style={{ borderColor: brandColors.border }}>
                  <p className="text-gray-500">You've added every available track. Nice.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {otherTracks.map((track, i) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      color={track.color || fallbackColorFor(myTracks.length + i)}
                      isMine={false}
                      isSaving={isSaving}
                      onToggle={() => toggleTrack(track.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Tracks
