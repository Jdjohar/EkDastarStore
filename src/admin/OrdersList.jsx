import React, { useEffect, useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import AdminNavbar from './components/AdminNavbar';
import { useParams,useNavigate } from 'react-router-dom';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const navigate = useNavigate()
  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
        console.log("Result");
      try {
        const response = await fetch('https://ekdastar.onrender.com/api/auth/orders');
        const result = await response.json();
        console.log(result,"Result");
        
        setOrders(result); // Assuming result is the array of orders
        setFilteredOrders(result); // Set filtered orders initially to all orders
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      }
    };

    fetchOrders();
  }, []);

  // Handle search filter
  useEffect(() => {
    const filtered = orders.filter(order =>
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`https://ekdastar.onrender.com/api/auth/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((product) => product._id !== id));
        setFilteredProducts(filteredProducts.filter((product) => product._id !== id));
        console.log('Product deleted successfully');
      } else {
        console.error('Failed to delete product:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting product:', error.message);
    }
  };
  const handleEdit = (id) => {
    // Navigate to the edit page with the product ID (assuming an edit page exists)
    navigate(`/admin/orderView/${id}`);
  };
  return (

    <>
    <AdminNavbar />
      <div className="container mt-5">
      <h2>All Orders</h2>

      {/* Search bar */}
      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>User Email</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Payment Method</th>
              <th>Shipping Method</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.userEmail}</td>
                  <td>${(order.totalAmount / 100).toFixed(2)}</td> {/* Assuming totalAmount is in cents */}
                  <td>{order.paymentStatus}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.shippingMethod}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                  {/* Edit and Delete Buttons */}
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleEdit(order._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete
                  </button>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  
  );
};

export default OrdersList;
