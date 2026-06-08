'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirm', requireTyping, onConfirm, onClose, danger = false }) {
  const [typed, setTyped] = useState('');

  const canConfirm = requireTyping ? typed === requireTyping : true;

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm?.();
    setTyped('');
    onClose?.();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative glass-card p-6 w-full max-w-md"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded"
              style={{ color: '#5A5A7A' }}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)' }}
              >
                <AlertTriangle size={18} style={{ color: danger ? '#EF4444' : '#6366F1' }} />
              </div>
              <h3 className="font-semibold text-base" style={{ color: '#F1F1F5' }}>{title}</h3>
            </div>

            <p className="text-sm mb-5" style={{ color: '#9898B3' }}>{description}</p>

            {requireTyping && (
              <div className="mb-5">
                <p className="text-xs mb-2" style={{ color: '#9898B3' }}>
                  Type <strong style={{ color: '#F1F1F5' }}>{requireTyping}</strong> to confirm:
                </p>
                <input
                  className="input-base"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  placeholder={requireTyping}
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="btn-ghost">Cancel</button>
              <motion.button
                onClick={handleConfirm}
                disabled={!canConfirm}
                whileHover={canConfirm ? { scale: 1.02 } : {}}
                className={danger ? 'btn-danger' : 'btn-primary'}
                style={!canConfirm ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
