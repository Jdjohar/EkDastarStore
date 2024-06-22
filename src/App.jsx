import './App.css';
import '../node_modules/bootstrap-dark-5/dist/css/bootstrap-dark.min.css'  //npm i bootstrap-dark-5 boostrap
import '../node_modules/bootstrap/dist/js/bootstrap.bundle';
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";

import Home from './screens/Home.jsx';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
// import Navbar from './components/Navbar';
import Login from './screens/Login.jsx';
import Signup from './screens/Signup.jsx';
import { CartProvider } from './components/ContextReducer.jsx';
import MyOrder from './screens/MyOrder.jsx';
import ViewProduct from './screens/ViewProduct.jsx'
import Dashboard  from './admin/Dashboard.jsx';
import AddProduct  from './admin/AddProducts.jsx';
import AddCategory  from './admin/AddCategory.jsx';
import ForgotPassword from './screens/ForgotPassword.jsx';
import ResetPassword from './screens/ResetPassword.jsx';
import CheckoutForm from './screens/CheckoutForm.jsx';
import CheckoutPage from './screens/CheckoutPage.jsx';
import ThankYou from './screens/ThankYou.jsx';
import Stripe from './screens/Stripe.jsx';

function App() {
  return (
    <CartProvider>
      <Router>
        <div>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/myorder" element={<MyOrder />} />
            <Route exact path="/forgotpassword" element={<ForgotPassword />} />
            <Route exact path="/stripe" element={<Stripe />} />
            <Route exact path="/checkoutpage" element={<CheckoutPage />} />
            <Route exact path="/thankyou" element={<ThankYou />} />
            
            <Route exact path="/reset-password/:resetToken" element={<ResetPassword />} />
          
            <Route exact path="/viewproduct/:productId" element={<ViewProduct />} />
            <Route exact path="/admin/dashboard" element={<Dashboard />} />
            <Route exact path="/admin/addproducts" element={<AddProduct />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
