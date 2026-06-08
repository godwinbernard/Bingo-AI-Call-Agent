'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle };
const COLORS = { success: '#22C55E', error: '#EF4444', warning: '#F59E0B' };
const BG = { success: 'rgba(34,197,94,0.08)', error: 'rgba(239,68,68,0.08)', warning: 'rgba(245,158,11,0.08)' };

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = 'success', message, duration }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    const ttl = duration ?? (type === 'error' ? null : type === 'warning' ? 5000 : 3000);
    if (ttl) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map(({ id, type, message }) => {
            const Icon = ICONS[type] || CheckCircle;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl"
                style={{
                  background: '#1A1A2E',
                  border: `1px solid ${COLORS[type]}44`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${COLORS[type]}22`,
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: BG[type] }}>
                  <Icon size={14} style={{ color: COLORS[type] }} />
                </div>
                <p className="text-sm flex-1" style={{ color: '#F1F1F5' }}>{message}</p>
                <button onClick={() => remove(id)} style={{ color: '#5A5A7A' }}>
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
