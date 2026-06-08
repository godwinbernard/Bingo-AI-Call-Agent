'use client';

import { useState } from 'react';

const initialMembers = [
  { name: 'Ava Johnson', email: 'ava@example.com', role: 'OWNER', status: 'Active', joined: 'Jan 2, 2026' },
  { name: 'Sam Lee', email: 'sam@example.com', role: 'MANAGER', status: 'Active', joined: 'Jan 14, 2026' },
];

const initialInvites = [
  { email: 'new.hire@example.com', role: 'VIEWER', expires: '72 hours' },
];

export default function TeamPage() {
  const [members] = useState(initialMembers);
  const [invites] = useState(initialInvites);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-slate-400">3 / 5 seats used</p>
        </div>
        <button className="btn-primary">Invite Member</button>
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
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.email} className="border-b border-slate-900">
                <td className="py-3">{member.name}</td>
                <td className="py-3">{member.email}</td>
                <td className="py-3">{member.role}</td>
                <td className="py-3">{member.status}</td>
                <td className="py-3">{member.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
        <div className="space-y-3">
          {invites.map((invite) => (
            <div key={invite.email} className="flex items-center justify-between rounded-xl bg-slate-900/60 p-4">
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-slate-400">{invite.role} • Expires in {invite.expires}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary">Resend</button>
                <button className="btn-danger">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
