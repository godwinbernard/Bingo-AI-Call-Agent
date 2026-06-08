'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  'Company details',
  'Configure calling',
  'Add API keys',
  'Invite team',
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            className="px-4 py-2 rounded-full text-sm"
            style={{ background: index === step ? '#6366F1' : '#1E1E35', color: '#fff' }}
            onClick={() => setStep(index)}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold">Company details</h2>
            <input className="input-base w-full" placeholder="Company name" />
            <input className="input-base w-full" placeholder="Industry" />
            <input className="input-base w-full" placeholder="Team size" />
            <input className="input-base w-full" placeholder="Phone (optional)" />
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">Configure calling</h2>
            <input className="input-base w-full" placeholder="Logo URL" />
            <input className="input-base w-full" placeholder="Timezone" defaultValue="America/New_York" />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-base" placeholder="Start time" defaultValue="08:00" />
              <input className="input-base" placeholder="End time" defaultValue="21:00" />
            </div>
            <input className="input-base w-full" placeholder="Max concurrent calls" defaultValue="5" />
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">Add API keys</h2>
            <input className="input-base w-full" placeholder="Twilio credentials" />
            <input className="input-base w-full" placeholder="Deepgram key" />
            <input className="input-base w-full" placeholder="ElevenLabs key" />
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">Invite team</h2>
            <input className="input-base w-full" placeholder="Email 1" />
            <input className="input-base w-full" placeholder="Email 2" />
            <input className="input-base w-full" placeholder="Email 3" />
          </>
        )}
      </div>

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={() => setStep((value) => Math.max(0, value - 1))}>Back</button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
          onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
        >
          {step === steps.length - 1 ? 'Complete' : 'Continue'}
        </motion.button>
      </div>
    </div>
  );
}
