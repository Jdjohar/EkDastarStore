import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatchCart, useCart } from './ContextReducer';

export default function Card(props) {
  let data = useCart();
  let navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [message, setMessage] = useState(null);  // State for success message
  const priceRef = useRef();
  
  let options = props.options;
  let priceOptions = Object.keys(options);
  let foodItem = props.item;
  const dispatch = useDispatchCart();
  
  const handleClick = () => {
    // if (!localStorage.getItem("token")) {
    //   navigate("/login")
    // }
  };

  const handleQty = (e) => {
    setQty(e.target.value);
  };

  const handleOptions = (e) => {
    setSize(e.target.value);
  };

  const handleAddToCart = async () => {
    let singleItemPrice = parseInt(options[size]);
    let food = data.find(item => item.id === foodItem._id && item.size === size);

    if (food) {
      await dispatch({
        type: "UPDATE",
        id: foodItem._id,
        price: singleItemPrice * qty,
        qty: qty,
        size: size
      });
    } else {
      await dispatch({
        type: "ADD",
        id: foodItem._id,
        name: foodItem.name,
        price: singleItemPrice * qty,
        qty: qty,
        size: size,
        img: props.ImgSrc
      });
    }

    // Set success message after adding item
    setMessage(`Prodcut added to your cart!`);

    // Clear the message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    setSize(priceRef.current.value);
  }, []);

  let finalPrice = qty * (options[size] ? parseInt(options[size]) : 0);

  return (
    <div>
      <div className="card1 text-center mt-3" key={props.item._id} style={{ maxHeight: "400px" }}>
        <img src={props.ImgSrc} className="card-img-top" alt="..." style={{ height: "220px", objectFit: "cover" }} />
        <div className="card-body">
          <div className='category-list py-2'>
            <Link className='text-decoration-none' to={`admin/products/${props.CategoryName}`}>{props.CategoryName}</Link>
          </div>
          <Link className='text-decoration-none' key={foodItem._id} to={`/viewproduct/${foodItem._id}`}>
            <h5 className="card-title product-title text-dark" style={{textWrap:'auto'}}>{props.foodName}</h5>
          </Link>
          <div className='container w-100 p-0'>
            <select className="m-2 h-100 w-20 text-black rounded" onClick={handleClick} onChange={handleQty}>
              {Array.from(Array(6), (e, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select className="m-2 h-100 w-20 text-black rounded" ref={priceRef} onClick={handleClick} onChange={handleOptions}>
              {priceOptions.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <div className='d-inline ms-2 h-100 w-20 fs-5'>
              ${finalPrice}/-
            </div>
          </div>
          <hr />
          <button className="btn btn-success golden-button justify-center ms-2" onClick={handleAddToCart}>
            Add to Cart
          </button>
          
          {/* Display success message */}
          {message && <div className="alert alert-success mt-2" role="alert">{message}</div>}
        </div>
      </div>
    </div>
  );
}
