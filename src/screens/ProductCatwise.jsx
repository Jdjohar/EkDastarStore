import React, { useEffect, useState } from 'react';
import Card from '../components/Card'; // Importing Card component to display products
import { useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const ProductCatwise = () => {
    const { categoryName } = useParams();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/products/category/${categoryName}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                console.log(result, "Cate");

                // Assuming your API returns data in the format: { data: [...] }
                setProducts(result); // Adjust this based on your API's response structure
            } catch (error) {
                console.error('Error fetching products:', error.message);
            }
        };

        fetchProducts(); // Call the fetch function
    }, [categoryName]); // Depend on categoryName so it refetches when it changes

    return (
        <div className='py-5'>
            <Navbar />
            <div className="container">
            <h1 className='py-5'>{categoryName}</h1>
            <div className="row">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className='col-12 col-md-6 col-lg-3'>
                        <Card
                            key={product._id} // Ensure each card has a unique key
                            item={product} // Pass the entire product item
                            options={product.options[0]} // Pass product options
                            foodName={product.name} // Pass product name
                            ImgSrc={product.img} // Pass product image source
                        />
                        </div>
                    ))
                ) : (
                    <p>No products available in this category.</p>
                )}
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProductCatwise;
