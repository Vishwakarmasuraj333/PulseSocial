"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/toast";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Plus,
  ArrowRight,
  PhoneCall,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  Radio,
  Share2,
  RefreshCw,
} from "lucide-react";

interface CallRoomItem {
  id: string;
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  participantCount: number;
  createdAt: number;
  status: "active" | "ended";
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CallsHubPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<CallRoomItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Self equipment preview test
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [previewVideoEnabled, setPreviewVideoEnabled] = useState(true);
  const [previewAudioEnabled, setPreviewAudioEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Load active rooms and team members
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomsRes, teamRes] = await Promise.all([
        fetch("/api/calls/rooms"),
        fetch("/api/team"),
      ]);

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms || []);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.activeMembers || []);
      }
    } catch {
      toast({
        title: "Connection Error",
        message: "Failed to load recent meeting rooms.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hardware self-test preview
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let animId: number;

    async function startPreview() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setPreviewStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }

        // Setup audio level meter
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            setAudioLevel(Math.min(100, Math.round((sum / dataArray.length) * 1.5)));
            animId = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      } catch {
        // Permissions not yet granted or camera absent
      }
    }

    startPreview();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (audioCtx) audioCtx.close().catch(() => {});
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const togglePreviewVideo = () => {
    if (previewStream) {
      const next = !previewVideoEnabled;
      previewStream.getVideoTracks().forEach((t) => (t.enabled = next));
      setPreviewVideoEnabled(next);
    }
  };

  const togglePreviewAudio = () => {
    if (previewStream) {
      const next = !previewAudioEnabled;
      previewStream.getAudioTracks().forEach((t) => (t.enabled = next));
      setPreviewAudioEnabled(next);
    }
  };

  // Start instant meeting
  const handleStartInstantMeeting = async (customName?: string) => {
    setIsCreatingRoom(true);
    try {
      const res = await fetch("/api/calls/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customName || "Quick Team Standup",
        }),
      });

      if (!res.ok) throw new Error("Failed to start meeting");
      const data = await res.json();
      router.push(`/calls/${data.room.code}`);
    } catch (err: any) {
      toast({
        title: "Meeting Error",
        message: err.message || "Could not launch meeting room.",
        type: "error",
      });
      setIsCreatingRoom(false);
    }
  };

  // Join by code or URL
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    let code = joinCodeInput.trim();
    if (code.includes("/calls/")) {
      code = code.split("/calls/")[1].split("?")[0].replace(/\/+$/, "");
    }
    router.push(`/calls/${encodeURIComponent(code)}`);
  };

  // 1-Click Call Team Member
  const handleCallMember = (member: TeamMember) => {
    const roomTitle = `1-on-1 Call with ${member.name}`;
    handleStartInstantMeeting(roomTitle);
  };

  const copyCode = (code: string) => {
    const url = `${window.location.origin}/calls/${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast({
      title: "Invite Link Copied",
      message: `Direct link: ${url}`,
      type: "success",
    });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <AppLayout>
      <div className="bg-slate-50 dark:bg-[#0D0D0E] min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans text-slate-800 dark:text-[#9CA3AF]">
        {/* ============================================================== */}
        {/* HERO HEADER: Pulse Video & Voice Calling Studio               */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Live WebRTC Direct HD
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> End-to-End Encrypted
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Video Calling & Team Conversations
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Host high-definition video calls, collaborate via live screen sharing, and conduct real-time team discussions without third-party plugins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStartInstantMeeting()}
              disabled={isCreatingRoom}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60"
            >
              <Video className="w-4 h-4" />
              <span>{isCreatingRoom ? "Creating Room..." : "New Instant Meeting"}</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTION CARDS & HARDWARE PREVIEW ROW                            */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Join Meeting by Code Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#15171C] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                Join with a Code or Link
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Enter a meeting code or paste an invitation link to jump directly into the session.
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-3">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="e.g. pulse-meet-1234 or paste link"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D0D0E] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!joinCodeInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-xs transition-all disabled:opacity-40"
              >
                <span>Join Meeting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Schedule / Team Room Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#15171C] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                Workspace Team Standup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Launch a persistent meeting link that any authorized workspace member can join at any time.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleStartInstantMeeting("Workspace Weekly Standup")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium text-xs border border-indigo-200 dark:border-indigo-800 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Launch Team Standup Room</span>
              </button>
            </div>
          </div>

          {/* Hardware & Equipment Self-Test Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#15171C] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Device Readiness Check
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>

              {/* Video Camera preview thumbnail */}
              <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover -scale-x-100 ${
                    !previewVideoEnabled ? "hidden" : "block"
                  }`}
                />
                {!previewVideoEnabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <VideoOff className="w-6 h-6 mb-1 text-slate-600" />
                    <span>Camera Paused</span>
                  </div>
                )}

                {/* Mic level bar overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/80 backdrop-blur-sm text-[11px] text-white">
                  <Mic className="w-3 h-3 text-slate-400 shrink-0" />
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-75 rounded-full"
                      style={{ width: `${previewAudioEnabled ? audioLevel : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preview Toggles */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">Test mic & camera</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePreviewAudio}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    previewAudioEnabled
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 border border-rose-300 dark:border-rose-800"
                  }`}
                  title="Toggle Microphone Test"
                >
                  {previewAudioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={togglePreviewVideo}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    previewVideoEnabled
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 border border-rose-300 dark:border-rose-800"
                  }`}
                  title="Toggle Camera Test"
                >
                  {previewVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTIVE & RECENT MEETING ROOMS SECTION                          */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent & Active Meeting Rooms (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#15171C] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Meeting Rooms
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Active and recently held video conference rooms in this workspace.
                </p>
              </div>
              <button
                onClick={loadData}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Refresh rooms"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs">Loading rooms...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  No active meeting rooms
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Create a new instant meeting or launch a team standup to collaborate live with your teammates.
                </p>
                <button
                  onClick={() => handleStartInstantMeeting()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
                >
                  Start First Meeting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => {
                  const isActive = room.status === "active";
                  return (
                    <div
                      key={room.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0D0D0E] border border-slate-200 dark:border-slate-800 gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {room.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono text-[11px]">{room.code}</span>
                            <span>•</span>
                            <span>Host: {room.hostName}</span>
                            <span>•</span>
                            <span>
                              {room.participantCount}{" "}
                              {room.participantCount === 1 ? "participant" : "participants"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => copyCode(room.code)}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs"
                          title="Copy Link"
                        >
                          {copiedCode === room.code ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => router.push(`/calls/${room.code}`)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                              : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <span>{isActive ? "Join Call" : "Reopen Room"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Direct Team Call Roster */}
          <div className="rounded-2xl bg-white dark:bg-[#15171C] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Team Members
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct 1-on-1 video call teammates.
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {teamMembers.length}
              </span>
            </div>

            {teamMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No team members found in workspace.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-[420px]">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0D0D0E] border border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-500 font-bold text-xs flex items-center justify-center">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCallMember(member)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-sm"
                      title={`Call ${member.name}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
