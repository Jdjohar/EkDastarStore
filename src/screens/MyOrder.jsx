import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar2';

export default function MyOrder() {
    const [orderData, setOrderData] = useState([]);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");

    const fetchUserOrders = async () => {
        if (!userId) {
            setError('User ID is not found in local storage.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/userorders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }), // Sending userId in the request body
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);
            setOrderData(data); // Set the orders in state
        } catch (err) {
            setError(err.message); // Set error message if request fails
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    // Function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD', // Change to the desired currency
        }).format(amount / 100); // Assuming the totalAmount is in cents
    };

    return (
        <div>
            <Navbar />
            <div className='container py-5'>
                <div className='row py-5'>
                    <h2>My Orders</h2>
                    <hr />
                    {error && <div className="alert alert-danger">{error}</div>}
                    {orderData.length > 0 ? orderData.map((order) => (
                        <div key={order._id} className="col-12 mb-4">
                            <h5>Order Date: {new Date(order.orderDate).toLocaleDateString()}</h5>
                            <div className="d-flex flex-wrap">
                                {order.orderItems.map(item => (
                                    <div key={item._id} className="card mt-3 me-2" style={{ width: "16rem", maxHeight: "360px" }}>
                                        <div className="card-body">
                                            <h5 className="card-title">{item.name}</h5>
                                            <div className='container w-100 p-0' style={{ height: "38px" }}>
                                                <span className='m-1'>{item.qty}</span>
                                                <span className='m-1'>{item.size}</span>
                                                <div className='d-inline ms-2 h-100 w-20 fs-5'>
                                                    ${item.price} /-
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3">
                                <strong>Total Amount: {formatCurrency(order.totalAmount)}</strong>
                            </div>
                            <hr />
                        </div>
                    )) : <p>No orders found.</p>}
                </div>
            </div>
            <Footer />
        </div>
    );
}
