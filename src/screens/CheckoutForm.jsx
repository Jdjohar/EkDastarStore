import React, { useState, useEffect } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import Navbar from '../components/Navbar2';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
const CheckoutForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [billingAddress, setBillingAddress] = useState({
        firstName: '',lastName: '',company: '',country: '',streetAddress: '',apartment: '', city: '',province: '',postalCode: '',phone: '',email: ''
    });
    const [shippingAddress, setShippingAddress] = useState({ ...billingAddress });
    const [sameAsBilling, setSameAsBilling] = useState(true);
    const stripe = useStripe();
    const elements = useElements();
    let dispatch = useDispatchCart();
    let navigate = useNavigate();
    useEffect(() => {
        const getCart = localStorage.getItem('cart');
        const getCartJson = JSON.parse(getCart);
        if (getCartJson && Array.isArray(getCartJson)) {
            setCart(getCartJson);
        }
    }, []);
    const calculateTotal = () => {
        let total = 0;
        cart.forEach((item) => {
            total += item.price * item.qty;
        });
        return total; // Keep the total in dollars
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
    
        if (!stripe || !elements) {
            setError("Stripe.js Error: Stripe.js has not loaded yet.");
            setLoading(false);
            return;
        }
    
        if (!billingAddress || !billingAddress.firstName) {
            setError("Billing Address Error: Billing address is incomplete.");
            setLoading(false);
            return;
        }
    
        try {
            const amount = calculateTotal() * 100; // Convert to cents for Stripe
            console.log("Step 1");
    
            // Step 1: Create a Stripe Customer
            const customerResponse = await fetch('http://localhost:5000/api/auth/create-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${billingAddress.firstName} ${billingAddress.lastName}`,
                    email: billingAddress.email,
                    phone: billingAddress.phone,
                    address: {
                        line1: billingAddress.streetAddress,
                        city: billingAddress.city,
                        state: billingAddress.province,
                        postal_code: billingAddress.postalCode,
                        country: billingAddress.country,
                    },
                }),
            });
    
            const customerData = await customerResponse.json();
            const customerId = customerData.customerId; // Assuming your backend sends the customer ID
            console.log("Customer created:", customerId);
    
            // Step 2: Create a PaymentIntent with the customer ID
            const response = await fetch('http://localhost:5000/api/auth/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    customerId, // Associate the PaymentIntent with the customer
                    billingAddress: {
                        name: billingAddress.firstName,
                        address: {
                            line1: billingAddress.streetAddress,
                            city: billingAddress.city,
                            state: billingAddress.province,
                            postal_code: billingAddress.postalCode,
                            country: billingAddress.country,
                        },
                        email: billingAddress.email,
                        phone: billingAddress.phone,
                    },
                    description: 'Export of 100 cotton t-shirts, size M, color blue',
                }),
            });
    
            const responseData = await response.json();
            console.log(responseData, "responseData"); // Log the entire response object
    
            // Get the clientSecret from responseData
            const clientSecret = responseData.clientSecret;
    
            if (!clientSecret) {
                setError("Client Secret Error: Client secret not found.");
                setLoading(false);
                return;
            }
    
            // Step 3: Confirm the card payment
            const cardElement = elements.getElement(CardElement);
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${billingAddress.firstName} ${billingAddress.lastName}`,
                        email: billingAddress.email,
                        phone: billingAddress.phone,
                        address: {
                            line1: billingAddress.streetAddress,
                            city: billingAddress.city,
                            state: billingAddress.province,
                            postal_code: billingAddress.postalCode,
                            country: billingAddress.country,
                        },
                    },
                },
            });
    
            if (error) {
                setError("Card Payment Error: " + error.message);
                setLoading(false);
                return;
            }
    
            const userid = localStorage.getItem('userId');
            const useremail = localStorage.getItem('userEmail');
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                const checkoutResponse = await fetch("http://localhost:5000/api/auth/checkoutOrder", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userid,
                        userEmail: useremail,
                        orderItems: cart,
                        email: billingAddress.email,
                        orderDate: new Date().toDateString(),
                        billingAddress: billingAddress,
                        shippingAddress: shippingAddress,
                        paymentMethod: 'Stripe',
                        orderStatus:"Processing",
                        shippingCost: 0,
                        paymentStatus:"paid",
                        shippingMethod: 'ByPost',
                        totalAmount: paymentIntent.amount,
                    }),
                });
    
                const checkoutData = await checkoutResponse.json();
                console.log(checkoutResponse, checkoutData, "checkoutData");
    
                if (checkoutResponse.status === 200) {
                    dispatch({ type: "DROP" });
                    navigate('/thankyou');
                } else {
                    setError("Order Placement Error: Failed to place order.");
                }
            } else {
                setError("Payment Intent Error: Payment processing failed.");
            }
        } catch (error) {
            console.log("Unexpected Error: ", error.message);
            setError("Unexpected Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    
    // Handle Billing and Shipping form changes
    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingAddress(prevState => ({ ...prevState, [name]: value }));
        if (sameAsBilling) {
            setShippingAddress(prevState => ({ ...prevState, [name]: value }));
        }
    };
    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prevState => ({ ...prevState, [name]: value }));
    };
    // Handle checkbox toggle
    const handleSameAsBilling = (e) => {
        setSameAsBilling(e.target.checked);
        if (e.target.checked) {
            setShippingAddress({ ...billingAddress });
        }
    };
    return (
        <>
            <Navbar />
            <div className='container py-5'>
                <h1>Checkout</h1>
                <div className='row'>
                    <div className='col-12 col-md-6'>
                        <h4>Billing Address</h4>
                        <form>
                            <div className="row">
                                <div className="col">
                                    <label className='mb-2'>First Name</label>
                                    <input
                                        type="text" className="form-control" placeholder="First name" name="firstName" value={billingAddress.firstName} onChange={handleBillingChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className='mb-2'>Last Name</label>
                                    <input
                                        type="text" className="form-control" placeholder="Last name" name="lastName" value={billingAddress.lastName} onChange={handleBillingChange}
                                    />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col">
                                    <label className='mb-2'>Company Name (optional)</label>
                                    <input
                                        type="text" className="form-control" placeholder="Company name" name="company" value={billingAddress.company} onChange={handleBillingChange}
                                    />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col">
                                    <label className='mb-2'>Country</label>
                                    <select
                                        className="form-control"
                                        name="country"
                                        value={billingAddress.country}
                                        onChange={handleBillingChange}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="AU">Australia</option>
                                        {/* Add more countries here */}
                                    </select>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col">
                                    <label className='mb-2'>Street Address</label>
                                    <input
                                        type="text"  className="form-control mb-3" placeholder="House Number and street name" name="streetAddress" value={billingAddress.streetAddress} onChange={handleBillingChange}
                                    />
                                    <input
                                        type="text" className="form-control" placeholder="Apartment, suite, unit, etc. (optional)" name="apartment" value={billingAddress.apartment} onChange={handleBillingChange}
                                    />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col">
                                    <label className='mb-2'>Province/State</label>
                                    <input
                                        type="text"  className="form-control" placeholder="Province/State" name="province" value={billingAddress.province}  onChange={handleBillingChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className='mb-2'>Postal Code</label>
                                    <input
                                        type="text" className="form-control" placeholder="Postal Code" name="postalCode" value={billingAddress.postalCode} onChange={handleBillingChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className='mb-2'>City</label>
                                    <input
                                        type="text" className="form-control" placeholder="City" name="city" value={billingAddress.city} onChange={handleBillingChange}
                                    />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col">
                                    <label className='mb-2'>Phone</label>
                                    <input
                                        type="text" className="form-control" placeholder="Phone Number" name="phone" value={billingAddress.phone} onChange={handleBillingChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className='mb-2'>Email</label>
                                    <input
                                        type="email" className="form-control" placeholder="Email Address" name="email" value={billingAddress.email} onChange={handleBillingChange}
                                    />
                                </div>
                            </div>
                        </form>

                        <h4>Shipping Address</h4>
                        <input
                            type="checkbox"
                            checked={sameAsBilling}
                            onChange={handleSameAsBilling}
                        /> Same as Billing Address
                        {!sameAsBilling && (
                            <form className='mt-3'>
                                <div className="row">
                                    <div className="col">
                                        <label className='mb-2'>First Name</label>
                                        <input
                                            type="text" className="form-control" placeholder="First name" name="firstName" value={shippingAddress.firstName} onChange={handleShippingChange}
                                        />
                                    </div>
                                    <div className="col">
                                        <label className='mb-2'>Last Name</label>
                                        <input
                                            type="text" className="form-control" placeholder="Last name" name="lastName" value={shippingAddress.lastName} onChange={handleShippingChange}
                                        />
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col">
                                        <label className='mb-2'>Company Name (optional)</label>
                                        <input
                                            type="text" className="form-control" placeholder="Company name"  name="company" value={shippingAddress.company} onChange={handleShippingChange}
                                        />
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col">
                                        <label className='mb-2'>Country</label>
                                        <select
                                            className="form-control"
                                            name="country"
                                            value={shippingAddress.country}
                                            onChange={handleShippingChange}
                                        >
                                            <option value="">Select Country</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Canada">Canada</option>
                                            {/* Add more countries here */}
                                        </select>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col">
                                        <label className='mb-2'>Street Address</label>
                                        <input
                                            type="text" className="form-control mb-3" placeholder="House Number and street name" name="streetAddress" value={shippingAddress.streetAddress} onChange={handleShippingChange}
                                        />
                                        <input
                                            type="text" className="form-control" placeholder="Apartment, suite, unit, etc. (optional)" name="apartment" value={shippingAddress.apartment} onChange={handleShippingChange}
                                        />
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col">
                                        <label className='mb-2'>Province/State</label>
                                        <input
                                            type="text" className="form-control" placeholder="Province/State" name="province" value={shippingAddress.province} onChange={handleShippingChange}
                                        />
                                    </div>
                                    <div className="col">
                                        <label className='mb-2'>Postal Code</label>
                                        <input
                                            type="text" className="form-control" placeholder="Postal Code" name="postalCode" value={shippingAddress.postalCode} onChange={handleShippingChange}
                                        />
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col">
                                        <label className='mb-2'>Phone</label>
                                        <input
                                            type="text" className="form-control" placeholder="Phone Number" name="phone" value={shippingAddress.phone} onChange={handleShippingChange}
                                        />
                                    </div>
                                    <div className="col">
                                        <label className='mb-2'>Email</label>
                                        <input
                                            type="email" className="form-control" placeholder="Email Address" name="email" value={shippingAddress.email} onChange={handleShippingChange}
                                        />
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className='col-12 col-md-6'>
                        <div className="col mt-3">
                            <div className="d-flex justify-content-between">
                                <h3>Your Order</h3>
                            </div>
                            {cart.map((item, id) => (
                                <div key={id} className="d-flex justify-content-between">
                                    <span>{item.name} x {item.qty}</span>
                                    <span>${item.price}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span>Subtotal</span>
                                <span>${calculateTotal()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Shipping</span>
                                <span>Free Shipping in Australia</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Total</span>
                                <span>${calculateTotal()}</span>
                            </div>
                        </div>
                        <h4 className='pt-5'>Payment Details</h4>
                        <form onSubmit={handleSubmit}>
                            <CardElement />
                            {error && <div className="alert alert-danger mt-3">{error}</div>}
                            <button type="submit" className="btn btn-primary mt-3" disabled={!stripe || loading}>
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutForm;