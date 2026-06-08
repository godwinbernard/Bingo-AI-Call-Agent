'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, AlertTriangle, Bell, Sliders } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';

function MaskedInput({ label, placeholder, envKey }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState(null); // null | 'testing' | 'ok' | 'error'

  function testConnection() {
    setStatus('testing');
    setTimeout(() => setStatus(Math.random() > 0.3 ? 'ok' : 'error'), 1500);
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#9898B3' }}>{label}</label>
        <div className="relative">
          <input
            className="input-base pr-10"
            type={show ? 'text' : 'password'}
            placeholder={placeholder}
            value={value}
            onChange={e => { setValue(e.target.value); setStatus(null); }}
          />
          <button
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#5A5A7A' }}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <motion.button
        onClick={testConnection}
        disabled={!value || status === 'testing'}
        whileHover={value && status !== 'testing' ? { scale: 1.02 } : {}}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
        style={{
          background: status === 'ok' ? 'rgba(34,197,94,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : '#1E1E35',
          border: `1px solid ${status === 'ok' ? 'rgba(34,197,94,0.3)' : status === 'error' ? 'rgba(239,68,68,0.3)' : '#2A2A40'}`,
          color: status === 'ok' ? '#22C55E' : status === 'error' ? '#EF4444' : '#9898B3',
          opacity: !value || status === 'testing' ? 0.5 : 1,
        }}
      >
        {status === 'testing' ? <Loader2 size={13} className="animate-spin" /> :
         status === 'ok' ? <CheckCircle size={13} /> :
         status === 'error' ? <XCircle size={13} /> : null}
        {status === 'testing' ? 'Testing...' : status === 'ok' ? 'Connected' : status === 'error' ? 'Failed' : 'Test'}
      </motion.button>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? '#6366F1' : '#2A2A40' }}
    >
      <motion.div animate={{ x: value ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid #2A2A40', paddingBottom: 16 }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
          <Icon size={14} style={{ color: '#6366F1' }} />
        </div>
        <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>{title}</h3>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [concurrent, setConcurrent] = useState(5);
  const [retries, setRetries] = useState(2);
  const [confidence, setConfidence] = useState(0.6);
  const [notifications, setNotifications] = useState({ campaignComplete: true, errorSpike: false });
  const [errorThreshold, setErrorThreshold] = useState(20);
  const [useMockData, setUseMockData] = useState(true);
  const [clearLogsModal, setClearLogsModal] = useState(false);
  const [resetDNCModal, setResetDNCModal] = useState(false);

  return (
    <div className="max-w-2xl flex flex-col gap-6 animate-fade-in">

      {/* Mock Data Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#F1F1F5' }}>Use Mock Data</p>
          <p className="text-xs mt-0.5" style={{ color: '#9898B3' }}>Show demo data without a live backend connection</p>
        </div>
        <Toggle value={useMockData} onChange={setUseMockData} />
      </div>

      {/* API Keys */}
      <Section title="API Configuration" icon={Sliders}>
        <MaskedInput label="Twilio Account SID" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        <MaskedInput label="Twilio Auth Token" placeholder="your_auth_token_here" />
        <MaskedInput label="Twilio Phone Number" placeholder="+15551234567" />
        <MaskedInput label="Deepgram API Key" placeholder="your_deepgram_api_key" />
        <MaskedInput label="ElevenLabs API Key" placeholder="your_elevenlabs_api_key" />
        <MaskedInput label="Anthropic API Key" placeholder="sk-ant-..." />
        <MaskedInput label="Redis URL" placeholder="redis://localhost:6379" />
        <MaskedInput label="PostgreSQL URL" placeholder="postgresql://user:pass@localhost:5432/bingo_ai" />
      </Section>

      {/* Call Settings */}
      <Section title="Call Settings" icon={Sliders}>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: '#9898B3' }}>Max Concurrent Calls</label>
            <span className="text-sm font-semibold" style={{ color: '#6366F1' }}>{concurrent}</span>
          </div>
          <input type="range" min={1} max={10} value={concurrent} onChange={e => setConcurrent(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #6366F1 ${(concurrent - 1) / 9 * 100}%, #2A2A40 0)` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9898B3' }}>Default Start Time</label>
            <input type="time" defaultValue="08:00" className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9898B3' }}>Default End Time</label>
            <input type="time" defaultValue="21:00" className="input-base" />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: '#9898B3' }}>Retry Limit</label>
            <span className="text-sm font-semibold" style={{ color: '#6366F1' }}>{retries}</span>
          </div>
          <input type="range" min={0} max={3} value={retries} onChange={e => setRetries(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #6366F1 ${retries / 3 * 100}%, #2A2A40 0)` }}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: '#9898B3' }}>STT Confidence Threshold</label>
            <span className="text-sm font-semibold" style={{ color: '#6366F1' }}>{confidence}</span>
          </div>
          <input type="range" min={0} max={1} step={0.05} value={confidence} onChange={e => setConfidence(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #6366F1 ${confidence * 100}%, #2A2A40 0)` }}
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {[
          { key: 'campaignComplete', label: 'Email on campaign completion', desc: 'Get notified when a campaign finishes' },
          { key: 'errorSpike', label: 'Email on error spike', desc: `Alert when error rate exceeds ${errorThreshold}%` },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#F1F1F5' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>{desc}</p>
            </div>
            <Toggle value={notifications[key]} onChange={v => setNotifications(n => ({ ...n, [key]: v }))} />
          </div>
        ))}

        {notifications.errorSpike && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#9898B3' }}>Error Threshold (%)</label>
            <input type="number" min={5} max={100} value={errorThreshold} onChange={e => setErrorThreshold(parseInt(e.target.value))} className="input-base w-32" />
          </motion.div>
        )}
      </Section>

      {/* Danger Zone */}
      <div className="glass-card p-6" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', paddingBottom: 16 }}>
          <AlertTriangle size={14} style={{ color: '#EF4444' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#EF4444' }}>Danger Zone</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#F1F1F5' }}>Clear All Call Logs</p>
              <p className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>Permanently delete all call history from the database</p>
            </div>
            <button onClick={() => setClearLogsModal(true)} className="btn-danger flex-shrink-0">Clear Logs</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#F1F1F5' }}>Reset DNC List</p>
              <p className="text-xs mt-0.5" style={{ color: '#5A5A7A' }}>Remove all numbers from the Do Not Call list</p>
            </div>
            <button onClick={() => setResetDNCModal(true)} className="btn-danger flex-shrink-0">Reset DNC</button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary self-start">
        Save Settings
      </motion.button>

      <ConfirmModal
        open={clearLogsModal}
        title="Clear All Call Logs"
        description="This will permanently delete all call logs. This action cannot be undone."
        confirmLabel="Delete All Logs"
        requireTyping="CONFIRM"
        onConfirm={() => alert('Logs cleared (mock)')}
        onClose={() => setClearLogsModal(false)}
        danger
      />
      <ConfirmModal
        open={resetDNCModal}
        title="Reset DNC List"
        description="This will remove all numbers from the DNC list. Any phone number could be called again."
        confirmLabel="Reset DNC List"
        requireTyping="CONFIRM"
        onConfirm={() => alert('DNC reset (mock)')}
        onClose={() => setResetDNCModal(false)}
        danger
      />
    </div>
  );
}
