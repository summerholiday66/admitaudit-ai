# PayPal Webhook Worker

This directory is reserved for the Cloudflare Worker that validates PayPal webhook events and updates essay order state.

Planned responsibilities:

- verify webhook signatures
- normalize order status updates
- persist payment confirmation for essay unlocks
