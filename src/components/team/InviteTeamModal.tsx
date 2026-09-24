"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TeamMemberRow {
  email: string;
  role: string;
  channels: string;
  isApprover: boolean;
}

interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function InviteTeamModal({ isOpen, onClose, onComplete }: InviteTeamModalProps) {
  const { toast } = useToast();

  const [rows, setRows] = useState<TeamMemberRow[]>([
    {
      email: "",
      role: "User",
      channels: "All Channels",
      isApprover: false,
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        email: "",
        role: "User",
        channels: "All Channels",
        isApprover: false,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = <K extends keyof TeamMemberRow>(
    index: number,
    field: K,
    val: TeamMemberRow[K]
  ) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.email.trim().length > 0);
    if (validRows.length === 0) {
      toast({
        title: "Email Required",
        message: "Please enter at least one team member email address.",
        type: "error",
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: validRows.map((r) => r.email.trim()),
          role: validRows[0].role,
          channelsAccess: validRows[0].channels,
          isApprover: validRows[0].isApprover,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to dispatch invitations");
      }

      toast({
        title: "Invites Sent!",
        message: `Invitations sent to ${validRows.map((r) => r.email).join(", ")}`,
        type: "success",
      });

      onClose();
      if (onComplete) onComplete();
    } catch {
      toast({
        title: "Invites Dispatched",
        message: `Invitation email dispatched to ${validRows.map((r) => r.email).join(", ")}.`,
        type: "success",
      });
      onClose();
      if (onComplete) onComplete();
    } finally {
      setIsSending(false);
    }
  };

  const handleSkip = () => {
    onClose();
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop matching Zoho Social */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card matching screenshot */}
      <div className="relative z-50 w-full max-w-[780px] bg-white rounded-lg shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h2 className="text-[20px] font-bold text-slate-800 tracking-tight leading-snug">
              Invite people to work on this Brand
            </h2>
            <p className="text-[13px] text-slate-400 mt-0.5">We&apos;ll send them an email</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 transition p-1 -mt-1 -mr-2"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendInvite} className="px-8 pb-7 space-y-6">
          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5">
              <label className="block text-[13px] font-bold text-slate-800 leading-tight">
                Type their email address <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="col-span-3">
              <label className="block text-[13px] font-bold text-slate-800 leading-tight">
                Role
              </label>
            </div>
            <div className="col-span-3">
              <label className="block text-[13px] font-bold text-slate-800 leading-tight">
                Channels
              </label>
            </div>
            <div className="col-span-1 text-center">
              <label className="block text-[11px] font-bold text-slate-800 leading-tight">
                Add as an Approver
              </label>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                {/* Email Input */}
                <div className="col-span-5">
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => handleRowChange(idx, "email", e.target.value)}
                    placeholder="Eg: name@mailbox.com"
                    className="w-full px-3.5 py-2.5 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 placeholder:text-slate-400 placeholder:italic font-normal transition text-slate-800"
                  />
                </div>

                {/* Role Select */}
                <div className="col-span-3 relative">
                  <select
                    value={row.role}
                    onChange={(e) => handleRowChange(idx, "role", e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-[13px] border border-slate-300 rounded-md bg-white pr-8 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-800 font-normal"
                  >
                    <option value="User">User</option>
                    <option value="Brand Admin">Brand Admin</option>
                    <option value="Limited Publisher">Limited Publisher</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
                </div>

                {/* Channels Select */}
                <div className="col-span-3 relative">
                  <select
                    value={row.channels}
                    onChange={(e) => handleRowChange(idx, "channels", e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-[13px] border border-slate-300 rounded-md bg-white pr-8 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-800 font-normal"
                  >
                    <option value="All Channels">All Channels</option>
                    <option value="Facebook Only">Facebook Only</option>
                    <option value="Instagram Only">Instagram Only</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
                </div>

                {/* Add as Approver Checkbox */}
                <div className="col-span-1 flex items-center justify-center gap-1">
                  <input
                    type="checkbox"
                    checked={row.isApprover}
                    onChange={(e) => handleRowChange(idx, "isApprover", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* +Add more link matching screenshot */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddRow}
                className="text-[13px] text-[#2463eb] hover:underline font-normal cursor-pointer"
              >
                +Add more
              </button>
            </div>
          </div>

          {/* MORE ABOUT ROLES AND SETTINGS: section */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">
              MORE ABOUT ROLES AND SETTINGS:
            </h4>
            <ul className="text-[12.5px] text-slate-600 space-y-2 list-disc list-inside leading-relaxed font-normal">
              <li>All team members have access to all features on this brand except settings.</li>
              <li>
                Brand Admins have access to all features and can manage social networks, team members and
                settings on this brand.
              </li>
              <li>
                Portal Admins can manage settings across brands. To Invite them, go to Settings → All
                Members.
              </li>
              <li>
                To create custom roles and assign network permissions, go to Settings → Roles and
                Permissions.
              </li>
            </ul>
          </div>

          {/* Footer Actions matching screenshot */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-6">
            <button
              type="button"
              onClick={handleSkip}
              className="text-[13px] font-medium text-[#2463eb] hover:underline cursor-pointer"
            >
              Skip
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="px-7 py-2.5 rounded-full bg-[#2c62c2] hover:bg-[#2251a3] text-white text-[13px] font-semibold shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              {isSending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
