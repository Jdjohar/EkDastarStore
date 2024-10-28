/* eslint-disable react/jsx-no-undef */

import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
// import Badge from "@material-ui/core/Badge";
// import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import { useCart } from './ContextReducer';
import Modal from '../Modal';
import Cart from '../screens/Cart';
import '../transparentmenu.css'
import logo from '../../public/logo.png';

export default function Navbar(props) {
    const [cartView, setCartView] = useState(false);
    localStorage.setItem('temp', "first");
    let navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('temp');
        localStorage.removeItem('cart');

        navigate("/login");
    }

    const loadCart = () => {
        setCartView(true);
    }

    const items = useCart();

    return (
        <>
            <div className='home'>
                <nav className="navbar navbar-expand-lg">
                    <div className="container">
                        {/* Logo Image: Use Bootstrap or custom CSS to control the size */}
                        <Link className="navbar-brand" to="/">
                            <img src={logo} alt="Logo" style={{ width: '70px', height: 'auto' }} />
                        </Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse text-uppercase" id="navbarNav">
                            <ul className="navbar-nav ms-auto">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/about">About Us</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/categoies">Categoies</Link>
                                </li>
                              
                                {localStorage.getItem("token") && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/myorder">My Account</Link>
                                    </li>
                                )}
                            </ul>
                            {!localStorage.getItem("token") ? (
                                <div className="d-flex">
                                    <Link className="btn btn-outline-light mx-1" to="/login">Login</Link>
                                    <Link className="btn btn-outline-light mx-1" to="/signup">Signup</Link>
                                    <button className="btn btn-outline-light mx-2 position-relative" onClick={loadCart}>
                                        Cart
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {items.length}
                                        </span>
                                    </button>
                                    {cartView && <Modal onClose={() => setCartView(false)}><Cart /></Modal>}
                                </div>
                            ) : (
                                <div className="d-flex align-items-center">
                                    <button className="btn btn-outline-light mx-2 position-relative" onClick={loadCart}>
                                        Cart
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {items.length}
                                        </span>
                                    </button>
                                    {cartView && <Modal onClose={() => setCartView(false)}><Cart /></Modal>}
                                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </>
    );
}
