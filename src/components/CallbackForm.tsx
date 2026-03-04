import { useState, useCallback } from 'react';
import type {
  CallbackFormData,
  CallbackFormErrors,
  ServiceType,
  Urgency,
  WidgetConfig,
} from '../types';
import { BRAND } from '../config/brand';
import { XIcon } from './Icons';

interface CallbackFormProps {
  onSubmit: (data: CallbackFormData) => Promise<void>;
  onCancel: () => void;
  config: WidgetConfig;
  isSubmitting: boolean;
}

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
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

function validateForm(data: CallbackFormData): CallbackFormErrors {
  const errors: CallbackFormErrors = {};
  if (!data.name.trim()) {
    errors.name = 'Please enter your name.';
  }
  const digitsOnly = data.phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    errors.phone = 'Please enter a valid 10-digit phone number.';
  }
  if (!data.consent) {
    errors.consent = 'Please accept the terms to continue.';
  }
  return errors;
}

function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function CallbackForm({
  onSubmit,
  onCancel,
  config,
  isSubmitting,
}: CallbackFormProps) {
  const [formData, setFormData] = useState<CallbackFormData>({
    name: '',
    phone: '',
    serviceType: undefined,
    urgency: undefined,
    consent: false,
  });
  const [errors, setErrors] = useState<CallbackFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const avatarPath = config.avatarPath ?? BRAND.avatarPath;
  const callbackNote = BRAND.callbackNote;
  const callbackSubtitle = BRAND.callbackSubtitle;
  const privacyUrl = BRAND.privacyPolicyUrl;

  const handleChange = useCallback(
    (field: keyof CallbackFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneInput(e.target.value);
      handleChange('phone', formatted);
    },
    [handleChange]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      try {
        await onSubmit(formData);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.'
        );
      }
    },
    [formData, onSubmit]
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    background: 'white',
    color: '#111827',
    transition: 'border-color 150ms ease',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
  };

  const errorStyle: React.CSSProperties = {
    color: '#dc2626',
    fontSize: 11,
    marginTop: 3,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'var(--widget-primary)' }}
      >
        <div>
          <div className="text-white font-semibold text-sm">Request a Call</div>
          <div className="text-white/70 text-xs">{callbackSubtitle}</div>
        </div>
        <button
          onClick={onCancel}
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cancel"
        >
          <XIcon size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <form
          onSubmit={handleSubmit}
          className="weggy-callback-form-layout flex h-full"
        >
          {/* Left column — avatar */}
          <div
            className="weggy-callback-avatar-col shrink-0 flex flex-col items-center justify-center p-6 gap-4"
            style={{
              width: 164,
              background: 'rgba(27,47,91,0.04)',
              borderRight: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="rounded-full overflow-hidden"
              style={{ width: 120, height: 120 }}
            >
              <img
                src={avatarPath}
                alt={config.agentName}
                width={120}
                height={120}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  width: 120,
                  height: 120,
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-center">
              <div
                className="text-xs font-semibold"
                style={{ color: 'var(--widget-primary)' }}
              >
                {config.agentName} says:
              </div>
              <div
                className="text-xs text-gray-500 mt-1 italic leading-snug"
                style={{ maxWidth: 120 }}
              >
                "{callbackNote}"
              </div>
            </div>
          </div>

          {/* Right column — fields */}
          <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto no-scrollbar">
            {/* Name */}
            <div>
              <label htmlFor="cb-name" style={labelStyle}>
                Your Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="cb-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Jane Smith"
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? '#ef4444' : '#e5e7eb',
                }}
                autoComplete="name"
              />
              {errors.name && <div style={errorStyle}>{errors.name}</div>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="cb-phone" style={labelStyle}>
                Phone Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="cb-phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(970) 123-4567"
                inputMode="numeric"
                style={{
                  ...inputStyle,
                  borderColor: errors.phone ? '#ef4444' : '#e5e7eb',
                }}
                autoComplete="tel"
              />
              {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
            </div>

            {/* Service Type */}
            <div>
              <label htmlFor="cb-service" style={labelStyle}>
                Service Type
              </label>
              <select
                id="cb-service"
                value={formData.serviceType ?? ''}
                onChange={(e) =>
                  handleChange(
                    'serviceType',
                    e.target.value as ServiceType
                  )
                }
                style={selectStyle}
              >
                <option value="">Select service…</option>
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="cb-urgency" style={labelStyle}>
                When do you need service?
              </label>
              <select
                id="cb-urgency"
                value={formData.urgency ?? ''}
                onChange={(e) =>
                  handleChange('urgency', e.target.value as Urgency)
                }
                style={selectStyle}
              >
                <option value="">Select timing…</option>
                {URGENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-2 mt-1">
              <input
                id="cb-consent"
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => handleChange('consent', e.target.checked)}
                style={{
                  marginTop: 2,
                  accentColor: 'var(--widget-primary)',
                  cursor: 'pointer',
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="cb-consent"
                style={{ fontSize: 11, color: '#6b7280', cursor: 'pointer' }}
              >
                I agree to be contacted by Kooler Garage Doors. View our{' '}
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--widget-primary)', textDecoration: 'underline' }}
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {errors.consent && (
              <div style={{ ...errorStyle, marginTop: 0 }}>{errors.consent}</div>
            )}

            {/* Server error */}
            {submitError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#dc2626',
                }}
              >
                {submitError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{
                  border: '1.5px solid #e5e7eb',
                  color: '#6b7280',
                  background: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
                style={{
                  background: isSubmitting ? '#9ca3af' : 'var(--widget-primary)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  border: 'none',
                  outline: 'none',
                }}
              >
                {isSubmitting ? 'Sending…' : 'Request Call'}
              </button>
            </div>

            {/* Bottom padding for scroll */}
            <div style={{ height: 8 }} />
          </div>
        </form>
      </div>
    </div>
  );
}
