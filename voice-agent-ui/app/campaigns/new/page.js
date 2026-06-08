'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { Check, Upload, ChevronRight, ChevronLeft, Rocket, FileText } from 'lucide-react';
import { MOCK_SCRIPTS } from '@/lib/mockData';

const STEPS = ['Basic Info', 'Upload Contacts', 'Select Script', 'Review & Launch'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
              style={{
                background: i < current ? '#22C55E' : i === current ? '#6366F1' : '#1E1E35',
                border: `2px solid ${i < current ? '#22C55E' : i === current ? '#6366F1' : '#2A2A40'}`,
                color: i <= current ? 'white' : '#5A5A7A',
              }}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span
              className="text-xs mt-1.5 whitespace-nowrap hidden sm:block"
              style={{ color: i <= current ? '#F1F1F5' : '#5A5A7A', fontWeight: i === current ? 600 : 400 }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="flex-1 h-0.5 mx-2 mb-5 hidden sm:block transition-all duration-500"
              style={{ background: i < current ? '#22C55E' : '#2A2A40' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ data, setData }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#9898B3' }}>Campaign Name *</label>
        <input className="input-base" placeholder="e.g. Q4 Sales Outreach" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#9898B3' }}>Description</label>
        <textarea className="input-base" rows={3} placeholder="What's the goal of this campaign?" value={data.description} onChange={e => setData(d => ({ ...d, description: e.target.value }))} style={{ resize: 'vertical' }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#9898B3' }}>
          Max Concurrent Calls: <span style={{ color: '#6366F1' }}>{data.concurrent}</span>
        </label>
        <input type="range" min={1} max={10} value={data.concurrent} onChange={e => setData(d => ({ ...d, concurrent: parseInt(e.target.value) }))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #6366F1 ${(data.concurrent - 1) / 9 * 100}%, #2A2A40 0)` }}
        />
        <div className="flex justify-between mt-1">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <span key={n} className="text-[10px]" style={{ color: '#5A5A7A' }}>{n}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#9898B3' }}>Start Time</label>
          <input type="time" className="input-base" value={data.startTime} onChange={e => setData(d => ({ ...d, startTime: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#9898B3' }}>End Time</label>
          <input type="time" className="input-base" value={data.endTime} onChange={e => setData(d => ({ ...d, endTime: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#9898B3' }}>Timezone</label>
        <select className="input-base" value={data.timezone} onChange={e => setData(d => ({ ...d, timezone: e.target.value }))}>
          <option value="America/New_York">Eastern (ET)</option>
          <option value="America/Chicago">Central (CT)</option>
          <option value="America/Denver">Mountain (MT)</option>
          <option value="America/Los_Angeles">Pacific (PT)</option>
        </select>
      </div>
    </div>
  );
}

function Step2({ data, setData }) {
  const onDrop = useCallback(files => {
    if (files[0]) setData(d => ({ ...d, file: files[0], fileName: files[0].name, contactCount: Math.floor(Math.random() * 400) + 100 }));
  }, [setData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  return (
    <div className="flex flex-col gap-5">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{
          borderColor: isDragActive ? '#6366F1' : '#2A2A40',
          background: isDragActive ? 'rgba(99,102,241,0.05)' : '#1E1E35',
        }}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-3" style={{ color: isDragActive ? '#6366F1' : '#5A5A7A' }} />
        <p className="font-medium mb-1" style={{ color: isDragActive ? '#6366F1' : '#F1F1F5' }}>
          {isDragActive ? 'Drop it here!' : 'Drop your CSV here or click to browse'}
        </p>
        <p className="text-sm" style={{ color: '#5A5A7A' }}>Requires a &quot;phone&quot; column. Optional: first_name, last_name, company</p>
      </div>

      {data.file && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Check size={16} style={{ color: '#22C55E' }} />
            <span className="font-medium text-sm" style={{ color: '#22C55E' }}>{data.fileName} uploaded</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { label: 'Total Contacts', value: data.contactCount, color: '#F1F1F5' },
              { label: 'Valid Numbers', value: Math.floor(data.contactCount * 0.96), color: '#22C55E' },
              { label: 'DNC Filtered', value: Math.floor(data.contactCount * 0.02), color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: '#1E1E35' }}>
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px]" style={{ color: '#5A5A7A' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <button className="btn-ghost text-sm self-start">
        <FileText size={14} />
        Download CSV template
      </button>
    </div>
  );
}

function Step3({ data, setData }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: '#9898B3' }}>Select a script for this campaign, or create a new one.</p>
      <div className="grid grid-cols-1 gap-3">
        {MOCK_SCRIPTS.map(script => (
          <motion.div
            key={script.id}
            onClick={() => setData(d => ({ ...d, scriptId: script.id, scriptName: script.name }))}
            whileHover={{ scale: 1.01 }}
            className="p-4 rounded-xl cursor-pointer transition-all"
            style={{
              background: data.scriptId === script.id ? 'rgba(99,102,241,0.1)' : '#1E1E35',
              border: `1px solid ${data.scriptId === script.id ? '#6366F1' : '#2A2A40'}`,
              boxShadow: data.scriptId === script.id ? '0 0 0 1px rgba(99,102,241,0.3), 0 0 20px rgba(99,102,241,0.1)' : 'none',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>{script.name}</span>
              {data.scriptId === script.id && <Check size={16} style={{ color: '#6366F1' }} />}
            </div>
            <p className="text-xs mb-1" style={{ color: '#9898B3' }}>Goal: {script.goal}</p>
            <p className="text-xs truncate" style={{ color: '#5A5A7A' }}>Agent: {script.agent_name} · {Object.keys(script.objection_responses || {}).length} objection handlers</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Step4({ data }) {
  const [schedule, setSchedule] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-xl" style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
        <h4 className="font-semibold text-sm mb-3" style={{ color: '#F1F1F5' }}>Campaign Summary</h4>
        {[
          { label: 'Name', value: data.name || '—' },
          { label: 'Contacts', value: `${data.contactCount || 0} valid numbers` },
          { label: 'Script', value: data.scriptName || '—' },
          { label: 'Concurrent Calls', value: data.concurrent },
          { label: 'Call Hours', value: `${data.startTime} – ${data.endTime}` },
          { label: 'Timezone', value: data.timezone },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid #2A2A40' }}>
            <span className="text-sm" style={{ color: '#9898B3' }}>{label}</span>
            <span className="text-sm font-medium" style={{ color: '#F1F1F5' }}>{value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
        <span className="text-sm" style={{ color: '#9898B3' }}>Schedule for later</span>
        <button
          onClick={() => setSchedule(s => !s)}
          className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-auto"
          style={{ background: schedule ? '#6366F1' : '#2A2A40' }}
        >
          <motion.div animate={{ x: schedule ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
        </button>
      </div>
    </div>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', description: '', concurrent: 5, startTime: '08:00', endTime: '21:00', timezone: 'America/New_York', file: null, fileName: '', contactCount: 0, scriptId: '', scriptName: '' });

  function canNext() {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return !!data.file;
    if (step === 2) return !!data.scriptId;
    return true;
  }

  function launch() {
    alert(`Campaign "${data.name}" launched! 🚀\n\nIn production this would POST to /campaign/start`);
    router.push('/campaigns');
  }

  const stepComponents = [
    <Step1 key={0} data={data} setData={setData} />,
    <Step2 key={1} data={data} setData={setData} />,
    <Step3 key={2} data={data} setData={setData} />,
    <Step4 key={3} data={data} />,
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <StepIndicator current={step} />

      <div className="glass-card p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#F1F1F5' }}>{STEPS[step]}</h2>
            {stepComponents[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid #2A2A40' }}>
          <button onClick={() => setStep(s => s - 1)} className="btn-ghost" disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={15} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <motion.button onClick={() => setStep(s => s + 1)} disabled={!canNext()} whileHover={canNext() ? { scale: 1.03 } : {}} className="btn-primary" style={{ opacity: canNext() ? 1 : 0.4 }}>
              Next <ChevronRight size={15} />
            </motion.button>
          ) : (
            <motion.button onClick={launch} whileHover={{ scale: 1.03 }} className="btn-primary" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', padding: '12px 28px' }}>
              <Rocket size={16} /> Launch Campaign
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
