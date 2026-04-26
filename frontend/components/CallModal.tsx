'use client'

import { useEffect, useRef, useState } from 'react'
import { Call, CallStatus, CallType } from '@/lib/types'
import { WebRTCManager } from '@/lib/webrtc'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  PhoneIcon,
  VideoCameraIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  VideoCameraSlashIcon
} from '@heroicons/react/24/solid'

interface CallModalProps {
  call: Call | null
  currentUserId: number
  onEnd: () => void
  onAnswer?: () => void
  onReject?: () => void
}

export default function CallModal({ call, currentUserId, onEnd, onAnswer, onReject }: CallModalProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [webrtcManager, setWebrtcManager] = useState<WebRTCManager | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const isCaller = call?.callerId === currentUserId
  const otherUser = isCaller ? call?.receiver : call?.caller
  const isIncoming = !isCaller && call?.status === CallStatus.RINGING
  const isActive = call?.status === CallStatus.ANSWERED

  useEffect(() => {
    if (!call || !isActive) return

    const manager = new WebRTCManager()
    setWebrtcManager(manager)

    manager.initializeCall(
      call.callId,
      call.receiverId,
      isCaller,
      call.type,
      (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      },
      () => {
        handleEndCall()
      }
    ).then(() => {
      const localStream = manager.getLocalStream()
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream
      }
    }).catch((error) => {
      console.error('Error initializing call:', error)
      toast.error('Failed to start call')
    })

    return () => {
      manager.endCall()
    }
  }, [call, isActive, isCaller])

  // Play ringtone for incoming calls
  useEffect(() => {
    if (isIncoming && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play blocked, user will need to interact
      })
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [isIncoming])

  const handleAnswer = async () => {
    if (!call) return
    
    try {
      await api.post(`/calls/${call.callId}/answer`)
      if (onAnswer) onAnswer()
    } catch (error: any) {
      console.error('Error answering call:', error)
      toast.error('Failed to answer call')
    }
  }

  const handleReject = async () => {
    if (!call) return
    
    try {
      await api.post(`/calls/${call.callId}/reject`)
      if (onReject) onReject()
    } catch (error: any) {
      console.error('Error rejecting call:', error)
      toast.error('Failed to reject call')
    }
  }

  const handleEndCall = async () => {
    if (!call) return
    
    try {
      await api.post(`/calls/${call.callId}/end`)
      if (webrtcManager) {
        webrtcManager.endCall()
      }
      onEnd()
    } catch (error: any) {
      console.error('Error ending call:', error)
      toast.error('Failed to end call')
    }
  }

  const handleToggleMute = () => {
    if (webrtcManager) {
      webrtcManager.toggleMute()
      setIsMuted(!isMuted)
    }
  }

  const handleToggleVideo = () => {
    if (webrtcManager && call?.type === CallType.VIDEO) {
      webrtcManager.toggleVideo()
      setIsVideoOff(!isVideoOff)
    }
  }

  if (!call) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <audio ref={audioRef} loop>
        <source src="/ringtone.mp3" type="audio/mpeg" />
      </audio>

      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Remote Video (or avatar if video off) */}
        <div className="relative w-full h-full flex items-center justify-center">
          {call.type === CallType.VIDEO && isActive ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                <span className="text-4xl text-white font-bold">
                  {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <p className="text-white text-2xl font-bold">{otherUser?.name || 'User'}</p>
            </div>
          )}

          {/* Local Video (picture-in-picture for video calls) */}
          {call.type === CallType.VIDEO && isActive && (
            <div className="absolute bottom-20 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Call Status */}
        {!isActive && (
          <div className="absolute top-20 text-center">
            <p className="text-white text-xl mb-2">
              {isIncoming ? 'Incoming Call' : 'Calling...'}
            </p>
            <p className="text-gray-300">{otherUser?.name || 'User'}</p>
            <p className="text-gray-400 text-sm mt-1">
              {call.type === CallType.VIDEO ? 'Video Call' : 'Audio Call'}
            </p>
          </div>
        )}

        {/* Call Controls */}
        <div className="absolute bottom-10 flex items-center gap-4">
          {isIncoming ? (
            <>
              <button
                onClick={handleReject}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={handleAnswer}
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
              >
                {call.type === CallType.VIDEO ? (
                  <VideoCameraIcon className="w-8 h-8 text-white" />
                ) : (
                  <PhoneIcon className="w-8 h-8 text-white" />
                )}
              </button>
            </>
          ) : isActive ? (
            <>
              <button
                onClick={handleToggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                ) : (
                  <SpeakerWaveIcon className="w-6 h-6 text-white" />
                )}
              </button>
              {call.type === CallType.VIDEO && (
                <button
                  onClick={handleToggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? (
                    <VideoCameraSlashIcon className="w-6 h-6 text-white" />
                  ) : (
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                  )}
                </button>
              )}
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-8 h-8 text-white" />
              </button>
            </>
          ) : (
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-8 h-8 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
