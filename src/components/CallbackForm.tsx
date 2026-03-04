import { useState, useCallback } from 'react';
import type { CallbackFormData, CallbackFormErrors, ServiceType, Urgency, WidgetConfig } from '../types';
import { BRAND } from '../config/brand';
import { XIcon } from './Icons';

interface CallbackFormProps {
  onSubmit: (data: CallbackFormData) => Promise<void>;
  onCancel: () => void;
  config: WidgetConfig;
  isSubmitting: boolean;
}

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'repair', label: 'Repair' },
  { value: 'installation', label: 'Installation' },
  { value: 'tune-up', label: 'Tune-Up' },
  { value: 'spring', label: 'Spring Replacement' },
  { value: 'opener', label: 'Opener Service' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'asap', label: 'ASAP' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'flexible', label: 'Flexible' },
];

function validate(data: CallbackFormData): CallbackFormErrors {
  const errors: CallbackFormErrors = {};
  if (!data.name.trim()) errors.name = 'Required';
  const digits = data.phone.replace(/\D/g, '');
  if (digits.length < 10) errors.phone = 'Invalid phone number';
  if (!data.consent) errors.consent = 'Required';
  return errors;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function CallbackForm({ onSubmit, onCancel, config, isSubmitting }: CallbackFormProps) {
  const [formData, setFormData] = useState<CallbackFormData>({
    name: '', phone: '', serviceType: undefined, urgency: undefined, consent: false,
  });
  const [errors, setErrors] = useState<CallbackFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const avatarPath = config.avatarPath ?? BRAND.avatarPath;

  const handleChange = useCallback((field: keyof CallbackFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try { await onSubmit(formData); }
    catch (err) { setSubmitError(err instanceof Error ? err.message : 'Something went wrong.'); }
  }, [formData, onSubmit]);

  return (
    <div className="cb-form-wrap">
      {/* Header — centered, transparent */}
      <div className="cb-form-header">
        <h2 className="cb-form-title">Request a Callback</h2>
        <p className="cb-form-subtitle">Weggy will call you directly</p>
        <button type="button" className="cb-form-close" onClick={onCancel} aria-label="Close">
          <XIcon size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cb-form">
        {submitError && <div className="cb-form-error">{submitError}</div>}

        {/* Row 1: Name + Phone */}
        <div className="cb-form-row">
          <div className="cb-form-field">
            <label>Name *</label>
            <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your name" disabled={isSubmitting} className={errors.name ? 'error' : ''} />
            {errors.name && <span className="cb-form-field-error">{errors.name}</span>}
          </div>
          <div className="cb-form-field">
            <label>Phone *</label>
            <input type="tel" value={formData.phone}
              onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
              placeholder="(970) 123-4567" inputMode="numeric" disabled={isSubmitting}
              className={errors.phone ? 'error' : ''} />
            {errors.phone && <span className="cb-form-field-error">{errors.phone}</span>}
          </div>
        </div>

        {/* Row 2: Service + Urgency */}
        <div className="cb-form-row">
          <div className="cb-form-field">
            <label>Service Type</label>
            <select value={formData.serviceType ?? ''} disabled={isSubmitting}
              onChange={(e) => handleChange('serviceType', e.target.value as ServiceType)}>
              <option value="">Select…</option>
              {SERVICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="cb-form-field">
            <label>When do you need it?</label>
            <select value={formData.urgency ?? ''} disabled={isSubmitting}
              onChange={(e) => handleChange('urgency', e.target.value as Urgency)}>
              <option value="">Select…</option>
              {URGENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Bottom 50/50: portrait LEFT, note+consent+buttons RIGHT */}
        <div className="cb-bottom">
          <div className="cb-portrait-col">
            <div className="cb-portrait">
              <img src={avatarPath} alt="Weggy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            </div>
          </div>
          <div className="cb-right">
            <div className="cb-note">
              <span className="cb-note-title">Weggy's Note</span>
              <p>Ready to get your garage door fixed? I'll make sure the right technician reaches you at the time that works best for you.</p>
            </div>
            <label className={`cb-consent${errors.consent ? ' error' : ''}`}>
              <input type="checkbox" checked={formData.consent}
                onChange={(e) => handleChange('consent', e.target.checked)} disabled={isSubmitting} />
              <span>I agree to be contacted and accept the{' '}
                <a href={BRAND.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </span>
            </label>
            <div className="cb-actions">
              <button type="button" className="cb-btn-cancel" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="cb-btn-submit" disabled={isSubmitting || !formData.consent}>
                {isSubmitting ? 'Calling...' : 'Call Me'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Self-injected styles — PRD spec
const STYLES = `
.cb-form-wrap { display: flex; flex-direction: column; height: 100%; background: transparent; }

/* Header — centered column, transparent */
.cb-form-header {
  display: flex; flex-direction: column; align-items: center;
  padding: 2.5rem 2.5rem 0.5rem; position: relative;
}
.cb-form-title {
  font-size: 0.875rem; font-weight: 600; color: #000; margin: 0;
  text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.cb-form-subtitle { font-size: 0.6rem; color: rgba(0,0,0,0.5); margin: 0.1rem 0 0; text-align: center; }
.cb-form-close {
  position: absolute; top: 2rem; right: 1.2rem; width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 50%;
  cursor: pointer; color: rgba(0,0,0,0.45); transition: all 0.15s ease;
}
.cb-form-close:hover { background: rgba(0,0,0,0.08); color: rgba(0,0,0,0.8); }

/* Form body */
.cb-form { flex: 1; display: flex; flex-direction: column; gap: 0.45rem; padding: 0 0.875rem 0.875rem; }
.cb-form-error {
  background: rgba(239,68,68,0.15); color: #dc2626;
  padding: 0.3rem 0.5rem; border-radius: 8px; font-size: 0.625rem; text-align: center;
}
.cb-form-row { display: flex; gap: 0.5rem; }
.cb-form-field { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.cb-form-field label {
  font-size: 0.5rem; font-weight: 600; color: rgba(0,0,0,0.55);
  text-transform: uppercase; letter-spacing: 0.04em; padding-left: 0.5rem;
}
.cb-form-field input, .cb-form-field select {
  padding: 0.175rem 0.65rem; font-size: 0.6875rem; color: rgba(0,0,0,0.85);
  background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9);
  border-radius: 9999px; outline: none; transition: all 0.15s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05); font-family: inherit;
}
.cb-form-field input:focus, .cb-form-field select:focus {
  background: rgba(255,255,255,0.9); border-color: #E8713A;
  box-shadow: 0 0 0 2px rgba(232,113,58,0.2);
}
.cb-form-field input.error { border-color: #dc2626; background: rgba(239,68,68,0.05); }
.cb-form-field input::placeholder { color: rgba(0,0,0,0.3); }
.cb-form-field select {
  cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0.5rem center; padding-right: 1.4rem;
}
.cb-form-field-error { font-size: 0.55rem; color: #dc2626; padding-left: 0.5rem; }

/* 50/50 bottom split */
.cb-bottom { flex: 1; display: flex; align-items: stretch; padding-top: 0.25rem; }
.cb-portrait-col { width: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
/* 164px circle, zoomed to face, raised */
.cb-portrait {
  width: 164px; height: 164px; border-radius: 50%; overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.22); transform: translateY(-1.75rem);
}
.cb-portrait img {
  width: 100%; height: 100%; object-fit: cover;
  object-position: center 5%; transform: scale(1.7); transform-origin: center 15%;
}
.cb-right {
  width: 50%; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start; gap: 0.5rem; flex-shrink: 0;
}
.cb-note {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center; width: 100%;
}
.cb-note-title { display: block; font-size: 0.8rem; font-weight: 700; color: #111; margin-bottom: 0.3rem; }
.cb-note p { font-size: 0.65rem; line-height: 1.55; color: rgba(0,0,0,0.65); margin: 0; }

.cb-consent {
  display: flex; align-items: flex-start; gap: 0.4rem; width: 100%;
  padding: 0.4rem 0.5rem; background: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.85); border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.15s ease;
}
.cb-consent.error { border-color: rgba(220,38,38,0.5); background: rgba(239,68,68,0.05); }
.cb-consent input[type="checkbox"] {
  width: 12px; height: 12px; margin-top: 1px; accent-color: #E8713A;
  cursor: pointer; flex-shrink: 0;
}
.cb-consent span { font-size: 0.55rem; color: rgba(0,0,0,0.6); line-height: 1.4; }
.cb-consent a { color: #E8713A; text-decoration: underline; }

.cb-actions { display: flex; gap: 0.4rem; width: 100%; }
.cb-btn-cancel, .cb-btn-submit {
  flex: 1; padding: 0.28rem 0; font-size: 0.625rem; font-weight: 600;
  border: none; border-radius: 9999px; cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
}
.cb-btn-cancel {
  background: rgba(255,255,255,0.75); color: rgba(0,0,0,0.65);
  border: 1px solid rgba(0,0,0,0.12); box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.cb-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.95); }
.cb-btn-submit {
  background: #E8713A; color: white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2); text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.cb-btn-submit:hover:not(:disabled) { background: #D4622A; transform: translateY(-1px); }
.cb-btn-submit:disabled, .cb-btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

@media (max-width: 480px) {
  .cb-form-header { padding: 1rem 3rem 0.5rem; }
  .cb-form-title { font-size: 1.1rem; } .cb-form-subtitle { font-size: 0.8rem; }
  .cb-form { padding: 0 1rem 1rem; gap: 0.75rem; }
  .cb-form-row { flex-direction: column; gap: 0.625rem; }
  .cb-form-field label { font-size: 0.75rem; padding-left: 0.75rem; }
  .cb-form-field input, .cb-form-field select { padding: 0.75rem 1rem; font-size: 16px; }
  .cb-bottom { flex-direction: column; align-items: center; gap: 0.875rem; }
  .cb-portrait { width: 80px; height: 80px; }
  .cb-right { width: 100%; }
  .cb-consent span { font-size: 0.875rem; }
  .cb-consent input[type="checkbox"] { width: 18px; height: 18px; }
  .cb-btn-cancel, .cb-btn-submit { padding: 0.75rem 1.25rem; font-size: 0.9375rem; }
}
`
if (typeof document !== 'undefined') {
  const id = 'weggy-callback-form-styles'
  if (!document.getElementById(id)) {
    const el = document.createElement('style'); el.id = id; el.textContent = STYLES; document.head.appendChild(el)
  }
}
