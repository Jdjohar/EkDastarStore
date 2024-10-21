global.foodData = require('./db')(function call(err, data, CatData) {
  if (err) console.log(err);
  global.foodData = data;
  global.foodCategory = CatData;
});

const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const router = express.Router();

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'uploads')));

// CORS setup
app.use((req, res, next) => {
  const corsWhitelist = [
    "https://online-services-ten.vercel.app",
    "http://localhost:5173",
    "https://gnj.vercel.app",
  ];
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, X-Requested-With, Accept");
  }
  next();
});

// Apply express.json() for all other routes EXCEPT the webhook
// app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Use your auth routes
app.use('/api/auth', require('./Routes/Auth'));

// Apply the webhook route without express.json() middleware
// Webhook needs express.raw() instead of express.json()
app.use('/', require('./Routes/Webhook'));

// Webhook route that needs the raw body to verify the signature
// app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   console.log("Start:sdvs", typeof req.body);

//   // Check the type of req.body
//   if (Buffer.isBuffer(req.body)) {
//     console.log('req.body is a Buffer');
//     console.log('Raw Body String:', req.body.toString('utf-8')); // Convert Buffer to string for logging
//   } else if (typeof req.body === 'string') {
//     console.log('req.body is a string');
//   } else if (typeof req.body === 'object') {
//     console.log('req.body is a parsed JavaScript object');
//   } else {
//     console.log('req.body is of some other type');
//   }

//   let event;
//   try {
//     // Verify the event by reconstructing it with the raw body and the signature
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     console.log('✅ Event verified:', event);
//   } catch (err) {
//     console.error('❌ Webhook signature verification failed:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event based on the type
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       console.log('💰 PaymentIntent was successful:', paymentIntent);
//       // Handle the payment success (e.g., update order in the database)
//       break;
//     case 'payment_intent.payment_failed':
//       const failedPaymentIntent = event.data.object;
//       console.log('❌ PaymentIntent failed:', failedPaymentIntent);
//       // Handle the payment failure
//       break;
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   res.status(200).json({ received: true });
// });
// app.post('/login', express.raw(), (req, res) => {
//   const requestBody = req.body; // This will be a string now

//   console.log("Received body as string:", requestBody);
//   console.log("Received body as string:", typeof requestBody);

//   // Parse the requestBody string if needed
//   const params = new URLSearchParams(requestBody);
//   const username = params.get('username');
//   const password = params.get('password');

//   if (!username || !password) {
//       return res.status(400).send("Username and password are required."); // Return plain string
//   }

//   // Logic for authenticating the user
//   res.send("Login successful!"); // Return a plain string
// });

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
