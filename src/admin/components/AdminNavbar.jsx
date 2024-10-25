/* eslint-disable react/jsx-no-undef */

import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar(props) {



  return (
    //         <header className='bg-light'>
    //               <nav class="navbar navbar-expand-lg  ">
    //   <div class="container-fluid">
    //     <a class="navbar-brand" href="#">Admin</a>
    //     <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    //       <span class="navbar-toggler-icon"></span>
    //     </button>
    //     <div class="collapse navbar-collapse" id="navbarNav">
    //       <ul class="navbar-nav">
    //         <li class="nav-item">
    //           <a class="text-dark nav-link active" aria-current="page" href="#">Dashboard</a>
    //         </li>
    //         <li class="nav-item">
    //           <a class="text-dark nav-link" href="addproducts">Products</a>
    //         </li>
    //         <li class="nav-item">
    //           <a class="text-dark nav-link" href="addcategory">Category</a>
    //         </li>
    //         <li class="nav-item dropdown">
    //         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    //           Dropdown
    //         </a>
    //         <div class="dropdown-menu" aria-labelledby="navbarDropdown">
    //           <a class="dropdown-item" href="#">Action</a>
    //           <a class="dropdown-item" href="#">Another action</a>
    //           <div class="dropdown-divider"></div>
    //           <a class="dropdown-item" href="#">Something else here</a>
    //         </div>
    //       </li>

    //       </ul>
    //     </div>
    //   </div>
    // </nav>  
    //         </header>
    <>
      <nav class="navbar navbar-expand-lg  bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Navbar</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class=" text-dark nav-link active" aria-current="page" href="#">Dashboard</a>
              </li>
   
              <li class="nav-item dropdown">
                <a class="text-dark nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Products
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/admin/addproducts">Add Products</a></li>
                  <li><a class="dropdown-item" href="/admin/productlist">Product List</a></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Add Category
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/admin/addcategory">Add Category</a></li>
                  <li><a class="dropdown-item" href="/admin/categoryList">Category List</a></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Orders
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="/admin/orderList">Order List</a></li>
                  <li><a class="dropdown-item" href="#">Another action</a></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
              </li>
             
            </ul>
            <form class="d-flex" role="search">
              <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
              <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
          </div>
        </div>
      </nav>
    </>
  )
}
