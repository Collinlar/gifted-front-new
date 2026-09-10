// Shrink a picture in the browser before it is uploaded.
//
// Cover photos come off a phone camera at three to eight megabytes. Sending
// that over a Ghanaian mobile connection is slow enough to look broken, and a
// size limit that rejects it just moves the failure earlier without helping
// anyone. Resizing first means the file that leaves the device is a couple of
// hundred kilobytes and the limit is never reached.
//
// Anything the browser cannot decode, an iPhone HEIC being the usual one, is
// passed through untouched rather than failing. The bucket accepts it and the
// picture still arrives.

const MAX_BYTES = 9 * 1024 * 1024   // just under the bucket's own 10MB ceiling

export async function shrinkImage(file, { maxDimension = 1600, quality = 0.85, preferJpeg = false } = {}) {
  if (!file?.type?.startsWith('image/')) return file
  // A GIF loses its animation through a canvas, and an SVG has no pixel size
  // worth reducing, so neither is touched.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file   // undecodable here, let the server keep the original
  }

  const { width, height } = bitmap
  const scale = Math.min(1, maxDimension / Math.max(width, height))

  // Already small enough, and small in bytes, so there is nothing to gain
  if (scale === 1 && file.size <= 600 * 1024) {
    bitmap.close?.()
    return file
  }

  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) { bitmap.close?.(); return file }

  // A photograph saved as PNG is enormous for no benefit. Covers are always
  // re-encoded as JPEG because a banner never needs transparency, and a 39MB
  // phone photo only came down to 5.8MB while it stayed a PNG. Avatars keep
  // their format: people upload logos and QR codes as their picture, and those
  // do need the transparency and the sharp edges.
  const asJpeg = preferJpeg || file.type !== 'image/png'
  if (asJpeg) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, h)
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const type = asJpeg ? 'image/jpeg' : 'image/png'
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, type, asJpeg ? quality : undefined)
  )
  if (!blob) return file

  // Only keep the new one if it actually helped
  if (blob.size >= file.size && file.size <= MAX_BYTES) return file

  const base = (file.name || 'image').replace(/\.[^.]+$/, '')
  return new File([blob], `${base}.${asJpeg ? 'jpg' : 'png'}`, { type })
}
