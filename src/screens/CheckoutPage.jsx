import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_gWZwqYPAe0EzDOJKNHAELYvi00I62Rx5tz');

const CheckoutPage = () => {
  return (
    <div>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default CheckoutPage;
