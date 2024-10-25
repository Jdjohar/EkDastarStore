import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar';

const AddCategory = () => {
  const [categoryData, setCategoryData] = useState({
    categoryName: '',
    img: null,  // For image file upload
  });

  const handleInputChange = (fieldName, value) => {
    setCategoryData({
      ...categoryData,
      [fieldName]: fieldName === 'img' ? value.target.files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('CategoryName', categoryData.categoryName);
    formData.append('img', categoryData.img);  // Append the image file

    try {
      const response = await fetch('http://localhost:5000/api/auth/addcategory', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Category added successfully');
        setCategoryData({ categoryName: '', img: null }); // Reset the form
      } else {
        console.error('Failed to add category:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding category:', error.message);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container py-5">
        <div className="row py-5">
          <div className="col-md-6 offset-md-3">
            <h2>Add New Category</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group mb-3">
                <label>Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryData.categoryName}
                  onChange={(e) => handleInputChange('categoryName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>Category Image</label>
                <input
                  type="file"
                  name="img"
                  className="form-control"
                  onChange={(e) => handleInputChange('img', e)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Add Category
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCategory;
