import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar';

const AddCategory = () => {
  const [staticFormData, setStaticFormData] = useState({
    CategoryName: '',
    catimg: '',
  });
 


  const handleStaticInputChange = (fieldName, value) => {
    setStaticFormData({
      ...staticFormData,
      [fieldName]: fieldName == 'catimg' ? value.target.files[0] : value,
    });
  };

  

  const handleSubmit = async (e) => {
  

    const formData = new FormData();

    
    formData.append('CategoryName', staticFormData.CategoryName);

    // Append file data to FormData
    formData.append('catimg', staticFormData.catimg);


    try {
    
      const response = await fetch('https://store-ywot.onrender.com/api/auth/api/category', {
        method: 'POST',
        headers: {

        },
        body: formData,
      });
      console.log('strt2');
      if (response.ok) {
        console.log('strt 3');
        const data = await response.json();
        console.log('API Response:', data);
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
          <form encType="multipart/form-data">
         
           
            <div className='form-group mb-3'>
              <label> Category Name</label>
              <input
                type='text'
                name='CategoryName'
                className='form-control'
                value={staticFormData.CategoryName}
                onChange={(e) => handleStaticInputChange('CategoryName', e.target.value)}
              />
            </div>
            <div className='form-group mb-3'>
              <label>Category Image</label>
              <input
                type='file'
                name='catimg'
                className='form-control'
                onChange={(e) => handleStaticInputChange('catimg', e)}
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

export default AddCategory;
