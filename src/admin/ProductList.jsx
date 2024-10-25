import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom'; // For route params and navigation
// import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import AdminNavbar from './components/AdminNavbar';
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/product');
        const result = await response.json();

        if (result.status === 'success') {
          setProducts(result.data);
          setFilteredProducts(result.data); // Initially, all products are displayed
        } else {
          console.error('Error fetching products:', result.message);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchProducts();
  }, []);
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/product/${id}`, {
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
    navigate(`/admin/editProduct/${id}`);
  };

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter((product) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.CategoryName.toLowerCase().includes(lowerSearchTerm)
      );
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <>
     <AdminNavbar />
      <div className="container py-5 mt-5">
      <h2 className=''>Product List</h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by product name or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Options</th>
            <th>Image</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>

          {console.log(filteredProducts,"filteredProducts")}
          
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.CategoryName}</td>
                <td>
                  {Object.entries(product.options[0]).map(([size, price]) => (
                    <div key={size}>
                      {size}: {price}
                    </div>
                  ))}
                </td>
                <td>
                  <img
                    src={product.img}
                    alt={product.name}
                    style={{ width: '100px', height: 'auto' }}
                  />
                </td>
                <td>
                  {product.featured ? 'True' : 'False'}
                </td>
                <td>
                  {/* Edit and Delete Buttons */}
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => handleEdit(product._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  
  );
};

export default ProductList;
