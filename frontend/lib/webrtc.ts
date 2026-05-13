// WebRTC Manager for handling peer-to-peer connections
import type { Client } from '@stomp/stompjs'

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private stompClient: Client | null = null
  private callId: string | null = null
  private receiverId: number | null = null
  private isCaller: boolean = false
  private onRemoteStream: ((stream: MediaStream) => void) | null = null
  private onCallEnded: (() => void) | null = null

  constructor() {
    // STUN servers for NAT traversal
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
    this.pc = new RTCPeerConnection(configuration)
  }

  async initializeCall(
    callId: string,
    receiverId: number,
    isCaller: boolean,
    callType: 'AUDIO' | 'VIDEO',
    onRemoteStream: (stream: MediaStream) => void,
    onCallEnded: () => void
  ) {
    this.callId = callId
    this.receiverId = receiverId
    this.isCaller = isCaller
    this.onRemoteStream = onRemoteStream
    this.onCallEnded = onCallEnded

    // Get local media
    try {
      const pc = this.pc
      if (!pc) {
        throw new Error('Peer connection is not initialized')
      }

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'VIDEO'
      }
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Add local tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })

      // Handle remote stream
      pc.ontrack = (event) => {
        this.remoteStream = event.streams[0]
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream)
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && this.stompClient && this.stompClient.connected) {
          this.stompClient.publish({
            destination: '/app/call/ice-candidate',
            body: JSON.stringify({
              callId: this.callId,
              receiverId: this.receiverId,
              candidate: event.candidate
            })
          })
        }
      }

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || 
            pc.connectionState === 'failed' ||
            pc.connectionState === 'closed') {
          this.cleanup()
        }
      }

      // Connect WebSocket
      await this.connectWebSocket()

      // Create offer if caller
      if (isCaller) {
        await this.createOffer()
      }
    } catch (error) {
      console.error('Error initializing call:', error)
      throw error
    }
  }

  private async connectWebSocket() {
    return new Promise<void>((resolve, reject) => {
      const SockJS = require('sockjs-client')
      const { Client } = require('@stomp/stompjs')
      const token = localStorage.getItem('accessToken')
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'
      
      const socket = new SockJS(wsUrl)
      const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected for WebRTC')
          
          // Subscribe to WebRTC messages
          stompClient.subscribe(`/user/${this.receiverId}/queue/webrtc`, (message: any) => {
            this.handleWebRTCMessage(JSON.parse(message.body))
          })
          
          resolve()
        },
        onStompError: (frame: any) => {
          console.error('STOMP error:', frame)
          reject(new Error('WebSocket connection failed'))
        }
      })
      this.stompClient = stompClient

      // Add authorization header
      stompClient.beforeConnect = () => {
        if (token) {
          socket.onopen = () => {
            socket.send(JSON.stringify({ token }))
          }
        }
      }

      stompClient.activate()
    })
  }

  private async handleWebRTCMessage(message: any) {
    if (!this.pc) return

    if (message.type === 'offer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(message))
      const answer = await this.pc.createAnswer()
      await this.pc.setLocalDescription(answer)
      
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.publish({
          destination: '/app/call/answer',
          body: JSON.stringify({
            callId: this.callId,
            type: 'answer',
            sdp: answer.sdp,
            receiverId: message.senderId
          })
        })
      }
    } else if (message.type === 'answer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(message))
    } else if (message.type === 'ice-candidate') {
      await this.pc.addIceCandidate(new RTCIceCandidate(message.candidate))
    }
  }

  private async createOffer() {
    if (!this.pc) return

    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/call/offer',
        body: JSON.stringify({
          callId: this.callId,
          receiverId: this.receiverId,
          type: 'offer',
          sdp: offer.sdp
        })
      })
    }
  }

  async toggleMute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
    }
  }

  async toggleVideo() {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
    }
  }

  async endCall() {
    this.cleanup()
    if (this.onCallEnded) {
      this.onCallEnded()
    }
  }

  private cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    if (this.pc) {
      this.pc.close()
      this.pc = null
    }
    
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.stompClient = null
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }
}
