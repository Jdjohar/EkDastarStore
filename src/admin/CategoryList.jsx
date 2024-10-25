import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/categories');
        const data = await response.json();

        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter((category) => category._id !== id));
          alert('Category deleted successfully');
        } else {
          alert('Error deleting category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className='container py-5'>
        <h2 className='py-5'>Category List</h2>
        <table className='table'>
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.CategoryName}</td>
                <td>
                  <img src={category.img} alt={category.CategoryName} style={{ width: '100px' }} />
                </td>
                <td>
                  <Link to={`/admin/categoryEdit/${category._id}`} className='btn btn-warning me-2'>Edit</Link>
                  <button className='btn btn-danger' onClick={() => handleDelete(category._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CategoryList;
