import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
import AdminNavbar from './components/AdminNavbar';

const OrderView = () => {
  const { id } = useParams(); // Get the order ID from the URL params
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For order status update
  const [orderStatus, setOrderStatus] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Fetch the order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`https://ekdastar.onrender.com/api/auth/orders/${id}`);
        if (!response.ok) {
          throw new Error('Error fetching order details');
        }
        const data = await response.json();
        setOrder(data);
        setOrderStatus(data.orderStatus);
        setShippingMethod(data.shippingMethod);
        setShippingCost(data.shippingCost || 0);
        setPaymentMethod(data.paymentMethod);
        setTrackingNumber(data.trackingNumber || '');
        setEstimatedDelivery(data.estimatedDelivery || '');
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Update only the order status
  const handleOrderStatusUpdate = async (e) => {
    const updatedData = {
      orderStatus: e.target.value,
    };

    try {
      const response = await fetch(`https://ekdastar.onrender.com/api/auth/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Error updating order status');
      }
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setOrderStatus(updatedOrder.orderStatus);
      alert('Order status updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  // Update other order fields
  const handleUpdateOtherFields = async (e) => {
    e.preventDefault();
    
    const updatedData = {
      shippingMethod,
      shippingCost,
      paymentMethod,
      trackingNumber,
      estimatedDelivery,
    };

    try {
      const response = await fetch(`https://ekdastar.onrender.com/api/auth/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Error updating order details');
      }
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      alert('Order details updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  if (!order) {
    return <div className="container">Order not found</div>;
  }

  const { billingAddress, shippingAddress, orderItems, totalAmount, paymentStatus, orderDate } = order;

  return (
    <>
    <AdminNavbar />
    <div className="container mt-5">
      <h2>Order Details</h2>

      {/* Order summary */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h4>Order ID: {order._id}</h4>
          <p><strong>Order Date:</strong> {new Date(orderDate).toLocaleDateString()}</p>
          <p><strong>Order Status:</strong> {order.orderStatus}</p>
          <p><strong>Payment Status:</strong> {paymentStatus}</p>
          <p><strong>Total Amount:</strong> ${(totalAmount / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Billing and Shipping Information */}
      <div className="row">
        <div className="col-md-6">
          <h5>Billing Address</h5>
          <p><strong>Name:</strong> {billingAddress.firstName} {billingAddress.lastName}</p>
          <p><strong>Address:</strong> {billingAddress.streetAddress}, {billingAddress.apartment}</p>
          <p><strong>City/Province:</strong> {billingAddress.province}, {billingAddress.country}</p>
          <p><strong>Postal Code:</strong> {billingAddress.postalCode}</p>
          <p><strong>Phone:</strong> {billingAddress.phone}</p>
          <p><strong>Email:</strong> {billingAddress.email}</p>
        </div>

        <div className="col-md-6">
          <h5>Shipping Address</h5>
          <p><strong>Name:</strong> {shippingAddress.firstName} {shippingAddress.lastName}</p>
          <p><strong>Address:</strong> {shippingAddress.streetAddress}, {shippingAddress.apartment}</p>
          <p><strong>City/Province:</strong> {shippingAddress.province}, {shippingAddress.country}</p>
          <p><strong>Postal Code:</strong> {shippingAddress.postalCode}</p>
          <p><strong>Phone:</strong> {shippingAddress.phone}</p>
          <p><strong>Email:</strong> {shippingAddress.email}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="row mt-4">
        <h5>Order Items</h5>
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.qty}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Order Status */}
      <div className="row mt-4">
        <div className="col-md-6">
          <h5>Update Order Status</h5>
          <select
            className="form-select"
            value={orderStatus}
            onChange={handleOrderStatusUpdate} // Triggers update when status is changed
          >
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Update Other Fields */}
      <div className="row mt-4">
        <div className="col-md-12">
          <h5>Update Order Details</h5>
          <form onSubmit={handleUpdateOtherFields}>
            {/* <div className="mb-3">
              <label className="form-label">Shipping Method</label>
              <input
                type="text"
                className="form-control"
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
            </div> */}

            {/* <div className="mb-3">
              <label className="form-label">Shipping Cost</label>
              <input
                type="number"
                className="form-control"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div> */}

            {/* <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <input
                type="text"
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div> */}

            <div className="mb-3">
              <label className="form-label">Tracking Number</label>
              <input
                type="text"
                className="form-control"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Estimated Delivery</label>
              <input
                type="date"
                className="form-control"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">Update Order Details</button>
          </form>
        </div>
      </div>
    </div>
    </>
   
  );
};

export default OrderView;
