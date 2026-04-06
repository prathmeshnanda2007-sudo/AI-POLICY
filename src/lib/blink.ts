import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'ai-policy-simulator-66quhbhr',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_72RtL0w1G9KiDyli5wcci-6FlSIwnf8h',
  auth: { mode: 'headless' },
})
