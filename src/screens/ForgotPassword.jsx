import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom'
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          const response = await fetch('https://ekdastar.onrender.comapi/auth/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });
      
          if (response.ok) {
            const data = await response.json();
      console.log(data);
            // Check if resetToken is present in the response
            if (data.resetToken) {
              const resetToken = data.resetToken;
              setMessage('Email Sent! Please reset your password!')
            //   navigate(`/reset-password/${resetToken}`);
            } else {
              setMessage('An error occurred. Please try again.sd');
            }
          } else {
            const errorData = await response.json();
            setMessage(errorData.message || 'An error occurred. Please try again.');
          }
        } catch (error) {
          setMessage('An error occurred. Please try again.');
          console.error('Fetch error:', error);
        }
      };
    
  return (
    <div style={{backgroundImage: 'url("https://images.pexels.com/photos/326278/pexels-photo-326278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', height: '100vh', backgroundSize: 'cover' }}>
      <div>
        <Navbar />
      </div>
      <div className='container'>
        <form onSubmit={handleSubmit} className='w-50 m-auto mt-5 border bg-dark border-success rounded' >
          <div className="m-3">
            <label htmlFor="exampleInputEmail1" className="form-label text-white">Email address</label>
            <input 
            type="email" 
            className="form-control" 
            name='email'   
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
             />
            <div id="emailHelp" className="form-text">We'll never share your email with anyone.</div>
          </div>
          
      
          
          <button type="submit" className="m-3 btn btn-success">Submit</button>
        
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  )
}
