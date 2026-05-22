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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (card) {
      setFullName('');
      setEmail('');
      setPhone('');
      setReason('');
      setErrors({});
      setSubmitting(false);
    }
  }, [card]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Please enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Please enter a valid email';
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
      email: email.trim(),
      phone: phone.trim(),
      reason: reason.trim() || null,
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
              placeholder="Jane Doe"
            />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#182C64' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              style={{ borderColor: errors.email ? '#dc2626' : '#cbd5e1' }}
              disabled={submitting}
              autoComplete="email"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
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
              placeholder="+961 70 000 000"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#182C64' }}>
              Reason <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              style={{ borderColor: '#cbd5e1' }}
              disabled={submitting}
              placeholder="What are you looking for in this card?"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.01]"
            style={{ background: 'linear-gradient(80deg, #182C64 0%, #2E74EA 100%)' }}
          >
            {submitting ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
