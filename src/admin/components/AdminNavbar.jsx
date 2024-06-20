/* eslint-disable react/jsx-no-undef */

import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar(props) {

    

    return (
        <header className='bg-light'>
              <nav class="navbar navbar-expand-lg  ">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Admin</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="text-dark nav-link active" aria-current="page" href="#">Dashboard</a>
        </li>
        <li class="nav-item">
          <a class="text-dark nav-link" href="addproducts">Products</a>
        </li>
        <li class="nav-item">
          <a class="text-dark nav-link" href="addcategory">Category</a>
        </li>
        
      </ul>
    </div>
  </div>
</nav>  
        </header>
    )
}
