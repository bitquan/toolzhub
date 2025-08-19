# Production Stripe Configuration Commands
# Run these commands to set up your production Stripe keys

# Set the production Stripe secret key (replace with your actual key)
firebase functions:config:set stripe.secret_key="sk_live_YOUR_ACTUAL_SECRET_KEY"

# Set the production Stripe webhook secret (replace with your actual secret)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_ACTUAL_WEBHOOK_SECRET"

# View current configuration (to verify)
firebase functions:config:get

# Deploy the updated configuration
firebase deploy --only functions
