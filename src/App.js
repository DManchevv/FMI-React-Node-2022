import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Nav } from './Nav';
import { Welcome } from './js/Welcome';
import { NotFound } from './NotFound';
import Register from './js/Register';
import Login from './js/Login';
import Products from './js/Products';
import NotVerified from './components/NotVerified';
import Forbidden from './components/Forbidden';
import Account from './components/Account';
import Shopcart from './components/Shopcart';
import Checkout from './components/Checkout';
import Paypal from './components/Paypal';
import OrdersHistory from './components/OrdersHistory';
import DetailedOrder from './components/DetailedOrder';
import { BackOfficeNav } from './BackOfficeNav';
import ProductManagement from './components/ProductManagement';
import BackOfficeLogin from './components/BackOfficeLogin';
import OrderManagement from './components/OrderManagement';
import ProductManagementEdit from './components/ProductManagementEdit';
import ProductManagementAdd from './components/ProductManagementAdd';
import StaffManagement from './components/StaffManagement';
import StaffManagementEdit from './components/StaffManagementEdit';
import StaffManagementAdd from './components/StaffManagementAdd';
import UsersManagement from './components/UsersManagement';
import TargetGroups from './components/TargetGroups';
import TargetGroupCreate from './components/TargetGroupCreate';
import Promotions from './components/Promotions';
import PromotionCreate from './components/PromotionCreate';
import Roles from './components/Roles';
import EmailTemplate from './components/EmailTemplate';

function App() {
  const [activeUser, setActiveUser] = useState(undefined);
  const [backOfficeActiveUser, setBackOfficeActiveUser] = useState(undefined);

  if (activeUser === undefined) {
    fetch(`/api/checkUser`)
    .then(response => {
      if (response.status === 200) {
        setActiveUser(true);
      }
      else {

      }
    })
  }

  if (backOfficeActiveUser == undefined) {
    fetch(`/api/checkBackOfficeUser`)
    .then(response => {
      if (response.status === 200) {
        setBackOfficeActiveUser(true);
      }
      else {

      }
    })
  }

  const registerUser = async user => {
    await fetch(`/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: user.name,
        surname: user.surname,
        username: user.username,
        password: user.password,
        email: user.email,
        countries: user.country,
        birthdate: user.birthdate,
        sex: user.sex,
        address: user.address
      })
    })
    .then(data => {
      if (data.status === 401) {
        data.text().then(text => {alert(text)});
      }
    })
    .catch(error => {
      error.text().then(text => {console.log(text)});
    })
  }
  
  const login = (username, password) => {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
    })
    .then(data => {
      console.log(data);
      if (data.status === 401 || data.status === 400) {
        data.text().then(text => alert(text));
      }
      else {
        data.json().then(data => setActiveUser(data.user.id));
      }
    })

    return false;
  }
  
  const logout = () => {
    fetch('/logout', {
      method: 'GET'
    })
    .then(response => {
      if (response.status === 200) {
        setActiveUser(undefined);
      }
      else {
        alert("Възникна грешка! Моля опитайте отново!");
      }
    })
  }

  const backOfficeLogout = () => {
    fetch('/staff-logout', {
      method: 'GET'
    })
    .then(response => {
      if (response.status === 200) {
        setBackOfficeActiveUser(undefined);
      }
      else {
        alert("Възникна грешка! Моля опитайте отново!")
      }
    })
  }

  const sendVerificationEmail = async (uid) => {
    console.log(uid);
    await fetch(`/login/not-verified/send-email?uid=${uid}`, {
      method: 'GET'
    })
    .then(() => {
      window.location.href = "/login";
    });
  }

  const activateUser = () => {
    setActiveUser(true);
  }

  const activateBackOfficeUser = () => {
    setBackOfficeActiveUser(true);
  }

  console.log(window.location.href);

  if (window.location.href !== "http://localhost:5000/back-office" && window.location.href !== "http://localhost:5000/product-management" &&
      window.location.href !== "http://localhost:5000/order-management" && !window.location.href.includes("http://localhost:5000/product-management/edit-product") &&
      window.location.href !== "http://localhost:5000/product-management/add-product" && !window.location.href.includes("http://localhost:5000/staff-management") &&
      !window.location.href.includes("http://localhost:5000/users-management") && !window.location.href.includes("http://localhost:5000/target-groups") &&
      window.location.href !== "http://localhost:5000/new-target-group" && !window.location.href.includes("http://localhost:5000/promotions") &&
      window.location.href !== "http://localhost:5000/create-roles" && window.location.href !== "http://localhost:5000/email-template") {

    return (
      <BrowserRouter>
        <Nav activeUser={activeUser} onLogout={logout}/>
        <Routes>
          <Route path='/' element={<Welcome/>}/>
          <Route path='/register' element={<Register onAddUser={registerUser} />} />
          <Route path='/login' element={<Login setActiveUser={activateUser} />} />
          <Route path='/products' element={<Products />} />
          <Route path='/account' element={<Account/>}/>
          <Route path='/shopcart' element={<Shopcart/>}/>
          <Route path='/checkout' element={<Checkout/>}/>
          <Route path='/checkout/paypal' element={<Paypal/>}/>
          <Route path='/myOrders' element={<OrdersHistory/>}/>
          <Route path='/myOrders/order-details/:id' element={<DetailedOrder/>}/>
          <Route path='/login/not-verified' element={<NotVerified sendVerificationEmail={sendVerificationEmail}/>}/>
          <Route path='/forbidden' element={<Forbidden/>}/>
          <Route path='*' element={<NotFound />} /> 
        </Routes>
      </BrowserRouter>
    );
  }
  else {
    return (
      <BrowserRouter>
        <BackOfficeNav activeUser={backOfficeActiveUser} onLogout={backOfficeLogout}/>
        <Routes>
          <Route path='/back-office' element={<BackOfficeLogin setActiveUser={activateBackOfficeUser}/>}/>
          <Route path='/product-management' element={<ProductManagement />}/>
          <Route path='/product-management/edit-product/:id' element={<ProductManagementEdit />}/>
          <Route path='/product-management/add-product' element={<ProductManagementAdd />}/>
          <Route path='/order-management' element={<OrderManagement />}/>
          <Route path='/staff-management' element={<StaffManagement />}/>
          <Route path='/staff-management/:id' element={<StaffManagementEdit />}/>
          <Route path='/staff-management/create-user' element={<StaffManagementAdd />}/>
          <Route path='/users-management' element={<UsersManagement />}/>
          <Route path='/target-groups' element={<TargetGroups/>}/>
          <Route path='/new-target-group' element={<TargetGroupCreate/>}/>
          <Route path='/promotions' element={<Promotions/>}/>
          <Route path='/promotions/new-promotion' element={<PromotionCreate/>}/>
          <Route path='/create-roles' element={<Roles/>}/>
          <Route path='/email-template' element={<EmailTemplate/>}/>
        </Routes>
      </BrowserRouter>
    )
  }
  

}

export default App;






{/*<Route path='/filter-recipes' element={<RecipeFilter recipes={recipes} filterRecipes={filterRecipesByUser} sortByCreationDate={sortByCreationDate} filterRecipesByTags={filterRecipesByTags} onRecipeDelete={deleteRecipe}/>} />*/}
