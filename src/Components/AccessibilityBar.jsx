"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

const BAR_CONTAINER_ID = "global-accessibility-bar-root"
const POS_KEY = "ACCESS_BAR_POSITION"
const COLLAPSE_KEY = "ACCESS_BAR_COLLAPSED"

const brandColors = {
	primary: "#003366",
	white: "#FFFFFF",
}

function getAppContainer() {
	return (
		document.querySelector("#root") ||
		document.querySelector("#app") ||
		document.body
	)
}

function applyZoomToApp(zoom) {
	const container = getAppContainer()
	if (!container) return
	if (zoom === 1) {
		container.style.transform = ""
		container.style.transformOrigin = ""
		container.style.width = ""
		return
	}
	container.style.transform = `scale(${zoom})`
	container.style.transformOrigin = "top left"
	container.style.width = `${100 / zoom}%`
}

const AccessibilityBarUI = () => {
	const speechSupported = useMemo(() => {
		return (
			typeof window !== "undefined" &&
			"speechSynthesis" in window &&
			"SpeechSynthesisUtterance" in window
		)
	}, [])

	const [zoom, setZoom] = useState(1)
	const [isPaused, setIsPaused] = useState(false)
	const [isReading, setIsReading] = useState(false)
	const [rate, setRate] = useState(1)
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [position, setPosition] = useState(null) // { x, y } in px for fixed container
	const containerRef = useRef(null)
	const isDraggingRef = useRef(false)
	const dragOffsetRef = useRef({ x: 0, y: 0 })
	const pointerIdRef = useRef(null)
	const dragStartClientRef = useRef({ x: 0, y: 0 })
	const draggedRef = useRef(false)
	const clickSuppressRef = useRef(false)

	// Load persisted UI state
	useEffect(() => {
		try {
			const savedCollapsed = localStorage.getItem(COLLAPSE_KEY)
			if (savedCollapsed != null) setIsCollapsed(savedCollapsed === "1")
			const savedPos = localStorage.getItem(POS_KEY)
			if (savedPos) {
				const parsed = JSON.parse(savedPos)
				if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
					setPosition(parsed)
				}
			}
		} catch {}
	}, [])

	useEffect(() => {
		applyZoomToApp(zoom)
	}, [zoom])

	useEffect(() => {
		window.__ACCESS_BAR_INSTALLED = true
		const onKeyDown = (e) => {
			if (!(e.ctrlKey && e.altKey)) return
			const key = e.key
			if (key === "=" || key === "+") {
				e.preventDefault()
				setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))
			}
			if (key === "-") {
				e.preventDefault()
				setZoom((z) => Math.max(0.75, Math.round((z - 0.1) * 10) / 10))
			}
			if (key === "0") {
				e.preventDefault()
				setZoom(1)
			}
			if (key.toLowerCase() === "r") {
				e.preventDefault()
				startReading()
			}
			if (key.toLowerCase() === "p") {
				e.preventDefault()
				pauseResume()
			}
			if (key.toLowerCase() === "s") {
				e.preventDefault()
				stopReading()
			}
		}
		window.addEventListener("keydown", onKeyDown)
		return () => {
			window.removeEventListener("keydown", onKeyDown)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Reserve top padding only when docked at top-center and expanded
	useEffect(() => {
		const app = getAppContainer()
		if (!app) return
		const shouldReserve = !position && !isCollapsed
		app.style.paddingTop = shouldReserve ? "72px" : ""
	}, [position, isCollapsed])

	function persistPosition(pos) {
		try { localStorage.setItem(POS_KEY, JSON.stringify(pos)) } catch {}
	}

	function persistCollapsed(collapsed) {
		try { localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0") } catch {}
	}

	function splitTextIntoChunks(text) {
		const normalized = text.replace(/\s+/g, " ").trim()
		if (!normalized) return []
		const sentences = normalized.split(/([.!?]\s+)/)
		const chunks = []
		let buffer = ""
		for (let i = 0; i < sentences.length; i++) {
			const part = sentences[i]
			if (!part) continue
			if ((buffer + part).length > 1600) {
				if (buffer) chunks.push(buffer)
				buffer = part
			} else {
				buffer += part
			}
		}
		if (buffer) chunks.push(buffer)
		return chunks
	}

	function cancelSpeech() {
		try {
			window.speechSynthesis.cancel()
		} catch {}
		setIsReading(false)
		setIsPaused(false)
	}

	function startReading() {
		if (!speechSupported) return
		const sel = window.getSelection()?.toString() || ""
		const baseText = sel || document.body.innerText || ""
		if (!baseText) return
		cancelSpeech()
		const queue = splitTextIntoChunks(baseText).map(
			(t) => new window.SpeechSynthesisUtterance(t)
		)
		let idx = 0
		const speakNext = () => {
			if (idx >= queue.length) {
				setIsReading(false)
				setIsPaused(false)
				return
			}
			const u = queue[idx]
			u.rate = rate
			u.onend = () => {
				idx += 1
				speakNext()
			}
			u.onerror = () => {
				setIsReading(false)
				setIsPaused(false)
			}
			window.speechSynthesis.speak(u)
		}
		if (window.speechSynthesis.paused) {
			try { window.speechSynthesis.resume() } catch {}
		}
		setIsReading(true)
		setIsPaused(false)
		speakNext()
	}

	function pauseResume() {
		if (!speechSupported) return
		if (!isReading && !isPaused) return
		if (isPaused) {
			try { window.speechSynthesis.resume() } catch {}
			setIsPaused(false)
			setIsReading(true)
		} else {
			try { window.speechSynthesis.pause() } catch {}
			setIsPaused(true)
		}
	}

	function stopReading() {
		if (!speechSupported) return
		cancelSpeech()
	}

	function getClampedPosition(rawX, rawY) {
		const el = containerRef.current
		const w = el ? el.offsetWidth : 360
		const h = el ? el.offsetHeight : 80
		const padding = 8
		const maxX = Math.max(padding, window.innerWidth - w - padding)
		const maxY = Math.max(padding, window.innerHeight - h - padding)
		const x = Math.min(Math.max(padding, rawX), maxX)
		const y = Math.min(Math.max(padding, rawY), maxY)
		return { x, y }
	}

	function beginDrag(clientX, clientY) {
		const rect = containerRef.current?.getBoundingClientRect()
		const startX = rect ? rect.left : (position ? position.x : window.innerWidth / 2)
		const startY = rect ? rect.top : (position ? position.y : 8)
		isDraggingRef.current = true
		dragOffsetRef.current = { x: clientX - startX, y: clientY - startY }
		dragStartClientRef.current = { x: clientX, y: clientY }
		draggedRef.current = false
	}

	function onDragMove(clientX, clientY) {
		if (!isDraggingRef.current) return
		const { x: dx, y: dy } = dragOffsetRef.current
		const pos = getClampedPosition(clientX - dx, clientY - dy)
		setPosition(pos)
	}

	function endDrag() {
		if (!isDraggingRef.current) return
		isDraggingRef.current = false
		// Persist final on-screen position from bounding rect
		const rect = containerRef.current?.getBoundingClientRect()
		if (rect) {
			const pos = getClampedPosition(rect.left, rect.top)
			setPosition(pos)
			persistPosition(pos)
		} else if (position) {
			persistPosition(position)
		}
	}

	function isInteractive(target) {
		if (!target) return false
		const el = target.closest('button, input, select, textarea, [contenteditable="true"], [role="slider"], [data-no-drag]')
		return !!el
	}

	function onPointerDownHandle(e) {
		// Left click or primary pointer only
		if (e.button !== undefined && e.button !== 0) return
		if (isInteractive(e.target)) return
		e.preventDefault()
		pointerIdRef.current = e.pointerId
		beginDrag(e.clientX, e.clientY)
		try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
	}

	function onPointerMoveHandle(e) {
		if (!isDraggingRef.current) return
		if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return
		const dx = e.clientX - dragStartClientRef.current.x
		const dy = e.clientY - dragStartClientRef.current.y
		if (!draggedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
			draggedRef.current = true
		}
		onDragMove(e.clientX, e.clientY)
	}

	function onPointerUpHandle(e) {
		if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return
		try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
		pointerIdRef.current = null
		endDrag()
	}

	// Collapsed pill handlers (pointer)
	function onPointerDownCollapsed(e) {
		if (e.button !== undefined && e.button !== 0) return
		pointerIdRef.current = e.pointerId
		beginDrag(e.clientX, e.clientY)
		try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
	}
	function onPointerMoveCollapsed(e) {
		if (!isDraggingRef.current) return
		if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return
		const dx = e.clientX - dragStartClientRef.current.x
		const dy = e.clientY - dragStartClientRef.current.y
		if (!draggedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
			draggedRef.current = true
		}
		onDragMove(e.clientX, e.clientY)
	}
	function onPointerUpCollapsed(e) {
		if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return
		try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
		pointerIdRef.current = null
		if (draggedRef.current) {
			clickSuppressRef.current = true
			endDrag()
		} else {
			setIsCollapsed(false)
			persistCollapsed(false)
		}
	}

	function onMouseMove(e) {
		onDragMove(e.clientX, e.clientY)
	}

	function onMouseUp() {
		window.removeEventListener("mousemove", onMouseMove)
		window.removeEventListener("mouseup", onMouseUp)
		endDrag()
	}

	// Legacy mouse/touch fallback (in case Pointer Events are not supported)
	function onMouseDownAny(e) {
		if (e.button !== 0) return
		if (isInteractive(e.target)) return
		e.preventDefault()
		beginDrag(e.clientX, e.clientY)
		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)
	}
	function onMouseMove(e) { onDragMove(e.clientX, e.clientY) }
	function onMouseUp() {
		window.removeEventListener("mousemove", onMouseMove)
		window.removeEventListener("mouseup", onMouseUp)
		endDrag()
	}
	// Collapsed pill mouse/touch fallback
	function onMouseDownCollapsed(e) {
		if (e.button !== 0) return
		beginDrag(e.clientX, e.clientY)
		window.addEventListener("mousemove", onMouseMoveCollapsed)
		window.addEventListener("mouseup", onMouseUpCollapsed)
	}
	function onMouseMoveCollapsed(e) {
		const dx = e.clientX - dragStartClientRef.current.x
		const dy = e.clientY - dragStartClientRef.current.y
		if (!draggedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
			draggedRef.current = true
		}
		onDragMove(e.clientX, e.clientY)
	}
	function onMouseUpCollapsed() {
		window.removeEventListener("mousemove", onMouseMoveCollapsed)
		window.removeEventListener("mouseup", onMouseUpCollapsed)
		if (draggedRef.current) {
			clickSuppressRef.current = true
			endDrag()
		} else {
			setIsCollapsed(false)
			persistCollapsed(false)
		}
	}
	function onTouchStartAny(e) {
		if (isInteractive(e.target)) return
		const t = e.touches[0]
		e.preventDefault()
		beginDrag(t.clientX, t.clientY)
		window.addEventListener("touchmove", onTouchMove, { passive: false })
		window.addEventListener("touchend", onTouchEnd)
	}
	function onTouchMove(e) {
		e.preventDefault()
		const t = e.touches[0]
		onDragMove(t.clientX, t.clientY)
	}
	function onTouchEnd() {
		window.removeEventListener("touchmove", onTouchMove)
		window.removeEventListener("touchend", onTouchEnd)
		endDrag()
	}

	function onTouchStartCollapsed(e) {
		const t = e.touches[0]
		beginDrag(t.clientX, t.clientY)
		window.addEventListener("touchmove", onTouchMoveCollapsed, { passive: false })
		window.addEventListener("touchend", onTouchEndCollapsed)
	}
	function onTouchMoveCollapsed(e) {
		e.preventDefault()
		const t = e.touches[0]
		const dx = t.clientX - dragStartClientRef.current.x
		const dy = t.clientY - dragStartClientRef.current.y
		if (!draggedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
			draggedRef.current = true
		}
		onDragMove(t.clientX, t.clientY)
	}
	function onTouchEndCollapsed() {
		window.removeEventListener("touchmove", onTouchMoveCollapsed)
		window.removeEventListener("touchend", onTouchEndCollapsed)
		if (draggedRef.current) {
			clickSuppressRef.current = true
			endDrag()
		} else {
			setIsCollapsed(false)
			persistCollapsed(false)
		}
	}

	function handleCollapsedClick(e) {
		if (clickSuppressRef.current) {
			e.preventDefault()
			e.stopPropagation()
			clickSuppressRef.current = false
			return
		}
		setIsCollapsed(false)
		persistCollapsed(false)
	}

	const positionedStyle = position
		? { top: `${position.y}px`, left: `${position.x}px` }
		: { top: 8, left: "50%", transform: "translateX(-50%)" }

	return (
		<div
			ref={containerRef}
			className="fixed z-50"
			style={positionedStyle}
			role="region"
			aria-label="Accessibility toolbar"
		>
			{isCollapsed ? (
				<button
					type="button"
					onPointerDown={onPointerDownCollapsed}
					onPointerMove={onPointerMoveCollapsed}
					onPointerUp={onPointerUpCollapsed}
					onMouseDown={onMouseDownCollapsed}
					onTouchStart={onTouchStartCollapsed}
					onClick={handleCollapsedClick}
					className="px-3 py-2 rounded-full text-sm font-medium shadow-lg border bg-white select-none"
					aria-label="Show or drag accessibility toolbar"
					style={{ borderColor: brandColors.primary, color: brandColors.primary, cursor: "move", touchAction: "none" }}
				>
					Accessibility
				</button>
			) : (
				<div
					className="bg-white rounded-xl shadow-2xl p-3 md:p-4 border border-gray-200 select-none"
					style={{ touchAction: "none" }}
				>
					<div
						className="flex items-center justify-between mb-2"
						style={{ cursor: "move", touchAction: "none" }}
						onPointerDown={onPointerDownHandle}
						onPointerMove={onPointerMoveHandle}
						onPointerUp={onPointerUpHandle}
						onMouseDown={onMouseDownAny}
						onTouchStart={onTouchStartAny}
					>
						<span className="text-xs text-gray-500">Drag to move</span>
						<button
							type="button"
							onClick={() => { const v = !isCollapsed; setIsCollapsed(v); persistCollapsed(v) }}
							className="px-2 py-1 rounded-md text-xs font-medium border hover:bg-gray-50"
							aria-label="Hide accessibility toolbar"
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							Hide
						</button>
					</div>
					<div className="flex items-center gap-2 md:gap-3">
						<button
							type="button"
							onClick={startReading}
							className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-gray-50"
							aria-label="Read selected text or page"
							title="Read selection/page (Ctrl+Alt+R)"
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							Read
						</button>
						<button
							type="button"
							onClick={pauseResume}
							disabled={!speechSupported || (!isReading && !isPaused)}
							className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-gray-50 disabled:opacity-50"
							aria-label={isPaused ? 'Resume reading' : 'Pause reading'}
							title={isPaused ? 'Resume (Ctrl+Alt+P)' : 'Pause (Ctrl+Alt+P)'}
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							{isPaused ? 'Resume' : 'Pause'}
						</button>
						<button
							type="button"
							onClick={stopReading}
							disabled={!speechSupported || (!isReading && !isPaused)}
							className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-gray-50 disabled:opacity-50"
							aria-label="Stop reading"
							title="Stop (Ctrl+Alt+S)"
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							Stop
						</button>
						<div className="w-px h-6 bg-gray-200 mx-1" aria-hidden="true"></div>
						<button
							type="button"
							onClick={() => setZoom((z) => Math.max(0.75, Math.round((z - 0.1) * 10) / 10))}
							className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-gray-50"
							aria-label="Zoom out"
							title="Zoom out (Ctrl+Alt+-)"
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							A-
						</button>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min="75"
								max="200"
								step="5"
								value={Math.round(zoom * 100)}
								onChange={(e) => setZoom(Math.max(0.75, Math.min(2, Number(e.target.value) / 100)))}
								aria-label="Zoom level"
							/>
							<span className="text-sm w-12 text-right" aria-live="polite">{Math.round(zoom * 100)}%</span>
						</div>
						<button
							type="button"
							onClick={() => setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))}
							className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-gray-50"
							aria-label="Zoom in"
							title="Zoom in (Ctrl+Alt+=)"
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							A+
						</button>
						<button
							type="button"
							onClick={() => setZoom(1)}
							className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-gray-50"
							aria-label="Reset zoom"
							title="Reset zoom (Ctrl+Alt+0)"
							style={{ borderColor: brandColors.primary, color: brandColors.primary }}
						>
							100%
						</button>
					</div>
					<div className="mt-2">
						<label className="text-xs text-gray-600 mr-2">Rate</label>
						<input
							type="range"
							min="0.5"
							max="2"
							step="0.1"
							value={rate}
							onChange={(e) => setRate(Number(e.target.value))}
							aria-label="Speech rate"
							title="Speech rate"
						/>
					</div>
					{!speechSupported && (
						<p className="text-xs text-red-600 mt-2">Text-to-speech not supported in this browser.</p>
					)}
				</div>
			)}
		</div>
	)
}

export function ensureAccessibilityBar() {
	if (typeof window === "undefined") return
	if (window.__ACCESS_BAR_INSTALLED) return
	let container = document.getElementById(BAR_CONTAINER_ID)
	if (!container) {
		container = document.createElement("div")
		container.id = BAR_CONTAINER_ID
		document.body.appendChild(container)
	}
	const root = createRoot(container)
	root.render(<AccessibilityBarUI />)
}

export default AccessibilityBarUI


