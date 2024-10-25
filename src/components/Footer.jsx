import React from 'react';
import logo from '../../public/logo.png';

export default function Footer() {
  return (
    <footer className="footer bg-dark mt-5 text-white pt-5">
      <div className="container pt-5">
        <div className="row">
          <div className="col-md-12 text-center mb-4">
          <img src={logo} alt="Logo" style={{ width: '70px', height: 'auto' }} />
            <h5 className="my-3">ABOUT THE SHOP</h5>
            <p>
              EK DASTAR is your destination for Sikh Style. Started in 2015, we have been serving customers all over the world with our premium quality turbans and accessories. Your style is unique to you and we want to ensure you can create the best version of yourself.
            </p>
            <div className="mt-3">
              <a href="#" className="social-icon" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>

            <div className='text-center'>
            <ul className="list-unstyled d-flex justify-content-center flex-wrap"> {/* Add flex styles here */}
              <li className="me-3"> {/* Add margin for spacing */}
                <a href="#" className="text-decoration-none text-white" aria-label="Search">Search</a>
              </li>
              <li className="me-3">
                <a href="#" className="text-decoration-none text-white" aria-label="About us">About us</a>
              </li>
              <li className="me-3">
                <a href="#" className="text-decoration-none text-white" aria-label="FAQs">FAQs</a>
              </li>
              <li className="me-3">
                <a href="#" className="text-decoration-none text-white" aria-label="Contact">Contact</a>
              </li>
              <li className="me-3">
                <a href="#" className="text-decoration-none text-white" aria-label="Terms of Service">Terms of Service</a>
              </li>
              <li className="me-3">
                <a href="#" className="text-decoration-none text-white" aria-label="Refund policy">Refund policy</a>
              </li>
            </ul>

            </div>
          </div>
          
        
        </div>
        <hr />
        <div className="row">
          <div className="col-12 mb-3 text-center">
            <small>&copy; {new Date().getFullYear()} EK DASTAR</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
