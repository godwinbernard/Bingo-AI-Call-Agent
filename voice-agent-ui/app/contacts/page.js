'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Upload, Download, AlertTriangle, Trash2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { MOCK_CONTACTS, MOCK_DNC } from '@/lib/mockData';
import { formatPhone, formatRelativeTime, maskPhone } from '@/lib/utils';

const TABS = ['All Contacts', 'DNC List'];

export default function ContactsPage() {
  const [tab, setTab] = useState('All Contacts');
  const [search, setSearch] = useState('');
  const [dnc, setDnc] = useState(MOCK_DNC);
  const [newDncNumber, setNewDncNumber] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);

  const filteredContacts = MOCK_CONTACTS.filter(c =>
    !search || `${c.first_name} ${c.last_name} ${c.phone} ${c.company}`.toLowerCase().includes(search.toLowerCase())
  );

  function addToDNC() {
    if (!newDncNumber.trim()) return;
    setDnc(prev => [...prev, { phone: newDncNumber.trim(), added_at: new Date().toISOString(), reason: 'Manual' }]);
    setNewDncNumber('');
  }

  function removeFromDNC(phone) {
    setDnc(prev => prev.filter(d => d.phone !== phone));
    setRemoveTarget(null);
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl self-start" style={{ background: '#1A1A2E', border: '1px solid #2A2A40' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === t ? '#6366F1' : 'transparent', color: tab === t ? 'white' : '#9898B3' }}
          >
            {t}
            {t === 'DNC List' && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: tab === t ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.15)', color: tab === t ? 'white' : '#EF4444' }}>
                {dnc.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'All Contacts' ? (
          <motion.div key="contacts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5A5A7A' }} />
                <input className="input-base pl-9" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn-ghost"><Upload size={14} /> Import CSV</button>
              <button className="btn-ghost"><Download size={14} /> Export</button>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Phone</th><th>Company</th><th>Last Called</th><th>Last Outcome</th><th>Calls</th></tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: 'white' }}>
                              {c.first_name[0]}{c.last_name[0]}
                            </div>
                            <span className="font-medium">{c.first_name} {c.last_name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#9898B3', fontFamily: 'monospace', fontSize: 12 }}>{maskPhone(c.phone)}</td>
                        <td style={{ color: '#9898B3' }}>{c.company}</td>
                        <td style={{ color: '#5A5A7A', fontSize: 12 }}>{formatRelativeTime(c.last_called)}</td>
                        <td>{c.last_outcome ? <StatusBadge status={c.last_outcome} /> : <span style={{ color: '#5A5A7A' }}>—</span>}</td>
                        <td style={{ color: '#9898B3', textAlign: 'center' }}>{c.call_count}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="dnc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            {/* Warning banner */}
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: '#9898B3' }}>
                Numbers on this list will <strong style={{ color: '#F1F1F5' }}>never be dialed</strong>, regardless of campaign settings.
              </p>
            </div>

            {/* Add number */}
            <div className="flex gap-3">
              <input
                className="input-base flex-1"
                placeholder="+1 (555) 000-0000"
                value={newDncNumber}
                onChange={e => setNewDncNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addToDNC()}
              />
              <motion.button onClick={addToDNC} whileHover={{ scale: 1.02 }} className="btn-primary flex-shrink-0">
                <Plus size={15} /> Add to DNC
              </motion.button>
            </div>

            {/* DNC table */}
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Phone Number</th><th>Reason</th><th>Added</th><th style={{ width: 60 }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {dnc.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10" style={{ color: '#5A5A7A' }}>DNC list is empty</td></tr>
                    ) : dnc.map((entry, i) => (
                      <motion.tr key={entry.phone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                        <td style={{ fontFamily: 'monospace', color: '#EF4444', fontSize: 13 }}>{formatPhone(entry.phone)}</td>
                        <td style={{ color: '#9898B3' }}>{entry.reason}</td>
                        <td style={{ color: '#5A5A7A', fontSize: 12 }}>{formatRelativeTime(entry.added_at)}</td>
                        <td>
                          <button onClick={() => setRemoveTarget(entry.phone)} className="p-1.5 rounded" style={{ color: '#EF4444' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!removeTarget}
        title="Remove from DNC"
        description={`Are you sure you want to remove ${removeTarget} from the DNC list? This number may be called again in future campaigns.`}
        confirmLabel="Remove"
        onConfirm={() => removeFromDNC(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        danger
      />
    </div>
  );
}
