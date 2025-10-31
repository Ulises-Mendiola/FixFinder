const driveIdFromUrl = (url) => {
  const filePattern = /\/file\/d\/([^/]+)\//
  const openPattern = /open\?id=([^&]+)/
  const ucPattern = /uc\?id=([^&]+)/

  const fileMatch = url.match(filePattern)
  if (fileMatch) return fileMatch[1]

  const openMatch = url.match(openPattern)
  if (openMatch) return openMatch[1]

  const ucMatch = url.match(ucPattern)
  if (ucMatch) return ucMatch[1]

  return null
}

const resolveAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return url

  try {
    const trimmed = url.trim()
    if (trimmed.startsWith('https://drive.google.com')) {
      const id = driveIdFromUrl(trimmed)
      if (id) {
        return `https://drive.google.com/uc?export=view&id=${id}`
      }
      // If already uc?export=view we keep original
    }
    return trimmed
  } catch (error) {
    console.warn('resolveAvatarUrl error', error)
    return url
  }
}

export default resolveAvatarUrl
