import React, { useState, useEffect } from 'react';
import { useParams,  } from 'react-router-dom'; // Added useHistory for navigation
// import 'bootstrap/dist/css/bootstrap.min.css';
import AdminNavbar from './components/AdminNavbar';

const EditProduct = () => {
  const { id } = useParams(); // Get the product ID from the URL

  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    CategoryName: '',
    options: {}, // Initialize as an object
    img: '',
  });
  const [file, setFile] = useState(null); // For the image file

  // Fetch categories for the dropdown (Optional, if categories need to be dynamic)
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://ekdastar.onrender.comapi/auth/categories');
      const result = await response.json();
      console.log(result, "Cate");
      
      setCategories(result.data);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  // Fetch the product details to populate the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://ekdastar.onrender.comapi/auth/product/${id}`);
        const result = await response.json();
        console.log(result, "Product");

        if (result.status === 'success') {
          // Combine all options into a single object
          const combinedOptions = result.data.options.reduce((acc, option) => {
            const key = Object.keys(option)[0];
            acc[key] = option[key];
            return acc;
          }, {});

          setProductData({
            name: result.data.name,
            description: result.data.description,
            CategoryName: result.data.CategoryName,
            options: combinedOptions, // Set the combined options object
            img: result.data.img,
          });
        } else {
          console.error('Error fetching product:', result.message);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  // Handle input changes for static form fields
  const handleStaticInputChange = (field, value) => {
    setProductData({ ...productData, [field]: value });
  };

  // Handle options input changes
  const handleDynamicInputChange = (key, value) => {
    setProductData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }));
  };

  // Add new option field
  const handleAddNewOption = () => {
    setProductData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        '': '', // Add an empty key-value pair for new input
      },
    }));
  };

  // Remove option field
  const handleRemoveOption = (key) => {
    setProductData((prev) => {
      const updatedOptions = { ...prev.options };
      delete updatedOptions[key];
      return { ...prev, options: updatedOptions };
    });
  };

  // Handle file input change for image
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the image file
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('CategoryName', productData.CategoryName);
    
    // Add image only if a new file was selected
    if (file) {
      formData.append('img', file);
    }

    // Prepare options as a single object
    const optionsObject = productData.options;

    formData.append('options', JSON.stringify([optionsObject])); // Wrap the object in an array

    try {
      const response = await fetch(`https://ekdastar.onrender.comapi/auth/product/${id}`, {
        method: 'PUT',
        body: formData, // Send as multipart/form-data
      });

      if (response.ok) {
        alert('Product updated successfully!');
        history.push('/products'); // Redirect back to product list
      } else {
        const errorData = await response.json();
        console.error('Error updating product:', errorData.message);
      }
    } catch (error) {
      console.error('Error updating product:', error.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container py-5 mt-5">
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Product Name */}
          <div className="form-group mb-3">
            <label>Product Name</label>
            <input
              type="text"
              className="form-control"
              value={productData.name}
              onChange={(e) => handleStaticInputChange('name', e.target.value)}
            />
          </div>

          {/* Product Description */}
          <div className="form-group mb-3">
            <label>Product Description</label>
            <input
              type="text"
              className="form-control"
              value={productData.description}
              onChange={(e) => handleStaticInputChange('description', e.target.value)}
            />
          </div>

          {/* Product Options */}
          <div className="form-group mb-3">
            <label>Product Options</label>
            {Object.entries(productData.options).map(([key, value], index) => (
              <div key={index} className="d-flex mb-2">
                <input
                  type="text"
                  placeholder="Enter key"
                  className="form-control me-2"
                  value={key} // Show the key in the input
                  onChange={(e) => handleDynamicInputChange(e.target.value, value)} // Update key and maintain value
                />
                <input
                  type="text"
                  placeholder="Enter value"
                  className="form-control me-2"
                  value={value} // Show the value in the input
                  onChange={(e) => handleDynamicInputChange(key, e.target.value)} // Update value based on the key
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemoveOption(key)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={handleAddNewOption}
            >
              Add New Option
            </button>
          </div>

          {/* Product Category */}
          <div className="form-group mb-3">
            <label>Product Category</label>
            <select
              className="form-control"
              value={productData.CategoryName}
              onChange={(e) => handleStaticInputChange('CategoryName', e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.CategoryName}>
                  {category.CategoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Product Image */}
          <div className="form-group mb-3">
            <label>Product Image</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
            />
            {/* Show existing image */}
            {productData.img && (
              <div className="mt-2">
                <img src={productData.img} alt={productData.name} style={{ width: '150px' }} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-success">
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default EditProduct;
