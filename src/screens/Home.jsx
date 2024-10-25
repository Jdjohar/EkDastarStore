import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import slider from '../../public/1.jpg'
import slider2 from '../../public/2.jpg'
import slider3 from '../../public/3.jpg'
import slide1 from '../../public/slide 1.jpg'
import slide2 from '../../public/slide 2.jpg'
import slide3 from '../../public/slide 3.jpg'
import { Link } from 'react-router-dom'
import { Truck, DollarSign, Clock } from "lucide-react"

export default function Home() {
  const [foodCat, setFoodCat] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [search, setSearch] = useState('')

  const loadFoodItems = async () => {
    let response = await fetch("http://localhost:5000/api/auth/foodData", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = await response.json()
    console.log(response, "update");

    setFoodItems(response[0])
    setFoodCat(response[1])
  }

  useEffect(() => {
    loadFoodItems()
  }, [])

  // Filter featured items
  const featuredItems = foodItems.filter(item => item.featured === true)

  return (
    <div>
      <div>
        <Navbar />
      </div>

      <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
        {/* Carousel Section */}
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={slider} className="d-block w-100" alt="Slide 1 " />
          </div>
          <div className="carousel-item">
            <img src={slider2} className="d-block w-100" alt="Slide 2" />
          </div>
          <div className="carousel-item">
            <img src={slider3} className="d-block w-100" alt="Slide 3" />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <div className="container py-3">
        {/* Service Highlights */}
        <div className="row  py-3 text-center">
          <div className="col-md-4">
            <Truck className="mb-2" size={24} />
            <h5 className="mb-0 text-size">FREE SHIPPING & RETURN</h5>
            <p className="text-muted small mb-0">Free shipping on all orders over $99.</p>
          </div>
          <div className="col-md-4">
            <DollarSign className="mb-2" size={24} />
            <h5 className="mb-0 text-size">MONEY BACK GUARANTEE</h5>
            <p className="text-muted small mb-0">100% money back guarantee</p>
          </div>
          <div className="col-md-4">
            <Clock className="mb-2" size={24} />
            <h5 className="mb-0 text-size">ONLINE SUPPORT 24/7</h5>
            <p className="text-muted small mb-0">Lorem ipsum dolor sit amet.</p>
          </div>
        </div>
      </div>


      <div className='container'>
        <div className='row'>
          <div className='col-md-4 col-12'>
            <div className='img-block'>
              <img src={slide1} className='w-100' />
            </div>
          </div>
          <div className='col-md-4 col-12'>
            <div className='img-block'>
              <img src={slide2} className='w-100' />
            </div>
          </div>
          <div className='col-md-4 col-12'>
            <div className='img-block'>
              <img src={slide3} className='w-100' />
            </div>
          </div>


        </div>
      </div>

      {/* Featured Products Section */}
      <section style={{ background: '#fbfbfb' }} className='my-5'>
        <div className='container py-5'>
          <h2 className="display-4 pt-3 fs-4 fw-bold text-uppercase text-center">Our Featured Products</h2>
          <div className='row'>

            {console.log(featuredItems, 'item')
            }
            {featuredItems.length > 0 ? featuredItems.map((item) => (
              <div key={item._id} className='col-12 col-md-6 col-lg-3 mb-4'>
                <Card
                  foodName={item.name}
                  CategoryName={item.CategoryName}
                  item={item}
                  key={item._id}
                  options={item.options[0]}
                  ImgSrc={item.img}
                />
              </div>
            )) : <p className="text-center">No featured products available</p>}
          </div>
        </div>
      </section>
      {/* Category Section */}
     

      <div class="container p-0">
        <div class="row text-center g-0">
        <h2 className="display-4 pt-3 fs-4 pb-4 fw-bold text-uppercase text-center">Explore Our Categories</h2>
          {foodCat.map((category) => (
            <div class="col-6 col-md-3" key={category._id}>
              <div class="gallery-item">
                <img src={category.img} alt={category.CategoryName} />
                <div class="overlay">
                  <h3 className='text-uppercase'>{category.CategoryName}</h3>
                </div>
              </div>
            </div>

          ))}
        </div>
      </div>

      {/* All Products Section */}
      {/* <div className='container'>
        {foodCat.length > 0 && foodCat.map((data) => (
          <div className='row mb-3' key={data._id}>
            <div className='fs-3 m-3'>
              {data.CategoryName}
            </div>
            <hr id="hr-success" style={{ height: "4px", backgroundImage: "-webkit-linear-gradient(left,rgb(0, 255, 137),rgb(0, 0, 0))" }} />
            {foodItems.length > 0 ?
              foodItems.filter((items) =>
                items.CategoryName === data.CategoryName &&
                items.name.toLowerCase().includes(search.toLowerCase())
              ).map(filterItems => (
                <div key={filterItems._id} className='col-12 col-md-6 col-lg-3'>
                  <Card
                    foodName={filterItems.name}
                    item={filterItems}
                    key={filterItems._id}
                    options={filterItems.options[0]}
                    ImgSrc={filterItems.img}
                  />
                </div>
              ))
              : <div>No Such Data</div>}
          </div>
        ))}
      </div> */}

      <Footer />
    </div>
  )
}
