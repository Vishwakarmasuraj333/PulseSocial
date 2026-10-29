"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { VideoCallRoom } from "@/components/calls/VideoCallRoom";
import { useToast } from "@/components/ui/toast";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ArrowLeft,
  Users,
  ShieldCheck,
  Radio,
  Sparkles,
} from "lucide-react";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const rawRoomId = (params?.roomId as string) || "pulse-standup";
  const [hasJoined, setHasJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User session
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Room details
  const [roomData, setRoomData] = useState<{
    id: string;
    code: string;
    name: string;
    hostId: string;
    hostName: string;
    participants: any[];
  } | null>(null);

  // Pre-join audio/video toggles
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // 1. Fetch user session and room info
  useEffect(() => {
    async function loadSessionAndRoom() {
      try {
        const [meRes, roomRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/calls/rooms/${encodeURIComponent(rawRoomId)}`),
        ]);

        if (!meRes.ok) {
          router.push(`/login?redirect=/calls/${encodeURIComponent(rawRoomId)}`);
          return;
        }

        const meData = await meRes.json();
        setSessionUser(meData.user);

        if (roomRes.ok) {
          const roomJson = await roomRes.json();
          setRoomData(roomJson.room);
        } else {
          // Default fallback room parameters
          setRoomData({
            id: rawRoomId,
            code: rawRoomId,
            name: `Meeting (${rawRoomId.toUpperCase()})`,
            hostId: meData.user?.id || "host",
            hostName: meData.user?.name || "Host",
            participants: [],
          });
        }
      } catch {
        toast({
          title: "Connection Error",
          message: "Could not connect to meeting server.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSessionAndRoom();
  }, [rawRoomId, router, toast]);

  // 2. Pre-join hardware preview setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let animId: number;

    async function initPreview() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setPreviewStream(stream);

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            setAudioLevel(Math.min(100, Math.round((sum / dataArray.length) * 1.5)));
            animId = requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        }
      } catch {
        // Fallback if camera absent
      }
    }

    if (!hasJoined) {
      initPreview();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (audioCtx) audioCtx.close().catch(() => {});
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [hasJoined]);

  // Pre-join toggle audio
  const handleToggleAudio = () => {
    if (previewStream) {
      const next = !isAudioEnabled;
      previewStream.getAudioTracks().forEach((t) => (t.enabled = next));
      setIsAudioEnabled(next);
    }
  };

  // Pre-join toggle video
  const handleToggleVideo = () => {
    if (previewStream) {
      const next = !isVideoEnabled;
      previewStream.getVideoTracks().forEach((t) => (t.enabled = next));
      setIsVideoEnabled(next);
    }
  };

  // Join button clicked: stop preview stream tracks so VideoCallRoom gets exclusive clean access
  const handleJoinMeeting = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((t) => t.stop());
      setPreviewStream(null);
    }
    setHasJoined(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-950 text-white">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-400">Connecting to secure WebRTC meeting room...</p>
        </div>
      </AppLayout>
    );
  }

  // Active in-call video room stage
  if (hasJoined && sessionUser && roomData) {
    return (
      <AppLayout>
        <VideoCallRoom
          roomId={roomData.id}
          roomName={roomData.name}
          roomCode={roomData.code}
          currentUserId={sessionUser.id}
          currentUserName={sessionUser.name || sessionUser.email.split("@")[0]}
          currentUserAvatar={sessionUser.avatarUrl}
          isHost={roomData.hostId === sessionUser.id}
          initialAudioEnabled={isAudioEnabled}
          initialVideoEnabled={isVideoEnabled}
        />
      </AppLayout>
    );
  }

  // Pre-join Lobby View
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Interactive Media Preview Stage */}
          <div className="flex-1 w-full max-w-lg">
            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <video
                ref={previewVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover -scale-x-100 ${
                  !isVideoEnabled ? "hidden" : "block"
                }`}
              />

              {!isVideoEnabled && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-white">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl font-bold text-white mb-2">
                    {sessionUser?.name ? sessionUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs text-slate-400">Camera is turned off</span>
                </div>
              )}

              {/* Live Audio Visualizer Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-xs text-white">
                <Mic className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75 rounded-full"
                    style={{ width: `${isAudioEnabled ? audioLevel : 0}%` }}
                  />
                </div>
              </div>

              {/* Floating Camera / Mic Control Pills on Preview */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`p-2.5 rounded-xl transition-all shadow-md ${
                    isAudioEnabled
                      ? "bg-slate-800/90 text-white border border-slate-700"
                      : "bg-rose-600 text-white shadow-rose-600/30"
                  }`}
                  title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-white" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleVideo}
                  className={`p-2.5 rounded-xl transition-all shadow-md ${
                    isVideoEnabled
                      ? "bg-slate-800/90 text-white border border-slate-700"
                      : "bg-rose-600 text-white shadow-rose-600/30"
                  }`}
                  title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Meeting Information & Join Call CTA */}
          <div className="flex-1 w-full max-w-md flex flex-col justify-center">
            <button
              onClick={() => router.push("/calls")}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all mb-4 self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Calls Hub</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 self-start mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live WebRTC Direct HD
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {roomData?.name || "Video Call Room"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
              Room Code: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{roomData?.code}</span>
            </p>

            {/* Participants inside */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {roomData?.participants?.length ? (
                    <span>{roomData.participants.length} participant(s) already in room</span>
                  ) : (
                    <span>No one is in the call yet</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {roomData?.participants?.length
                    ? "Your teammates are waiting for you."
                    : "You will be the first participant in this meeting."}
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinMeeting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
            >
              <Video className="w-5 h-5" />
              <span>Join Meeting Now</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Encrypted peer-to-peer real-time communication</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
