const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Address Schema (for both billing and shipping)
const addressSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String }, // Optional
    country: { type: String, required: true },
    streetAddress: { type: String, required: true },
    apartment: { type: String }, // Optional
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
});

// Define Order Item Schema (for each cart item)
const orderItemSchema = new Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true }
});

// Define Main Checkout Schema
const checkoutSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    userEmail: { type: String, required: true }, // Email of the user placing the order
    billingAddress: { type: addressSchema, required: true }, // Embedded address schema for billing
    shippingAddress: { type: addressSchema, required: true }, // Embedded address schema for shipping
    orderItems: [orderItemSchema], // Array of cart items
    orderDate: { type: Date, default: Date.now }, // Order date
    totalAmount: { type: Number, required: true }, // Total amount paid
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }, // Payment status
    shippingMethod: { type: String, required: true }, // e.g. 'Canada Post'
    shippingCost: { type: Number, default: 0 }, // Shipping cost
    paymentMethod: { type: String, required: true }, // Payment method (e.g., Stripe, PayPal)
});

// Export the model
module.exports = mongoose.model('Checkout', checkoutSchema);
