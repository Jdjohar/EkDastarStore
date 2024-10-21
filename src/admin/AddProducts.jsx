import React, { useState, useEffect } from 'react';
import AdminNavbar from './components/AdminNavbar';

const AddProduct = () => {
  const [staticFormData, setStaticFormData] = useState({
    name: '',
    description: '',
    CategoryName: '',
    img: '',
  });

  const [options, setoptions] = useState([{ key: '', value: '' }]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://store-ywot.onrender.com/api/auth/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array ensures that the effect runs only once on mount

  const handleStaticInputChange = (fieldName, value) => {
    setStaticFormData({
      ...staticFormData,
      [fieldName]: fieldName === 'img' ? value.target.files[0] : value,
    });
  };

  const handleDynamicInputChange = (index, keyOrValue, value) => {
    const newoptions = [...options];
    newoptions[index][keyOrValue] = value;
    setoptions(newoptions);
  };

  const handleAddNew = () => {
    setoptions([...options, { key: '', value: '' }]);
  };

  const handleRemove = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setoptions(newOptions);
  };

  // const handleSubmit = async (e) => {
  //   const formData = new FormData();
  //   formData.append('name', staticFormData.name);
  //   formData.append('description', staticFormData.description);
  //   formData.append('CategoryName', staticFormData.CategoryName);
  //   formData.append('img', staticFormData.img);

  //   const opt = JSON.stringify([
  //     options.reduce((acc, { key, value }) => {
  //       if (key && value) {
  //         acc[key] = value;
  //       }
  //       return acc;
  //     }, {}),
  //   ]);
  //   formData.append('options', opt);

  //   try {
  //     const response = await fetch('https://store-ywot.onrender.com/api/auth/addproducts', {
  //       method: 'POST',
  //       headers: {},
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('API Response:', data);
  //     } else {
  //       console.error('API Error:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('name', staticFormData.name);
    formData.append('description', staticFormData.description);
    formData.append('CategoryName', staticFormData.CategoryName);
    formData.append('img', staticFormData.img);  // Image file
    const opt = JSON.stringify(
      options.reduce((acc, { key, value }) => {
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {})
    );
    formData.append('options', opt);
  
    try {
      const response = await fetch('https://store-ywot.onrender.com/api/auth/addproducts', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Product added:', data);
      } else {
        console.error('API Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  return (
    <>
      <AdminNavbar />
      <div className='container py-5'>
        <div className='row'>
          <div className='col-md-6 offset-md-3'>
            <form encType='multipart/form-data'>
              <div className='form-group mb-3'>
                <label>Product Name</label>
                <input
                  type='text'
                  className='form-control'
                  name='name'
                  value={staticFormData.name}
                  onChange={(e) => handleStaticInputChange('name', e.target.value)}
                />
              </div>
              <div className='form-group mb-3'>
                <label>Product Description</label>
                <input
                  type='text'
                  name='description'
                  className='form-control'
                  value={staticFormData.description}
                  onChange={(e) => handleStaticInputChange('description', e.target.value)}
                />
              </div>
              <div className='form-group mb-3'>
                {options.map((data, index) => (
                  <div key={index}>
                    <input
                      type='text'
                      placeholder='Enter key'
                      value={data.key}
                      onChange={(e) => handleDynamicInputChange(index, 'key', e.target.value)}
                    />
                    <input
                      type='text'
                      placeholder='Enter value'
                      value={data.value}
                      onChange={(e) => handleDynamicInputChange(index, 'value', e.target.value)}
                    />
                    <button type='button' onClick={() => handleRemove(index)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type='button' onClick={handleAddNew}>
                  Add new
                </button>
              </div>

              <div className='form-group mb-3'>
                <label>Product Category</label>
                <select
                  name='CategoryName'
                  className='form-control'
                  value={staticFormData.CategoryName}
                  onChange={(e) => handleStaticInputChange('CategoryName', e.target.value)}
                >
                  <option value=''>Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.CategoryName}>
                      {category.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className='form-group mb-3'>
                <label>Product Image</label>
                <input
                  type='file'
                  name='img'
                  className='form-control'
                  onChange={(e) => handleStaticInputChange('img', e)}
                />
              </div>

              <button type='button' onClick={handleSubmit}>
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
