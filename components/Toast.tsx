'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface ToastApi {
  show: (type: ToastType, title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const STYLES: Record<
  ToastType,
  { icon: typeof Info; accent: string; iconColor: string; ring: string }
> = {
  error: {
    icon: AlertTriangle,
    accent: 'bg-red-500',
    iconColor: 'text-red-500',
    ring: 'ring-red-500/20',
  },
  warning: {
    icon: AlertCircle,
    accent: 'bg-amber-500',
    iconColor: 'text-amber-500',
    ring: 'ring-amber-500/20',
  },
  success: {
    icon: CheckCircle2,
    accent: 'bg-green-500',
    iconColor: 'text-green-500',
    ring: 'ring-green-500/20',
  },
  info: {
    icon: Info,
    accent: 'bg-brand-500',
    iconColor: 'text-brand-500',
    ring: 'ring-brand-500/20',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, title: string, message?: string, duration = 6000) => {
      const id = ++counter.current;
      setToasts((prev) => {
        // De-dupe identical back-to-back messages and cap the stack at 4.
        const next = prev.filter((t) => !(t.title === title && t.message === message));
        return [...next, { id, type, title, message, duration }].slice(-4);
      });
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      error: (title, message) => show('error', title, message),
      success: (title, message) => show('success', title, message),
      info: (title, message) => show('info', title, message),
      warning: (title, message) => show('warning', title, message),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-3 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const style = STYLES[toast.type];
  const Icon = style.icon;

  // Auto-dismiss on a real timer — independent of the (possibly reduced-motion)
  // progress-bar animation, so the toast is always readable for its full duration.
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-200/70 bg-white/80 shadow-xl shadow-slate-900/10 ring-1 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-black/30 ${style.ring}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} aria-hidden="true" />
      <div className="flex items-start gap-3 p-4 pl-5">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.iconColor}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 break-words text-sm text-slate-600 dark:text-slate-300">
              {toast.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Visual countdown bar (purely decorative; dismissal is timer-driven). */}
      <motion.span
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        style={{ transformOrigin: 'left' }}
        className={`absolute bottom-0 left-0 h-0.5 w-full ${style.accent} opacity-60`}
        aria-hidden="true"
      />
    </motion.div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return ctx;
}
