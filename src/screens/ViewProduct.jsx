import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar2';
import { useDispatchCart, useCart } from '../components/ContextReducer';

const ViewProduct = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const dispatch = useDispatchCart();
    const cart = useCart();
    const [selectedQty, setSelectedQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [price, setPrice] = useState(0);

    // Handle size change and update price
    const handleSizeChange = (size) => {
        setSelectedSize(size);
        if (product && product.options && product.options.length > 0) {
            const selectedOption = product.options[0][size];
            setPrice(selectedOption);
        }
    };

    // Add to cart or update quantity if item is already in cart
    const addToCart = () => {
        const existingItem = cart.find(
            (item) => item.id === product._id && item.size === selectedSize
        );

        if (existingItem) {
            // Update quantity
            dispatch({
                type: "UPDATE",
                id: product._id,
                qty: selectedQty,
                size: selectedSize,
            });
        } else {
            // Add new item
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

    // Remove item from cart
    const removeFromCart = () => {
        dispatch({
            type: "REMOVE",
            id: product._id,
            size: selectedSize,
        });
    };

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`https://ekdastar.onrender.comapi/auth/getproducts/${productId}`);
                const data = await response.json();
                if (response.status === 200) {
                    setProduct(data.data);
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
            <div className="container pt-5">
                {product && (
                    <div className="row pt-5">
                        <div className="col-md-6">
                            <div className="product-detail">
                                <img src={product.img} className="img-fluid" alt={product.name} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="product-detail">
                                <h3>{product.name}</h3>
                                <h2 className="text-muted">${price}</h2>
                                <p>{product.description}</p>

                                <div className="mb-3">
                                    <label className="form-label">Size</label>
                                    <div>
                                        {product.options && product.options.length > 0 &&
                                            Object.keys(product.options[0]).map((size) => (
                                                <button
                                                    key={size}
                                                    className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                                                    onClick={() => handleSizeChange(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="price" className="form-label">Price</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="price"
                                        value={`$${price}`}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="quantity" className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="quantity"
                                        style={{ width: '100px' }}
                                        value={selectedQty}
                                        onChange={(e) => setSelectedQty(e.target.value)}
                                        min="1"
                                    />
                                </div>

                                <button className="btn btn-dark me-2" onClick={addToCart}>Add to Cart</button>
                                <button className="btn btn-danger" onClick={removeFromCart}>Remove from Cart</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewProduct;
