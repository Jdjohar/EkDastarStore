import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar2'
import Footer from '../components/Footer'
import Aboutimg from '../../public/about.png'
import { Link } from 'react-router-dom'

const Categories = () => {
    const [foodCat, setFoodCat] = useState([])
    const loadFoodItems = async () => {
        let response = await fetch("https://ekdastar.onrender.comapi/auth/foodData", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        response = await response.json()
        console.log(response, "update");

        setFoodCat(response[1])
    }

    useEffect(() => {
        loadFoodItems()
    }, [])
    return (
        <>
            <Navbar />
            <section class="hero-section d-flex align-items-center">
                <div class="container text-center text-white">
                    <h1 class="display-4">Categories</h1>
                    <p class="lead">Learn more about our company and our mission</p>
                </div>
            </section>

            <section className='py-5'>
                <div class="container p-0">
                    <div class="row text-center g-0">
                        <h2 className="display-4 pt-3 fs-4 pb-4 fw-bold text-uppercase text-center">Explore Our Categories</h2>
                        {foodCat.map((category) => (
                            <div class="col-6 col-md-3" key={category._id}>
                                <div class="gallery-item m-2">
                                    <img src={category.img} alt={category.CategoryName} />
                                    <div class="overlay">
                                        <Link className='text-uppercase text-decoration-none' to={`/products/${category.CategoryName}`}>
                                            <h3 className='text-uppercase'> {category.CategoryName} </h3>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}


export default Categories