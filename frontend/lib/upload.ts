import api from './api'

export async function uploadImage(file: File, type: 'profile' | 'listing' = 'listing'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const endpoint = type === 'profile' ? '/upload/profile-picture' : '/upload/listing-image'
  
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data.url
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, 'listing'))
  return Promise.all(uploadPromises)
}
