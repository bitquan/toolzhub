import { loadStripe } from '@stripe/stripe-js';
import { User } from '../types';

// Safe env accessor for TS
const env: Record<string, any> = (import.meta as any)?.env || {};

const stripePromise = loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY);

// Pro plan price ID - this should be configured in your Stripe dashboard
const PRO_PRICE_ID = env.VITE_STRIPE_PRO_PRICE_ID || 'price_test';

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export class SubscriptionService {
  private static instance: SubscriptionService;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async createCheckoutSession(
    user: User,
    priceId: string = PRO_PRICE_ID
  ): Promise<CreateCheckoutSessionResponse> {
    try {
      // Build the Firebase Functions URL
      const functionsBaseUrl = env.DEV
        ? 'http://localhost:5001/toolzhub-5014-31157/us-central1/api'
        : `https://us-central1-${env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/api`;

      console.log('Using functions URL:', functionsBaseUrl);
      console.log('Environment mode:', env.DEV ? 'development' : 'production');

      const response = await fetch(
        `${functionsBaseUrl}/stripe/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId: user.uid,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Response error:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        // Check if this is a Stripe configuration issue in development
        if (
          env.DEV &&
          (errorData.error?.includes('dummy') ||
            errorData.error?.includes('Invalid API Key') ||
            errorText.includes('dummy') ||
            errorText.includes('Invalid API Key'))
        ) {
          console.warn(
            'Development mode: Stripe not configured with real keys'
          );
          throw new Error('STRIPE_NOT_CONFIGURED');
        }

        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.error || errorText
          }`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);

      if (error instanceof Error && error.message === 'STRIPE_NOT_CONFIGURED') {
        throw error;
      }

      throw new Error('Failed to create checkout session');
    }
  }

  async redirectToCheckout(
    user: User,
    priceId: string = PRO_PRICE_ID
  ): Promise<void> {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { sessionId } = await this.createCheckoutSession(user, priceId);

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  async upgradeToProWithRedirect(user: User): Promise<void> {
    if (!user) {
      throw new Error('User must be logged in to upgrade');
    }

    if (
      user.subscription?.plan === 'pro' &&
      user.subscription?.status === 'active'
    ) {
      throw new Error('User already has an active Pro subscription');
    }

    try {
      return await this.redirectToCheckout(user);
    } catch (error) {
      console.log('Upgrade error details:', error);

      if (error instanceof Error) {
        if (error.message === 'STRIPE_NOT_CONFIGURED') {
          // In development mode with dummy Stripe keys, show a demo message
          alert(
            "🎉 Demo Mode: Upgrade to Pro successful!\n\nIn production, this would redirect you to Stripe checkout to complete the payment.\n\nFor this demo, we'll simulate a successful upgrade."
          );

          // In a real app, you might want to update the user's subscription status locally for demo purposes
          console.log('Demo: Would upgrade user to Pro plan');
          return;
        }

        // Check if this is a Firebase functions connectivity issue
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')
        ) {
          throw new Error(
            'Unable to connect to payment service. Please check if Firebase emulators are running.'
          );
        }

        // Check if this is still a Stripe API key issue even in production
        if (error.message.includes('Invalid API Key')) {
          alert(
            '🔧 Configuration Issue: Payment system not properly configured.\n\nThis appears to be a server configuration issue. Please contact support.'
          );
          return;
        }
      }

      throw error;
    }
  }

  async handleSuccessfulUpgrade(sessionId: string): Promise<void> {
    // This could be used to show success messages or track analytics
    console.log('Subscription upgrade successful:', sessionId);

    // You could add analytics tracking here
    // analytics.track('subscription_upgrade_completed', { sessionId });
  }

  isProUser(user: User | null): boolean {
    return (
      user?.subscription?.plan === 'pro' &&
      user?.subscription?.status === 'active'
    );
  }

  canUpgrade(user: User | null): boolean {
    if (!user) return false;
    return !this.isProUser(user);
  }

  getUpgradeButtonText(user: User | null): string {
    if (!user) return 'Sign in to Upgrade';
    if (this.isProUser(user)) return 'Pro Member';
    return 'Upgrade to Pro';
  }

  shouldShowUpgradeButton(user: User | null): boolean {
    return this.canUpgrade(user);
  }
}

export const subscriptionService = SubscriptionService.getInstance();
