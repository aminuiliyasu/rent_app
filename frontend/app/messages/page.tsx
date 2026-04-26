'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { MessageResponse, Booking, Call, CallType, CallStatus } from '@/lib/types'
import CallModal from '@/components/CallModal'
import toast from 'react-hot-toast'
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

export default function MessagesPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const callWsRef = useRef<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedBooking) {
      fetchMessages(selectedBooking.id)
      connectWebSocket(selectedBooking.id)
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedBooking])

  // Refresh messages periodically when a booking is selected
  useEffect(() => {
    if (!selectedBooking) return
    
    const interval = setInterval(() => {
      fetchMessages(selectedBooking.id)
    }, 3000) // Refresh every 3 seconds
    
    return () => clearInterval(interval)
  }, [selectedBooking])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // Fetch bookings where user is renter
      const myBookingsResponse = await api.get('/bookings/my?page=0&size=50')
      const myBookings = myBookingsResponse.data.content || []
      
      // Fetch bookings where user is owner (for their listings)
      const myListingBookingsResponse = await api.get('/bookings/my-listings?page=0&size=50')
      const myListingBookings = myListingBookingsResponse.data.content || []
      
      // Combine and deduplicate by booking ID
      const allBookings = [...myBookings, ...myListingBookings]
      const uniqueBookings = allBookings.filter((booking, index, self) =>
        index === self.findIndex((b) => b.id === booking.id)
      )
      
      setBookings(uniqueBookings)
      if (uniqueBookings.length > 0) {
        setSelectedBooking(uniqueBookings[0])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (bookingId: number) => {
    try {
      const response = await api.get(`/messages/booking/${bookingId}`)
      setMessages(response.data || [])
      await api.post(`/messages/booking/${bookingId}/read`)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const connectWebSocket = (bookingId: number) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => console.log('WebSocket connected')
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.bookingId === bookingId) {
          setMessages(prev => [...prev, message])
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
    ws.onerror = (error) => console.error('WebSocket error:', error)
    ws.onclose = () => console.log('WebSocket disconnected')
    
    wsRef.current = ws
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedBooking) return

    try {
      const response = await api.post('/messages', {
        bookingId: selectedBooking.id,
        content: newMessage
      })
      
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      
      // Refresh messages to ensure we have the latest
      fetchMessages(selectedBooking.id)
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          bookingId: selectedBooking.id,
          content: newMessage
        }))
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to send message')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    if (!selectedBooking) return

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `voice-note-${Date.now()}.webm`)

      const uploadResponse = await api.post('/upload/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (!uploadResponse.data.url) {
        throw new Error('Upload failed - no URL returned')
      }

      const messageResponse = await api.post('/messages', {
        bookingId: selectedBooking.id,
        content: 'Voice note',
        attachmentUrl: uploadResponse.data.url
      })

      setMessages(prev => [...prev, messageResponse.data])
      fetchMessages(selectedBooking.id)
      toast.success('Voice note sent!')
    } catch (error: any) {
      console.error('Error sending voice note:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send voice note'
      toast.error(errorMsg)
    }
  }

  const connectCallWebSocket = () => {
    if (!user) return

    try {
      const SockJS = require('sockjs-client')
      const { Client } = require('@stomp/stompjs')
      const token = localStorage.getItem('accessToken')
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'
      
      const socket = new SockJS(wsUrl)
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Call WebSocket connected')
          
          // Subscribe to incoming calls
          client.subscribe(`/user/${user.id}/queue/call`, (message: any) => {
            const callData = JSON.parse(message.body)
            setActiveCall(callData)
          })
        }
      })

      if (token) {
        client.beforeConnect = () => {
          socket.onopen = () => {
            socket.send(JSON.stringify({ token }))
          }
        }
      }

      client.activate()
      callWsRef.current = client
    } catch (error) {
      console.error('Error connecting call WebSocket:', error)
    }
  }

  const initiateCall = async (callType: CallType) => {
    if (!selectedBooking || !user) return

    try {
      const receiverId = user.id === selectedBooking.renterId 
        ? selectedBooking.ownerId 
        : selectedBooking.renterId

      const response = await api.post('/calls/initiate', {
        receiverId: receiverId,
        type: callType,
        bookingId: selectedBooking.id
      })

      setActiveCall(response.data)
    } catch (error: any) {
      console.error('Error initiating call:', error)
      toast.error(error.response?.data?.message || 'Failed to initiate call')
    }
  }

  if (authLoading || loading || !isAuthenticated) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Messages
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Chat with owners and renters</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* Bookings List */}
          <div className="card-glass flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Bookings</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedBooking?.id === booking.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500 shadow-lg scale-[1.02]'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        Booking #{booking.id}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                      {booking.listing?.title || 'Listing'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <CalendarDaysIcon className="h-3 w-3" />
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No bookings yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Start a booking to begin messaging</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 card-glass flex flex-col animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {selectedBooking ? (
              <>
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedBooking.listing?.title || 'Conversation'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Booking #{selectedBooking.id} • {user?.id === selectedBooking.renterId 
                          ? `Chatting with ${selectedBooking.owner?.name || 'Owner'}`
                          : `Chatting with ${selectedBooking.renter?.name || 'Renter'}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast('Video call feature coming soon!')}
                        className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                        title="Video Call"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => toast('Audio call feature coming soon!')}
                        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        title="Audio Call"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} animate-slide-up`}
                      >
                        <div className="flex flex-col">
                          <p className={`text-xs mb-1 px-2 ${
                            message.senderId === user?.id
                              ? 'text-right text-blue-600 dark:text-blue-400'
                              : 'text-left text-gray-600 dark:text-gray-400'
                          }`}>
                            {message.sender?.name || 'User'}
                          </p>
                          <div
                            className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-lg ${
                              message.senderId === user?.id
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {message.attachmentUrl && (message.attachmentUrl.includes('voice') || message.content.includes('Voice note')) ? (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                </svg>
                                <audio controls className="max-w-full" style={{ maxWidth: '250px' }}>
                                  <source src={message.attachmentUrl} type="audio/webm" />
                                  <source src={message.attachmentUrl} type="audio/mpeg" />
                                  <source src={message.attachmentUrl} type="audio/wav" />
                                  Your browser does not support audio playback.
                                </audio>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            )}
                            <p className={`text-xs mt-2 ${
                              message.senderId === user?.id
                                ? 'text-blue-100'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <SparklesIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 input-field"
                    />
                    <button
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
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-primary px-6 py-3 flex items-center gap-2"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                      Send
                    </button>
                  </div>
                  {isRecording && (
                    <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                      <span className="animate-pulse">●</span>
                      Recording... Release to send
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Select a booking to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
