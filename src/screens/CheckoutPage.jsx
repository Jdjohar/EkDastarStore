// CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('YOUR_PUBLISHABLE_KEY');

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Fetch the client secret from your server
    const fetchClientSecret = async () => {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [{ id: 'item_12345', quantity: 1 }] }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    };

    fetchClientSecret();
  }, []);

  return (
    <div>
      <h1>Checkout Page</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm clientSecret={clientSecret} />
      </Elements>
    </div>
  );
};

export default CheckoutPage;
