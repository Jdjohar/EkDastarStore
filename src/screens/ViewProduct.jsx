import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useDispatchCart } from '../components/ContextReducer';

const ViewProduct = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const dispatch = useDispatchCart();
    const [selectedQty, setSelectedQty] = useState(1); // Default quantity
    const [selectedSize, setSelectedSize] = useState(""); // Default size
    const [price, setPrice] = useState(0);
    const handleSizeChange = (size) => {
        setSelectedSize(size);
        if (product && product.options && product.options.length > 0) {
            const selectedOption = product.options[0][size]; // Assuming there's only one set of options in the array
            setPrice(selectedOption);
        }
    };
    const addToCart = () => {
        if (product) {
            // Dispatch an action to add the product to the cart
            dispatch({
                type: "ADD",
                id: product._id,
                name: product.name,
                qty: selectedQty,
                size: selectedSize,
                price: price * selectedQty,
                img: product.img,
            });
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://foodcareerengine.onrender.com/api/auth/getproducts/${productId}`);
                const data = await response.json();
                if (response.status === 200) {
                    setProduct(data.data);

                    // Set the first available size as the default selected size
                    if (data.data.options && data.data.options.length > 0) {
                        const firstSize = Object.keys(data.data.options[0])[0];
                        setSelectedSize(firstSize);
                        setPrice(data.data.options[0][firstSize]);
                    }
                } else {
                    console.error('Failed to fetch product:', data.message);
                }
            } catch (error) {
                console.error('Error fetching product:', error.message);
            }
        };

        fetchProduct();
    }, [productId]);

    return (
        <div>
            <Navbar />

            <div className='container pt-5'>
                {product && (
                    <div className='row pt-5'>
                        <div className='col-md-6'>
                            <div className='productdetail'>
                                <img src={product.img} className='img-fluid' alt='Product' />
                            </div>
                        </div>

{console.log(product)}
                        <div className='col-md-6'>
                            <div className='product-detail'>
                                <h3>{product.name}</h3>
                                <h2>{product.price}</h2>

                                <p className='font-weight-normal'>{product.description}</p>
                                <div className='qty'>
                                     {/* Size Dropdown */}
                                     <div className='mb-3'>
                                    <label htmlFor='size' className='form-label'>
                                        Size
                                    </label>
                                    <select
                                        className='form-select'
                                        id='size'
                                        value={selectedSize}
                                        onChange={(e) => handleSizeChange(e.target.value)}
                                    >
                                        <option value='' disabled>Select Size</option>
                                        {product.options && product.options.length > 0 &&
                                            Object.keys(product.options[0]).map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className='mb-3'>
                                    <label htmlFor='price' className='form-label'>
                                        Price
                                    </label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='price'
                                        value={`$${price}`}
                                        readOnly
                                    />
                                </div>

                                <div className='qty'>
                                    <div className='mb-3'>
                                        <label htmlFor='quantity' className='form-label'>
                                            Quantity
                                        </label>
                                        <input
                                            type='number'
                                            className='form-control'
                                            style={{ width: '200px' }}
                                            id='quantity'
                                            value={selectedQty}
                                            onChange={(e) => setSelectedQty(e.target.value)}
                                        />
                                    </div>
                                </div>
                               

                                    <div className='addtocart'>
                                        <button className='btn btn-dark' onClick={addToCart}>Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                )}
            </div>

        </div>
    );
};

export default ViewProduct;
