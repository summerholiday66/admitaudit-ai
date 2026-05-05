# Architecture Notes

## MVP Flow

1. User signs in with Google through Supabase Auth.
2. User selects an essay type and pastes the prompt plus draft.
3. The app collects payment before revealing the full report.
4. The server calls the AI provider with a strict system prompt.
5. The model returns structured JSON only.
6. The UI renders summary scores first and full diagnostics after payment verification.

## Runtime Split

- Next.js app handles product UI, auth-aware routing, and review orchestration.
- Cloudflare-compatible server routes handle protected AI calls.
- A dedicated Worker is reserved for PayPal webhook verification.

## Key Constraints

- Never generate a full final essay on behalf of the user.
- Keep the review output deterministic in shape, even if the wording varies.
- Treat payment confirmation as a server-side source of truth.
