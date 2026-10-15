"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Users, Plus, ShieldCheck, Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function TeamPage() {
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Brand Admin");
  const [isApprover, setIsApprover] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  const fetchTeam = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        const active = (data.activeMembers || []).map((m: any) => ({
          id: m.id,
          name: m.name || m.email.split("@")[0],
          email: m.email,
          role: m.role,
          channels: m.channelsAccess === "ALL" ? "All Channels" : m.channelsAccess,
          isApprover: m.isApprover,
          avatar: m.avatar || "",
          status: "ACTIVE",
        }));
        const pending = (data.pendingInvites || []).map((inv: any) => ({
          id: inv.id,
          name: inv.email.split("@")[0],
          email: inv.email,
          role: inv.role,
          channels: inv.channelsAccess === "ALL" ? "All Channels" : inv.channelsAccess,
          isApprover: inv.isApprover,
          avatar: "",
          status: "INVITED",
        }));
        setMembers([...active, ...pending]);
      }
    } catch {
      toast({ title: "Error", message: "Failed to load team members", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          channelsAccess: "ALL",
          isApprover,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite");

      toast({
        title: "Invitation Dispatched",
        message: `Invite sent to ${inviteEmail}`,
        type: "success",
      });

      setIsInviteOpen(false);
      setInviteEmail("");
      fetchTeam();
    } catch (err: unknown) {
      toast({ title: "Error", message: (err as Error).message, type: "error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team &amp; Access Governance
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Role-based access controls, post approvers, and channel scope assignments
            </p>
          </div>

          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Invite Team Member
          </Button>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading team governance...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No team members yet</p>
            <p className="text-xs text-slate-500 mt-1">Invite your teammates to collaborate on this workspace.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (<md) */}
            <div className="md:hidden space-y-3">
              {members.map((m) => (
                <Card key={m.id} className="p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        {m.avatar ? (
                          <Image
                            src={m.avatar}
                            alt={m.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                            {m.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{m.name}</p>
                        <p className="text-[11px] text-slate-400">{m.email}</p>
                      </div>
                    </div>
                    <Badge variant={m.role === "OWNER" ? "default" : "secondary"} className="text-[10px]">
                      {m.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{m.channels}</span>
                    {m.isApprover ? (
                      <span className="inline-flex items-center gap-1 text-purple-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approver
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Standard</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Team Table Card (>=md) */}
            <Card className="hidden md:block overflow-hidden border-slate-200/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 uppercase font-semibold">
                      <th className="p-4">Member</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Channel Scope</th>
                      <th className="p-4">Approver Privilege</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        {m.avatar ? (
                          <Image
                            src={m.avatar}
                            alt={m.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                            {m.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-slate-400">{m.email}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant={m.role === "OWNER" ? "default" : "secondary"}>
                        {m.role}
                      </Badge>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {m.channels}
                    </td>

                    <td className="p-4">
                      {m.isApprover ? (
                        <span className="inline-flex items-center gap-1 text-purple-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Authorized Approver
                        </span>
                      ) : (
                        <span className="text-slate-400">Standard</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Configure
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </>
        )}

        {/* Invite Modal matching Screenshot 3 */}
        <Dialog
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          title="Invite people to work on this Brand"
          description="We'll send them an email"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label htmlFor="invite-email-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Type their email address *
              </label>
              <Input
                id="invite-email-input"
                aria-label="Email address"
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="invite-role-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Role
                </label>
                <select
                  id="invite-role-select"
                  aria-label="Select role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="Brand Admin">Brand Admin</option>
                  <option value="User">User</option>
                  <option value="Limited Publisher">Limited Publisher</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="invite-channels-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Channels
                </label>
                <select
                  id="invite-channels-select"
                  aria-label="Select channels"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="ALL">All Channels</option>
                  <option value="INSTAGRAM">Instagram Profile</option>
                </select>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isApprover}
                  onChange={(e) => setIsApprover(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Add as an Approver
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Send Invite
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
