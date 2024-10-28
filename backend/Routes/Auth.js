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
// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: "jdwebservices1@gmail.com",
      pass: "cwoxnbrrxvsjfbmr"
  },
});

router.post('/createuser', [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('name').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const salt = await bcrypt.genSalt(10);
  let securePass = await bcrypt.hash(req.body.password, salt);

  try {
    await User.create({
      name: req.body.name,
      password: securePass,
      email: req.body.email,
      location: req.body.location
    }).then(user => {
      const data = {
        user: {
          id: user.id
        }
      };
      const authToken = jwt.sign(data, jwtSecret);
      success = true;

      // Send welcome email
      const mailOptions = {
        from: 'youremail@gmail.com', // Sender email
        to: req.body.email, // Recipient email
        subject: 'Welcome to Our Service!',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h1 style="color: #4CAF50;">Welcome to Ek Dastar, ${req.body.name}!</h1>
          <p>Thank you for joining <strong>Ek Dastar</strong>, where tradition meets elegance. We're honored to be part of your journey in finding authentic turbans, patkas, and dumala sahibs.</p>
      
          <p>As a valued member of Ek Dastar, you now have access to:</p>
          <ul>
            <li>Exclusive offers on premium turbans and accessories</li>
            <li>Personalized recommendations based on your unique style</li>
            <li>Guidance from our experts to help you choose the perfect fit and style</li>
          </ul>
      
          <p>We believe every turban and patka is a symbol of pride and identity, and we’re dedicated to providing high-quality materials and craftsmanship that honor this tradition.</p>
          
          <p>To get started, log in and explore our latest collections. We’re here to help you find the perfect piece that resonates with your style and heritage.</p>
          
          <p>If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:support@ekDastar.com" style="color: #4CAF50;">support@ekDastar.com</a>. Our team is here to ensure your shopping experience is as seamless as possible.</p>
      
          <p>Welcome once again to the Ek Dastar family. We look forward to being a part of your journey.</p>
      
          <p>With respect and best wishes,<br>The Ek Dastar Team</p>
      
          <hr style="border: none; border-top: 1px solid #ccc;">
          <p style="font-size: 12px; color: #666;">You're receiving this email because you registered with Ek Dastar. If you didn’t sign up, please ignore this email or <a href="mailto:support@ekDastar.com" style="color: #666;">contact us</a>.</p>
        </div>
      `
      
      
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      res.json({ success, authToken });
    })
    .catch(err => {
      console.log(err);
      res.json({ error: "Please enter a unique value." });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


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
    const {
      billingAddress,
      userId,
      userEmail,
      shippingAddress,
      orderItems,
      totalAmount,
      shippingMethod,
      shippingCost,
      paymentMethod,
      paymentStatus
    } = req.body;

    console.log(billingAddress,"billingAddress");
    

    // Validate request
    if (!billingAddress || !shippingAddress || !orderItems || !totalAmount || !shippingMethod || !paymentMethod) {
      return res.status(400).json({ msg: 'All required fields must be filled' });
    }

    // Create a new order
    const newOrder = new Checkout({
      userId,
      userEmail,
      billingAddress,
      shippingAddress,
      orderItems,
      totalAmount,
      paymentStatus,
      shippingMethod,
      shippingCost,
      paymentMethod
    });

    // Save the order to the database
    const order = await newOrder.save();

    // Email to Customer: Order Confirmation
    const customerMailOptions = {
      from: 'jdwebserviecs1@gmail.com',
      to: billingAddress.email, // Customer's email
      subject: 'Your Order with Ek Dastak has been Placed Successfully!',
      html: `
        <h2>Thank you for your order, ${billingAddress.firstName}!</h2>
        <p>Your order has been placed successfully and is now being processed.</p>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
        <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p>We will notify you once your order is shipped. Thank you for shopping with Ek Dastak!</p>
      `
    };

    // Email to Owner: New Order Notification
    const ownerMailOptions = {
      from: 'jdwebserviecs1@gmail.com',
      to: 'jdeep514@gmail.com', // Owner's email address
      subject: 'New Order Placed on Ek Dastak',
      html: `
        <h2>New Order Alert!</h2>
        <p>A new order has been placed on Ek Dastak.</p>
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer Name:</strong> ${billingAddress.firstName}</p>
        <p><strong>Customer Email:</strong> ${billingAddress.email}</p>
        <p><strong>Total Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
        <p><strong>Shipping Method:</strong> ${shippingMethod}</p>
        <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        <p>Please review the order in the admin panel for further details.</p>
      `
    };

    // Send customer email
    transporter.sendMail(customerMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email to customer:', error);
      } else {
        console.log('Customer email sent:', info.response);
      }
    });

    // Send owner email
    transporter.sendMail(ownerMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email to owner:', error);
      } else {
        console.log('Owner email sent:', info.response);
      }
    });

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Checkout.find(); // Fetch all orders from the database
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});



// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Checkout.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update order (e.g., payment status)
router.put('/orders/:id', async (req, res) => {
  try {
    const { orderStatus, shippingMethod, shippingCost, paymentMethod, estimatedDelivery, trackingNumber } = req.body;

    // Find the order by ID
    const order = await Checkout.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Update fields if they are provided
    if (orderStatus) order.orderStatus = orderStatus;
    if (shippingMethod) order.shippingMethod = shippingMethod;
    if (shippingCost) order.shippingCost = shippingCost;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Save the updated order
    const updatedOrder = await order.save();

    // Check if orderStatus has been updated and send email notification
    if (orderStatus) {
      const customerMailOptions = {
        from: 'jdwebservices1@gmail.com',
        to: order.billingAddress.email, // Customer's email from the order
        subject: `Order #${order._id} Status Update: ${orderStatus}`,
        html: `
          <h2>Hello ${order.billingAddress.firstName},</h2>
          <p>We wanted to let you know that the status of your order has been updated.</p>
          <h3>Updated Order Details:</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Status:</strong> ${orderStatus}</p>
          ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
          <p>Thank you for shopping with Ek Dastak!</p>
        `
      };

      // Send the email to the customer
      transporter.sendMail(customerMailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email to customer:', error);
        } else {
          console.log('Order status update email sent:', info.response);
        }
      });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});
// Delete an order by ID
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Checkout.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Delete the order
    await order.remove();

    res.status(200).json({ msg: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get orders by user ID
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Checkout.find({ userId }); // Find orders by userId
    if (!orders.length) {
      return res.status(404).json({ msg: 'No orders found for this user' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.post('/userorders', async (req, res) => {
  const userId = req.body.userId; // Extract userId from the body

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Find all orders that match the provided userId
    const orders = await Checkout.find({ userId: userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // Return the orders
    res.status(200).json(orders);
  } catch (error) {
    // Error handling
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});


// Get orders by payment status
router.get('/orders/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const orders = await Checkout.find({ paymentStatus: status }); // Find orders by paymentStatus
    res.status(200).json(orders);
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
  console.log('Received billingAddress:', billingAddress);
 
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

// router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {

//   console.log("start here");
  
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     // Construct and verify the event using the Stripe signature and raw body
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     console.log("Stripe event received:", event);
    
//   } catch (err) {
//     console.error(`Webhook signature verification failed: ${err.message}`);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event by event type
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntentSucceeded = event.data.object;
//       console.log('PaymentIntent was successful!', paymentIntentSucceeded);
//       // Handle the successful payment here, such as updating order status
//       break;

//     case 'payment_intent.payment_failed':
//       const paymentIntentFailed = event.data.object;
//       console.log('PaymentIntent failed!', paymentIntentFailed);
//       // Handle the failed payment here
//       break;

//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Send back a response to Stripe to acknowledge receipt of the event
//   res.status(200).json({ received: true });
// });

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
//           img:`https://ekdastar.onrender.com${img}`,
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
    const { name, description, CategoryName, options, featured } = req.body;
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
      featured
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

router.get('/product', async (req, res) => {
  try {
    const products = await Products.find(); // Fetch all products from the database
    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/product/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id); // Find product by ID
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/product/:id', upload.single('img'), async (req, res) => {
  try {
    const { name, description, CategoryName, options } = req.body;
    let updatedProduct = {
      name,
      description,
      CategoryName,
      options: JSON.parse(options), // Assuming options is sent as a JSON string
    };

    // If a new image is uploaded, upload to Cloudinary and update the image URL
    if (req.file) {
      const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'employeeApp',
      });
      updatedProduct.img = uploadedImg.secure_url;
    }

    // Update the product in the database
    const product = await Products.findByIdAndUpdate(req.params.id, updatedProduct, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation is run
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product in the database
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Optionally, delete the image from Cloudinary
    const imagePublicId = product.img.split('/').pop().split('.')[0]; // Extract the public ID from the image URL
    await cloudinary.uploader.destroy(imagePublicId); // Delete image from Cloudinary

    // Remove product from the database
    await product.remove();

    // Remove product from global.foodData
    global.foodData = global.foodData.filter(item => item.id !== productId); // Adjust this line as necessary based on your foodData structure

    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/product/search', async (req, res) => {
  try {
    const searchTerm = req.query.q; // Query parameter for search term
    const products = await Products.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive name search
        { CategoryName: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive category search
      ],
    });

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    console.error('Error searching for products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// POST /api/category/addcategory
router.post('/addcategory', upload.single('img'), async (req, res) => {
  try {
    const { CategoryName } = req.body;

    // Upload image to Cloudinary
    const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: 'employeeApp',
    });

    // Create new category
    const newCategory = new Category({
      CategoryName,
      img: uploadedImg.secure_url,
    });

    // Save to the database
    const savedCategory = await newCategory.save();
    global.foodCategory.push(savedCategory);
    res.status(201).json({
      status: 'success',
      data: savedCategory,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//get a list of Category
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find(); // Get all categories from MongoDB
    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.put('/categories/:id', upload.single('img'), async (req, res) => {
  try {
    const { CategoryName } = req.body;

    // Find the existing category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if a new image is provided and upload to Cloudinary
    if (req.file) {
      const uploadedImg = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: 'employeeApp',
      });
      category.img = uploadedImg.secure_url; // Update image URL
    }

    // Update the category name
    category.CategoryName = CategoryName || category.CategoryName;

    // Save the updated category
    const updatedCategory = await category.save();
    res.status(200).json({
      status: 'success',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/category/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// routes/category.js (continuation)
// API to fetch products by categoryName
router.get('/products/category/:categoryName', async (req, res) => {
  try {
      const categoryName = req.params.categoryName;
      const products = await Products.find({ CategoryName: categoryName });

      if (products.length === 0) {
          return res.status(404).json({ message: 'No products found for this category' });
      }

      res.json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
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