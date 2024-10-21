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
app.use('/', require('./Routes/Webhook'));
// Apply express.json() for all other routes EXCEPT the webhook
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Use your auth routes
app.use('/api/auth', require('./Routes/Auth'));

// Apply the webhook route without express.json() middleware
// Webhook needs express.raw() instead of express.json()




// Start the server
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
