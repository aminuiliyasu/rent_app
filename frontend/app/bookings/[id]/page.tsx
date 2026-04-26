'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid'
import { Call, CallType } from '@/lib/types'
import CallModal from '@/components/CallModal'

interface Booking {
  id: number
  listingId: number
  renterId: number
  ownerId: number
  startDate: string
  endDate: string
  status: string
  totalAmount: number
  deposit: number
  platformFee: number
  renter: { id: number; name: string; email: string }
  owner: { id: number; name: string; email: string }
  listing?: { title: string; priceDay: number }
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchBooking()
    fetchMessages()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${params.id}`)
      setBooking(response.data)
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast.error('Failed to load booking')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/booking/${params.id}`)
      setMessages(response.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !booking) return

    setSendingMessage(true)
    try {
      await api.post('/messages', {
        bookingId: booking.id,
        receiverId: user?.id === booking.renterId ? booking.ownerId : booking.renterId,
        content: newMessage,
      })
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await sendVoiceNote(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const sendVoiceNote = async (audioBlob: Blob) => {
    if (!booking) return

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `voice-note-${Date.now()}.webm`)

      const uploadResponse = await api.post('/upload/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (!uploadResponse.data.url) {
        throw new Error('Upload failed - no URL returned')
      }

      await api.post('/messages', {
        bookingId: booking.id,
        receiverId: user?.id === booking.renterId ? booking.ownerId : booking.renterId,
        content: 'Voice note',
        attachmentUrl: uploadResponse.data.url
      })

      fetchMessages()
      toast.success('Voice note sent!')
    } catch (error: any) {
      console.error('Error sending voice note:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send voice note'
      toast.error(errorMsg)
    }
  }

  const initiateCall = async (callType: CallType) => {
    if (!booking || !user) return

    try {
      const receiverId = user.id === booking.renterId 
        ? booking.ownerId 
        : booking.renterId

      const response = await api.post('/calls/initiate', {
        receiverId: receiverId,
        type: callType,
        bookingId: booking.id
      })

      setActiveCall(response.data)
    } catch (error: any) {
      console.error('Error initiating call:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate call')
    }
  }

  const handleConfirm = async () => {
    if (!booking) return
    try {
      await api.post(`/bookings/${booking.id}/confirm`)
      toast.success('Booking confirmed!')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking')
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      await api.post(`/bookings/${booking.id}/cancel`)
      toast.success('Booking cancelled')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!booking) return null

  const isOwner = user?.id === booking.ownerId
  const isRenter = user?.id === booking.renterId
  const canApprove = isOwner && booking.status === 'PENDING'
  const canCancel = (isOwner || isRenter) && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Info */}
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  Booking Details
                </h1>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[booking.status] || ''}`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span>
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rental Fee</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${booking.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${(booking.totalAmount + booking.deposit + booking.platformFee).toFixed(2)}
                    </p>
                  </div>
                </div>

                {canApprove && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleConfirm}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Approve Booking
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 btn-outline flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Reject
                    </button>
                  </div>
                )}

                {canCancel && !canApprove && (
                  <button
                    onClick={handleCancel}
                    className="w-full btn-outline text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            {/* Chat Section */}
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                  Messages
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => initiateCall(CallType.VIDEO)}
                    className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                    title="Video Call"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => initiateCall(CallType.AUDIO)}
                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    title="Audio Call"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
                    >
                      <p className={`text-xs mb-1 px-2 ${
                        msg.senderId === user?.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {msg.sender?.name || 'User'}
                      </p>
                      <div
                        className={`p-4 rounded-xl max-w-[80%] ${
                          msg.senderId === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                      >
                        {msg.attachmentUrl && (msg.attachmentUrl.includes('voice') || msg.content.includes('Voice note')) ? (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                            <audio controls className="max-w-full" style={{ maxWidth: '250px' }}>
                              <source src={msg.attachmentUrl} type="audio/webm" />
                              <source src={msg.attachmentUrl} type="audio/mpeg" />
                              <source src={msg.attachmentUrl} type="audio/wav" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                        <p className={`text-xs mt-2 ${msg.senderId === user?.id ? 'text-blue-100' : 'opacity-75'}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                  disabled={sendingMessage}
                />
                <button
                  type="button"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`p-3 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  title="Hold to record voice note"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="btn-primary px-6"
                >
                  Send
                </button>
              </form>
              {isRecording && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                  <span className="animate-pulse">●</span>
                  Recording... Release to send
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-glass sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {isOwner ? 'Renter' : 'Owner'}
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {isOwner ? booking.renter.name : booking.owner.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOwner ? booking.renter.email : booking.owner.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Call Modal */}
      {activeCall && (
        <CallModal
          call={activeCall}
          currentUserId={user?.id || 0}
          onEnd={() => setActiveCall(null)}
          onAnswer={() => {
            // Call will be updated via WebSocket
          }}
          onReject={() => setActiveCall(null)}
        />
      )}
    </div>
  )
}
