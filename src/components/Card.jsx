
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
    let food = data.find(item => item.id === foodItem._id && item.size === size);

    if (food) {
        // If the product with the same size exists in the cart, update its quantity
        let updatedPrice = qty * parseInt(options[size]);  // Calculate the new price

        await dispatch({
            type: "UPDATE",
            id: foodItem._id,
            price: updatedPrice,  // Pass the recalculated price
            qty: qty,  // Pass the new quantity
            size: size  // Make sure size is included
        });
    } else {
        // If the product doesn't exist in the cart, add it as a new item
        let finalPrice = qty * parseInt(options[size]);

        await dispatch({
            type: "ADD",
            id: foodItem._id,
            name: foodItem.name,
            price: finalPrice,
            qty: qty,
            size: size,
            img: props.ImgSrc
        });
    }
};

  useEffect(() => {
    if (priceOptions.length > 0) {
      setSize(priceOptions[0]);  // Set default size
    }
  }, [priceOptions]);

  // useEffect(()=>{
  // checkBtn();
  //   },[data])

  let finalPrice = qty * (options[size] ? parseInt(options[size]) : 0);
  // let finalPrice = qty * parseInt(options[size]);   //This is where Price is changing
  // totval += finalPrice;
  // console.log(totval)
  return (
    <div>
      <div className="card mt-3" key={props.item._id} style={{ maxHeight: "360px" }}>
        <img src={props.ImgSrc} className="card-img-top" alt="..." style={{ height: "120px", objectFit: "fill" }} />
        <div className="card-body">
          <Link key={foodItem._id} to={`/viewproduct/${foodItem._id}`}>

            <h5 className="card-title">{props.foodName}</h5>

          </Link>
          {/* <p className="card-text">This is some random text. This is description.</p> */}
          <div className='container w-100 p-0' style={{}}>
            <select className="m-2 h-100 w-20 bg-success text-black rounded" style={{ select: "#FF0000" }} onClick={handleClick} onChange={handleQty}>
              {Array.from(Array(6), (e, i) => {
                return (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>)
              })}
            </select>
            <select className="m-2 h-100 w-20 bg-success text-black rounded" style={{ select: "#FF0000" }} ref={priceRef} onClick={handleClick} onChange={handleOptions}>
              {priceOptions.map((i) => {
                return <option key={i} value={i}>{i}</option>
              })}
            </select>
            <div className=' d-inline ms-2 h-100 w-20 fs-5' >
              ₹{finalPrice}/-
            </div>
          </div>
          <hr></hr>
          <button className={`btn btn-success justify-center ms-2 `} onClick={handleAddToCart}>Add to Cart</button>
          {/* <button className={`btn btn-danger justify-center ms-2 ${btnEnable ? "" : "disabled"}`} onClick={handleRemoveCart}>Remove</button> */}
        </div>
      </div>
    </div>
  )
}
//