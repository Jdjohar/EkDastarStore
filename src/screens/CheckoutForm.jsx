import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';


const CheckoutForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const stripe = useStripe();
    const elements = useElements();
    let dispatch = useDispatchCart();
    let navigate = useNavigate()

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
            return;
        }

        try {
            const { error: backendError, clientSecret } = await fetch('https://store-ywot.onrender.com/api/auth/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: calculateTotal() * 100, // Convert to cents for Stripe
                }),
            }).then((res) => res.json());

            if (backendError) {
                setError(backendError.message);
                setLoading(false);
                return;
            }

            const cardElement = elements.getElement(CardElement);

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // Payment successful
                console.log('Payment successful', paymentIntent);

                let userEmail = localStorage.getItem("userEmail");
                // console.log(data,localStorage.getItem("userEmail"),new Date())
                let response = await fetch("https://store-ywot.onrender.com/api/auth/orderData", {
                    // credentials: 'include',
                    // Origin:"http://localhost:3000/login",
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_data: cart,
                        email: userEmail,
                        order_date: new Date().toDateString()
                    })
                });
                console.log("JSON RESPONSE:::::", response.status)
                navigate('/thankyou')
                if (response.status === 200) {
                    dispatch({ type: "DROP" })
                }
                setLoading(false);
            } else {
                setError('Payment processing failed.');
                setLoading(false);
            }
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (

        <>

        <Navbar />
        <div className='container py-5'>
            <h1>Checkout</h1>
            <div className='row'>
                <div className='col-12 col-md-7'>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Image</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, id) => (
                                    <tr key={id}>
                                        <td>{item.name}</td>
                                        <td>{item.qty}</td>
                                        <td>${item.price.toFixed(2)}</td>
                                        <td><img src={item.img} alt={item.name} style={{ width: '50px' }} /></td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="2"></td>
                                    <td><strong>Total:</strong></td>
                                    <td><strong>${calculateTotal().toFixed(2)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                <div className='col-12 col-md-5'>

                <h3>Cart Total</h3>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>
                        <span>$0.00</span>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label style={{ width: '100%' }}>
                                Card details
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#424770',
                                                '::placeholder': {
                                                    color: '#aab7c4',
                                                },
                                            },
                                            invalid: {
                                                color: '#9e2146',
                                            },
                                        },
                                    }}
                                />
                            </label>
                        </div>
                        {error && <div className="error">{error}</div>}
                        <button type="submit" className="btn btn-primary mt-3" disabled={!stripe || loading}>
                            {loading ? 'Loading...' : 'Pay Now'}
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
