'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

const roleOptions = [
  { value: 'OWNER', label: 'OWNER' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'MANAGER', label: 'MANAGER' },
  { value: 'VIEWER', label: 'VIEWER' },
];

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');

  async function loadTeam() {
    setLoading(true);
    setError('');
    try {
      const [membersResponse, invitationsResponse] = await Promise.all([
        apiFetch('/api/team/members'),
        apiFetch('/api/team/invitations'),
      ]);
      setMembers(membersResponse.members || []);
      setInvitations(invitationsResponse.invitations || []);
    } catch (requestError) {
      setError(requestError.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  const seatUsage = useMemo(() => {
    const limit = 5;
    return `${members.length} / ${limit} seats used`;
  }, [members.length]);

  async function sendInvite() {
    setError('');
    try {
      await apiFetch('/api/team/invitations', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          acceptBaseUrl: window.location.origin,
        }),
      });
      setInviteEmail('');
      setInviteRole('VIEWER');
      await loadTeam();
    } catch (requestError) {
      setError(requestError.message || 'Failed to send invite');
    }
  }

  async function updateRole(memberId, role) {
    await apiFetch(`/api/team/roles/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    await loadTeam();
  }

  async function removeMember(memberId) {
    await apiFetch(`/api/team/members/${memberId}`, {
      method: 'DELETE',
    });
    await loadTeam();
  }

  async function revokeInvite(invitationId) {
    await apiFetch(`/api/team/invitations/${invitationId}/revoke`, {
      method: 'POST',
    });
    await loadTeam();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto glass-card p-8">
        <h1 className="text-2xl font-semibold">Team Members</h1>
        <p className="mt-2 text-slate-400">Loading team management…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-slate-400">{seatUsage}</p>
        </div>
        <button className="btn-primary" onClick={sendInvite} disabled={!inviteEmail}>
          Invite Member
        </button>
      </div>

      {error ? (
        <div className="glass-card p-4 text-sm text-red-300 border border-red-500/20">{error}</div>
      ) : null}

      <div className="glass-card p-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            className="input-base"
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />
          <select
            className="input-base"
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value)}
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <button className="btn-secondary" onClick={sendInvite}>Send Invite</button>
        </div>
        <p className="text-xs text-slate-400">Invite tokens expire in 72 hours and land on the onboarding accept flow.</p>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800 text-left">
              <th className="py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Role</th>
              <th className="py-3">Status</th>
              <th className="py-3">Joined</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-900">
                <td className="py-3">{member.name}</td>
                <td className="py-3">{member.email}</td>
                <td className="py-3">
                  <select
                    className="input-base py-2"
                    value={member.role}
                    onChange={(event) => updateRole(member.id, event.target.value)}
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <span className="badge">{member.status}</span>
                </td>
                <td className="py-3">{member.joined_at ? new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                <td className="py-3">
                  <button className="btn-danger" onClick={() => removeMember(member.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
        <div className="space-y-3">
          {invitations.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 p-4 gap-4">
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-slate-400">{invite.role} • Expires {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString('en-US') : 'in 72 hours'}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => revokeInvite(invite.id)}>Revoke</button>
              </div>
            </div>
          ))}
          {invitations.length === 0 ? <p className="text-sm text-slate-400">No pending invitations.</p> : null}
        </div>
      </div>
    </div>
  );
}
