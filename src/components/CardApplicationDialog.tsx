import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Props {
  card: { name: string } | null;
  onClose: () => void;
}

const WEBHOOK_URL = (import.meta.env.VITE_CARD_APPLICATION_WEBHOOK as string | undefined) ?? '';

export default function CardApplicationDialog({ card, onClose }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (card) {
      setFullName('');
      setPhone('');
      setErrors({});
      setSubmitting(false);
    }
  }, [card]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Please enter your full name';
    if (!/^[\d+\-()\s]{6,}$/.test(phone.trim())) next.phone = 'Please enter a valid phone number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !validate()) return;
    setSubmitting(true);

    const payload = {
      card: card.name,
      fullName: fullName.trim(),
      phone: phone.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      if (WEBHOOK_URL) {
        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // No webhook configured — log and pretend it worked so you can develop UX without a backend
        console.warn('[CardApplication] VITE_CARD_APPLICATION_WEBHOOK is not set. Payload:', payload);
      }
      toast.success(`Thanks! We'll be in touch about your ${card.name} application.`);
      onClose();
    } catch (err) {
      console.error('Card application submit failed:', err);
      toast.error('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !submitting) onClose();
  };

  const inputClass =
    'w-full px-3 py-2 border rounded-lg bg-white text-[#182C64] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E74EA] focus:border-transparent transition disabled:opacity-60';

  return (
    <Dialog open={!!card} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle style={{ color: '#182C64' }}>
            Apply for <span style={{ color: '#2E74EA' }}>{card?.name}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Tell us how to reach you — we'll handle the rest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#182C64' }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              style={{ borderColor: errors.fullName ? '#dc2626' : '#cbd5e1' }}
              disabled={submitting}
              autoComplete="name"
            />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#182C64' }}>
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              style={{ borderColor: errors.phone ? '#dc2626' : '#cbd5e1' }}
              disabled={submitting}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="text-white font-bold text-sm px-8 py-2 rounded-lg transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.03]"
              style={{ background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)' }}
            >
              {submitting ? '…' : 'NXT'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
