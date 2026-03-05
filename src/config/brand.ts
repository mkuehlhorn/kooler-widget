// ONLY edit this file for branding.
// Avatar: replace public/weggy-avatar.jpg with Kooler's avatar image.
// Colors: update primaryColor + accentColor below.
// Everything else in the widget reads from this file — zero hardcoded brand values elsewhere.

export interface BrandConfig {
  agentName: string;
  companyName: string;
  greeting: string;
  callbackSubtitle: string;
  callbackNote: string;
  callbackSuccessTitle: string;
  callbackSuccessMessage: string;
  primaryColor: string;
  accentColor: string;
  avatarPath: string;
  privacyPolicyUrl: string;
  emergencyPhone: string;
  suggestionChips: string[];
}

export const BRAND: BrandConfig = {
  agentName: 'Weggy',
  companyName: 'Kooler Garage Doors',
  greeting:
    "Hi! I'm Weggy, your Kooler Garage Doors assistant. Are you dealing with an emergency, or would you like to schedule a service?",
  callbackSubtitle: 'A Kooler technician will call you shortly',
  callbackNote: "I'll make sure you get the fastest possible service!",
  callbackSuccessTitle: "You're all set!",
  callbackSuccessMessage: "Got it! We'll call you within 30 minutes during business hours.",
  primaryColor: '#E8713A',
  accentColor: '#E8713A',
  avatarPath: '/weggy-avatar.jpg',
  privacyPolicyUrl: 'https://koolergaragedoors.com/privacy',
  emergencyPhone: '+1-XXX-XXX-XXXX', // ← FILL IN before go-live
  suggestionChips: [
    'I need a repair',
    'Schedule an installation',
    'Get a free quote',
    'Emergency service',
  ],
};
