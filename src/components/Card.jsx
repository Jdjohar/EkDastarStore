
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatchCart, useCart } from './ContextReducer'
// import { Dropdown, DropdownButton } from 'react-bootstrap';
export default function Card(props) {
  let data = useCart();

  let navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [size, setSize] = useState("")
  const priceRef = useRef();

  let options = props.options;
  let priceOptions = Object.keys(options);
  // console.log(priceOptions,"priceOptions");

  let foodItem = props.item;
  const dispatch = useDispatchCart();
  const handleClick = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login")
    }
  }
  const handleQty = (e) => {
    setQty(e.target.value);
  }
  const handleOptions = (e) => {
    setSize(e.target.value);
  }
  const handleAddToCart = async () => {
    // Parse the original single-item price for the selected size
    let singleItemPrice = parseInt(options[size]);
    
    // Find if the item with the same id and size already exists in the cart
    let food = data.find(item => item.id === foodItem._id && item.size === size);
    console.log(food, "food Test");
  
    if (food) {
      // If the item already exists, update only the quantity and the total cost
      await dispatch({
        type: "UPDATE",
        id: foodItem._id,
        price: singleItemPrice,  // Use the single-item price
        qty: qty,  // Update quantity
        size: size
      });
    } else {
      // If the item does not exist, add it as a new entry with the single-item price
      await dispatch({
        type: "ADD",
        id: foodItem._id,
        name: foodItem.name,
        price: singleItemPrice,  // Use the single-item price
        qty: qty,
        size: size,
        img: props.ImgSrc
      });
    }
  };
  

  useEffect(() => {
    setSize(priceRef.current.value)
    // if (priceOptions.length > 0) {
    //   setSize(priceOptions[0]);  // Set default size
    // }
  }, []);

  // useEffect(()=>{
  // checkBtn();
  //   },[data])

  let finalPrice = qty * (options[size] ? parseInt(options[size]) : 0);
  // let finalPrice = qty * parseInt(options[size]);   //This is where Price is changing
  // totval += finalPrice;
  // console.log(totval)
  return (
    <div>
      {console.log(props, "props")}
      <div className="card1  text-center mt-3" key={props.item._id} style={{ maxHeight: "400px" }}>
        <img src={props.ImgSrc} className="card-img-top" alt="..." style={{ height: "220px", objectFit: "cover" }} />
        <div className="card-body">
          <div className='category-list py-2'>
            <Link className='text-decoration-none' to={`admin/products/${props.CategoryName}`}>{props.CategoryName} </Link>
          </div>
          <Link className='text-decoration-none' key={foodItem._id} to={`/viewproduct/${foodItem._id}`}>
            <h5 className="card-title product-title text-dark">{props.foodName}</h5>

          </Link>
          {/* <p className="card-text">This is some random text. This is description.</p> */}
          <div className='container w-100 p-0' style={{}}>
            <select className="m-2 h-100 w-20 text-black rounded" style={{ select: "#FF0000" }} onClick={handleClick} onChange={handleQty}>
              {Array.from(Array(6), (e, i) => {
                return (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>)
              })}
            </select>
            <select className="m-2 h-100 w-20 text-black rounded" style={{ select: "#FF0000" }} ref={priceRef} onClick={handleClick} onChange={handleOptions}>
              {priceOptions.map((i) => {
                return <option key={i} value={i}>{i}</option>
              })}
            </select>
            <div className=' d-inline ms-2 h-100 w-20 fs-5' >
              ${finalPrice}/-
            </div>
          </div>
          <hr></hr>
          <button className={`btn btn-success golden-button justify-center ms-2 `} onClick={handleAddToCart}>Add to Cart</button>
          {/* <button className={`btn btn-danger justify-center ms-2 ${btnEnable ? "" : "disabled"}`} onClick={handleRemoveCart}>Remove</button> */}
        </div>
      </div>
    </div>
  )
}
//