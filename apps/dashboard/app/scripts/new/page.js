'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

const VARIABLE_CHIPS = ['{{first_name}}', '{{last_name}}', '{{company_name}}', '{{contact_company}}'];

function VariableHint({ onInsert }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {VARIABLE_CHIPS.map(v => (
        <button key={v} onClick={() => onInsert(v)}
          className="text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>
          {v}
        </button>
      ))}
    </div>
  );
}

function PhonePreview({ script }) {
  const messages = [
    { role: 'assistant', text: script.opening || 'Hello, may I speak with {{first_name}}?' },
    { role: 'user', text: 'Yes, who is this?' },
    { role: 'assistant', text: script.introduction || 'Hi, this is your agent calling...' },
    { role: 'user', text: "What's this about?" },
    { role: 'assistant', text: script.main_pitch || 'I wanted to tell you about...' },
  ];

  return (
    <div className="sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Phone size={14} style={{ color: '#9898B3' }} />
        <h3 className="text-sm font-semibold" style={{ color: '#F1F1F5' }}>Live Preview</h3>
      </div>

      {/* Phone frame */}
      <div
        className="mx-auto rounded-3xl overflow-hidden relative"
        style={{ width: 280, background: '#12121F', border: '2px solid #3A3A55', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-20 h-1.5 rounded-full" style={{ background: '#2A2A40' }} />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ color: '#5A5A7A', borderBottom: '1px solid #1E1E35' }}>
          <span>Call in progress</span>
          <span className="flex items-center gap-1 text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />2:34
          </span>
        </div>

        {/* Chat */}
        <div className="p-3 flex flex-col gap-2" style={{ minHeight: 320, maxHeight: 400, overflowY: 'auto' }}>
          {messages.map((msg, i) => {
            const isAgent = msg.role === 'assistant';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className="max-w-[85%] px-2.5 py-1.5 rounded-2xl text-[11px] leading-relaxed"
                  style={{
                    background: isAgent ? 'rgba(99,102,241,0.2)' : '#1E1E35',
                    color: isAgent ? '#C7D2FE' : '#9898B3',
                    borderTopLeftRadius: isAgent ? 4 : 16,
                    borderTopRightRadius: isAgent ? 16 : 4,
                  }}
                >
                  {msg.text.replace(/\{\{(\w+)\}\}/g, (_, k) => ({ first_name: 'John', company_name: 'InnovateTech', contact_company: 'Acme Corp' })[k] || `[${k}]`)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="px-4 py-3 flex justify-center" style={{ borderTop: '1px solid #1E1E35' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
            <span className="text-red-400">✕</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScriptBuilderPage() {
  const router = useRouter();
  const [script, setScript] = useState({
    name: '',
    goal: '',
    agent_name: 'Alex',
    opening: '',
    introduction: '',
    main_pitch: '',
    call_to_action: '',
    voicemail_script: '',
    success_close: '',
    objections: [{ trigger: '', response: '' }],
  });

  function updateField(field, value) {
    setScript(s => ({ ...s, [field]: value }));
  }

  function insertVariable(field, v) {
    setScript(s => ({ ...s, [field]: (s[field] || '') + v }));
  }

  function addObjection() {
    setScript(s => ({ ...s, objections: [...s.objections, { trigger: '', response: '' }] }));
  }

  function removeObjection(i) {
    setScript(s => ({ ...s, objections: s.objections.filter((_, idx) => idx !== i) }));
  }

  function updateObjection(i, key, value) {
    setScript(s => ({ ...s, objections: s.objections.map((o, idx) => idx === i ? { ...o, [key]: value } : o) }));
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        {/* Form */}
        <div className="flex flex-col gap-5">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#F1F1F5' }}>Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9898B3' }}>Script Name *</label>
                <input className="input-base" placeholder="Sales Outreach v1" value={script.name} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9898B3' }}>Agent Name</label>
                <input className="input-base" placeholder="Alex" value={script.agent_name} onChange={e => updateField('agent_name', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9898B3' }}>Goal</label>
                <input className="input-base" placeholder="Schedule a demo" value={script.goal} onChange={e => updateField('goal', e.target.value)} />
              </div>
            </div>
          </div>

          {[
            { label: 'Opening', field: 'opening', ph: 'Hello, may I speak with {{first_name}}?' },
            { label: 'Introduction', field: 'introduction', ph: 'Hi {{first_name}}, this is {{agent_name}} from {{company_name}}...' },
            { label: 'Main Pitch', field: 'main_pitch', ph: 'We help businesses like {{contact_company}} save...' },
            { label: 'Call to Action', field: 'call_to_action', ph: 'Would you be available for a 15-min demo this week?' },
            { label: 'Voicemail Script', field: 'voicemail_script', ph: 'Hi {{first_name}}, this is a message from...' },
            { label: 'Success Close', field: 'success_close', ph: 'Thank you so much, {{first_name}}! Have a wonderful day!' },
          ].map(({ label, field, ph }) => (
            <div key={field} className="glass-card p-5">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#F1F1F5' }}>{label}</label>
              <textarea
                className="input-base"
                rows={3}
                placeholder={ph}
                value={script[field]}
                onChange={e => updateField(field, e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <VariableHint onInsert={v => insertVariable(field, v)} />
            </div>
          ))}

          {/* Objections */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: '#F1F1F5' }}>Objection Handlers</h3>
              <button onClick={addObjection} className="btn-ghost text-xs px-2 py-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {script.objections.map((obj, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-xl" style={{ background: '#1E1E35', border: '1px solid #2A2A40' }}>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#5A5A7A' }}>Trigger</label>
                      <input className="input-base text-xs py-2" placeholder="not_interested" value={obj.trigger} onChange={e => updateObjection(i, 'trigger', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: '#5A5A7A' }}>Response</label>
                      <input className="input-base text-xs py-2" placeholder="I understand. Could I..." value={obj.response} onChange={e => updateObjection(i, 'response', e.target.value)} />
                    </div>
                  </div>
                  {script.objections.length > 1 && (
                    <button onClick={() => removeObjection(i)} className="mt-5 p-1.5 rounded" style={{ color: '#EF4444' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/scripts')} className="btn-ghost">Cancel</button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => { alert('Script saved! (Mock)'); router.push('/scripts'); }}
              className="btn-primary"
            >
              <Save size={15} />
              Save Script
            </motion.button>
          </div>
        </div>

        {/* Preview panel */}
        <PhonePreview script={script} />
      </div>
    </div>
  );
}
