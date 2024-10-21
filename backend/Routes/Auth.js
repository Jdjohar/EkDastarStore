const express = require('express')
const User = require('../models/User')
const Order = require('../models/Orders')
const Products = require('../models/Product')
const Category = require('../models/Category')
const Checkout = require('../models/CheckOut')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const axios = require('axios')
const fetch = require('../middleware/fetchdetails');
const jwtSecret = "HaHa"
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// const stripe = new Stripe('sk_test_2rB0Mi5MPMyUYAnUv8on1Oef00ZIaFF3Tr');
const stripe = require('stripe')('sk_test_2rB0Mi5MPMyUYAnUv8on1Oef00ZIaFF3Tr');
const cloudinary = require('../cloudinaryConfig');

// Create a Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for file uploads
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Set a unique filename for each uploaded file
  },
});

const upload = multer({ storage: storage });



// var foodItems= require('../index').foodData;
// require("../index")
//Creating a user and storing data to MongoDB Atlas, No Login Requiered
router.post('/createuser', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').isLength({ min: 3 })
], async (req, res) => {
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() })
  }
  // console.log(req.body)
  // let user = await User.findOne({email:req.body.email})
  const salt = await bcrypt.genSalt(10)
  let securePass = await bcrypt.hash(req.body.password, salt);
  try {
    await User.create({
      name: req.body.name,
      // password: req.body.password,  first write this and then use bcryptjs
      password: securePass,
      email: req.body.email,
      location: req.body.location
    }).then(user => {
      const data = {
        user: {
          id: user.id
        }
      }
      const authToken = jwt.sign(data, jwtSecret);
      success = true
      res.json({ success, authToken })
    })
      .catch(err => {
        console.log(err);
        res.json({ error: "Please enter a unique value." })
      })
  } catch (error) {
    console.error(error.message)
  }
})



//Get a Product
// Endpoint for fetching product details
router.get('/getproducts/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(
      {
        status: 'success',
        data: product
      }
    )

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Create a Product

router.post('/products', async (req, res) => {
  console.log("Products");

  try {
    console.log("start try");
    const newProduct = new Products(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

})




// Authentication a User, No login Requiered
router.post('/login', [
  body('email', "Enter a Valid Email").isEmail(),
  body('password', "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });  //{email:email} === {email}
    if (!user) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }

    const pwdCompare = await bcrypt.compare(password, user.password); // this return true false.
    if (!pwdCompare) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
    }
    const data = {
      user: {
        id: user.id,
        role: user.role
      }
    }
    console.log(data, "data");
    success = true;
    const authToken = jwt.sign(data, jwtSecret);
    res.json({ success, userId: data.user.id, authToken, role: data.user.role })


  } catch (error) {
    console.error(error.message)
    res.send("Server Error")
  }
})

// Get logged in User details, Login Required.
router.post('/getuser', fetch, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password") // -password will not pick password from db.
    res.send(user)
  } catch (error) {
    console.error(error.message)
    res.send("Server Error")

  }
})
// Get logged in User details, Login Required.
router.post('/getlocation', async (req, res) => {
  try {
    let lat = req.body.latlong.lat
    let long = req.body.latlong.long
    console.log(lat, long)
    let location = await axios
      .get("https://api.opencagedata.com/geocode/v1/json?q=" + lat + "+" + long + "&key=74c89b3be64946ac96d777d08b878d43")
      .then(async res => {
        // console.log(`statusCode: ${res.status}`)
        console.log(res.data.results)
        // let response = stringify(res)
        // response = await JSON.parse(response)
        let response = res.data.results[0].components;
        console.log(response)
        let { village, county, state_district, state, postcode } = response
        return String(village + "," + county + "," + state_district + "," + state + "\n" + postcode)
      })
      .catch(error => {
        console.error(error)
      })
    res.send({ location })

  } catch (error) {
    console.error(error.message)
    res.send("Server Error")

  }
})
router.post('/foodData', async (req, res) => {
  try {
    // console.log( JSON.stringify(global.foodData))
    // const userId = req.user.id;
    // await database.listCollections({name:"food_items"}).find({});
    res.send([global.foodData, global.foodCategory])

  } catch (error) {
    console.error(error.message)
    res.send("Server Error")

  }
})

router.post('/orderData', async (req, res) => {
  let data = req.body.order_data
  await data.splice(0, 0, { Order_date: req.body.order_date })
  console.log("1231242343242354", req.body.email)

  //if email not exisitng in db then create: else: InsertMany()
  let eId = await Order.findOne({ 'email': req.body.email })
  console.log(eId)
  if (eId === null) {
    try {
      console.log(data)
      console.log("1231242343242354", req.body.email)
      await Order.create({
        email: req.body.email,
        order_data: [data]
      }).then(() => {
        res.json({ success: true })
      })
    } catch (error) {
      console.log(error.message)
      res.send("Server Error", error.message)

    }
  }

  else {
    try {
      await Order.findOneAndUpdate({ email: req.body.email },
        { $push: { order_data: data } }).then(() => {
          res.json({ success: true })
        })
    } catch (error) {
      console.log(error.message)
      res.send("Server Error", error.message)
    }
  }
})

router.post('/checkoutOrder', async (req, res) => {
  try {
    const { billingAddress,userId,userEmail, shippingAddress, orderItems, totalAmount, shippingMethod, shippingCost, paymentMethod } = req.body;
    // const userId = req.user.id;  // Assuming req.user is set by the auth middleware

    // Validate request
    if (!billingAddress || !shippingAddress || !orderItems || !totalAmount || !shippingMethod || !paymentMethod) {
      return res.status(400).json({ msg: 'All required fields must be filled' });
    }

    // Create a new order
    const newOrder = new Checkout({
      userId,
      userEmail, // Assuming req.user has email
      billingAddress,
      shippingAddress,
      orderItems,
      totalAmount,
      paymentStatus: 'pending', // Default as pending, will be updated after payment
      shippingMethod,
      shippingCost,
      paymentMethod
    });

    console.log(userId, "userId========");
    
    // Save the order to the database
    const order = await newOrder.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route    POST /api/checkout/payment
// @desc     Process payment using Stripe
// @access   Private
router.post('/payment', async (req, res) => {
  const { amount, description, userEmail, billingAddress,shippingAddress } = req.body;  // amount should be in cents (e.g., 2500 for $25.00)
  console.log('Received billingAddress:', billingAddress,shippingAddress);
 
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      // name:"billingAddress.firstName",
      // address:"billingAddress.streetAddress",
      currency: 'INR', // Change to your desired currency
      payment_method_types: ['card'],
      description: description,
      shipping: {
        name: billingAddress.name,
        address: {
          line1: 'billing_details.streetAddress',
          city: 'Muktsare',
          postal_code: '152026',
          country: 'IN',
        },
      },
      payment_method_data: {
        type: 'card', // This line specifies the type of payment method
        card: {
          number: "4242424242424242",
          exp_month: 12,
          exp_year: 2024,
          cvc: "123"
        },
        
        billing_details: {
          address: {
            line1: "billingAddress.streetAddress",
            city: "billingAddress.city",
            state: "billingAddress.province",
            postal_code: "billingAddress.postalCode",
            country: "IN",
          },
          name: billingAddress.firstName, // Ensure this is filled
          email: userEmail || "jdeep514@gmail.com",     // Ensure this is filled
          phone: "billingAddress.phone",
        },
      },
    });
    console.log(paymentIntent, "paymentIntent ===================");
    console.log(billingAddress, "paymentIntent ===================");
    
    res.json({ clientSecret: paymentIntent.client_secret });
    // const paymentConfirm = await stripe.paymentIntents.confirm(
    //   paymentIntent.id,
    //   { payment_method: "pm_card_visa" }
    // );
    // res.status(200).send(paymentConfirm);
    // console.log(paymentConfirm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Payment processing failed' });
  }
});

router.post('/create-customer', async (req, res) => {
  const { name, email, phone, address } = req.body;
  const customer = await stripe.customers.create({
      name,
      email,
      phone,
      address,
  });
  res.json({ customerId: customer.id });
});

// Create PaymentIntent endpoint
router.post('/create-intent', async (req, res) => {
  try {
    // Destructure the data received from the frontend
    const { amount, currency, billing_details } = req.body;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: '50000', // Amount in cents
      currency: 'inr',
      payment_method_types: ['card'], // Specify payment method types
      receipt_email: 'jdeep514@gmail.com', // Optional: add receipt email
      description: 'Export tshirts', // Add a description
      shipping: {
        name: 'jashandeep Singh',
        address: {
          line1: 'billing_details.streetAddress',
          city: 'Muktsare',
          postal_code: '152026',
          country: 'IN',
        },
      },
    });
    console.log(paymentIntent,"paymentIntent");
    // Send the client secret back to the client
    // res.send({ client_secret: paymentIntent.client_secret });
    const paymentConfirm = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: "pm_card_visa" }
    );
    res.status(200).send(paymentConfirm);
    console.log(paymentConfirm);
    
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send({ error: error.message });
  }
 

});

const endpointSecret = 'your-webhook-signing-secret';
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Invalid signature
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object; // Contains the payment intent details
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Update your order/payment status in your database here
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.log(`PaymentIntent for ${failedIntent.amount} has failed.`);
      // Handle failed payment here
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// @route    PUT /api/checkout/:id/paymentStatus
// @desc     Update payment status after successful payment
// @access   Private
router.put('/:id/paymentStatus', async (req, res) => {
  const { paymentStatus } = req.body;
  try {
    let order = await Checkout.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if the user making the request is the owner of the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    order.paymentStatus = paymentStatus;  // Update the payment status

    // Save the updated order
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/myOrderData', async (req, res) => {
  try {
    console.log(req.body.email)
    let eId = await Order.findOne({ 'email': req.body.email })
    //console.log(eId)
    res.json({ orderData: eId })
  } catch (error) {
    res.send("Error", error.message)
  }


});

router.get('/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Define a route to handle product creation
// router.post('/addproducts', upload.single('img'), async (req, res) => {

//     try {
//       // Extract product data from the request body
//       const { name, description, CategoryName, options } = req.body;
//       const img = req.file.filename;
//       //   const optionss = JSON.parse(options);
//       console.log(img);
//       // Create a new product instance
//       const newProduct = new Products({
//           name,
//           description,
//           CategoryName,
//           img:`https://store-ywot.onrender.com/${img}`,
//           options: JSON.parse(options)
//         });

//         console.log(newProduct.options);
//         console.log(newProduct.CategoryName);


//       // Save the product to the database
//       const savedProduct = await newProduct.save();
//         res.status(201).json({
//             status: 'success',
//             data: savedProduct
//           });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

// Define a route to handle product creation with Cloudinary image upload
router.post('/addproducts', upload.single('img'), async (req, res) => {
  try {
    // Extract product data from the request body
    const { name, description, CategoryName, options } = req.body;
    const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: 'employeeApp', // Use the preset from Cloudinary
    });

    // Create a new product instance with the Cloudinary URL
    const newProduct = new Products({
      name,
      description,
      CategoryName,
      img: uploadedImg.secure_url, // Cloudinary image URL
      options: JSON.parse(options),
    });



    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Update global food data
    global.foodData.push(savedProduct); // Add the new product to the global variable

    res.status(201).json({
      status: 'success',
      data: savedProduct,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to handle product creation
router.post('/api/category', upload.single('catimg'), async (req, res) => {

  try {
    // Extract product data from the request body
    const { CategoryName } = req.body;
    const img = req.file.filename;
    //   const optionss = JSON.parse(options);
    console.log(img);
    // Create a new product instance
    const newCategory = new Category({

      CategoryName,
      img: `https://store-ywot.onrender.com/${img}`,
    });



    // Save the product to the database
    const savedCategory = await newCategory.save();
    res.status(201).json({
      status: 'success',
      data: savedCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//get a list of Category
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//forgotPassword api
const resetTokens = {};
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save the reset token and its expiry date in the database
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();


    // Send a password reset email to the user
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure: false,
      auth: {
        user: "jdwebservices1@gmail.com",
        pass: "cwoxnbrrxvsjfbmr"
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: 'jdwebservices1@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      message: 'Password reset email sent. Check your inbox.',
      resetToken: resetToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});


// Reset password endpoint
router.post('/reset-password/:resetToken', async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    // Find user by reset token
    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10)
    let securePass = await bcrypt.hash(password, salt);

    // Update password and reset token
    user.password = securePass; // In a real-world scenario, remember to hash the password
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Save the updated user
    await user.save();

    return res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Route to handle payments
// router.post('/payment', async (req, res) => {
//   const { amount } = req.body;

//   try {
//       const paymentIntent = await stripe.paymentIntents.create({
//           amount,
//           currency: 'inr',
//           automatic_payment_methods: {
//               enabled: true,
//               allow_redirects: 'never',
//           },
//           description
//       });

//       res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//       console.error('Error creating payment intent:', error.message);
//       res.status(500).json({ error: error.message });
//   }
// });




// POST /api/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { lineItems, successUrl, cancelUrl } = req.body; // lineItems should include product details, quantity, etc.

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe-webhook
router.post('/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'we_1PUPrMHs6CTam63TkAXGB2db'); // Replace with your webhook secret
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Retrieve order details from session object and update your database accordingly
      // For example, update order status or send confirmation emails
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      // Handle failed payment intent
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});




module.exports = router