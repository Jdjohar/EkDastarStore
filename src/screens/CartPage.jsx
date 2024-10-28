import React, { useState, useEffect } from 'react';

import { useCart, useDispatchCart } from '../components/ContextReducer';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';


const CartPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
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
        console.log(cart, "cart");

        cart.forEach((item) => {
            total += (item.price);
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
            const { error: backendError, clientSecret } = await fetch('https://ekdastar.onrender.comapi/auth/payment', {
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
                let response = await fetch("https://ekdastar.onrender.comapi/auth/orderData", {
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

            <Navbar2 />
            <div className='container py-5'>
                <h1 className='py-5'>Shopping Cart</h1>
                <div className='row'>
                    <div className='col-12 col-md-8'>
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
                                            <td>

                                                <div class="d-flex flex-row align-items-center">
                                                    <div>
                                                        <img
                                                            src={item.img}
                                                            class="img-fluid rounded-3" alt={item.name} style={{ width: '65px' }} />
                                                    </div>
                                                    <div class="ms-3">
                                                        <h5>{item.name}</h5>
                                                        <p class="small mb-0">{item.size} meter</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.qty}</td>
                                            <td>${(item.price).toFixed(2)}</td>
                                            <td><img src={item.img} alt={item.name} style={{ width: '50px' }} /></td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="2"></td>
                                        <td><strong>Total:</strong></td>
                                        <td><strong>${calculateTotal().toFixed(2)} AUD</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                    <div className='col-12 col-md-4'>

                        <h3>Cart Total</h3>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>${calculateTotal().toFixed(2)} AUD</span>
                        </div>
                        {/* <div className="d-flex justify-content-between mb-2">
                            <span>Tax:</span>
                            <span>$0.00</span>
                        </div> */}
                        <div className=" mb-2">
                            <Link className='btn btn-success' to={'/checkoutpage'}>Proceed to Checkout</Link>
                        </div>
                        {/* <form onSubmit={handleSubmit}>
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
                    </form> */}
                    </div>
                </div>



            </div>
            <Footer />
        </>
    );
};

export default CartPage;
