import { getUploadBaseUrl } from './api'

/**
 * Upload multipart files using `fetch` so the browser sets
 * `multipart/form-data` with the correct boundary.
 * The shared axios client defaults to `Content-Type: application/json`, which breaks file uploads.
 */
export async function uploadImage(file: File, type: 'profile' | 'listing' = 'listing'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const path = type === 'profile' ? '/upload/profile-picture' : '/upload/listing-image'
  const base = getUploadBaseUrl().replace(/\/$/, '')
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) {
    let detail = res.statusText || 'Upload failed'
    try {
      const errBody = (await res.json()) as { error?: string; message?: string }
      detail = errBody.error || errBody.message || detail
    } catch {
      /* ignore */
    }
    throw new Error(detail)
  }

  const data = (await res.json()) as { url?: string }
  if (!data.url) throw new Error('Upload did not return a URL')
  return data.url
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, 'listing'))
  return Promise.all(uploadPromises)
}
