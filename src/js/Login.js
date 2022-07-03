import React, { useEffect } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import '../css/register.css'
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'

export default function Login({setActiveUser}) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    useEffect(() => {
      document.body.classList.remove('dark');
      document.body.classList.add('gradient-custom-3');
    }, []);

    const handleSubmit = (e) => {
      e.preventDefault();

      fetch('/login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })
      .then(response => {
        if (response.status === 403) {
          window.location.href = "/forbidden";
        }
        else if (response.status === 260) {
          response.json()
          .then(data => {
            window.location.href= `/login/not-verified?uid=${data}`
          })
        }
        else if (response.status === 200) {
          setActiveUser(true);
        }
      });
    }

    return (
        <section className="vh-100 bg-image bg-url">
          <div className="mask d-flex align-items-center h-100 gradient-custom-3">
            <div className="container h-100">
              <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-9 col-lg-7 col-xl-6">
                  <div className="card">
                    <div className="card-body p-5">
                      <p className="text-center response-message"></p>
                      <h2 className="text-uppercase text-center mb-5">Влез в акаунта си</h2>
                      <form className="custom-form" action="/login" onSubmit={handleSubmit} method = "post" id="login-form"> 
                        <input type="hidden" id="checkout-products"/>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor="form3Example1cg">Потребителско име</label>
                          <input onChange={e => {setUsername(e.target.value)}} type="text" name="username" id="form3Example1cg" className="custom-form-control form-control-lg" />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor="form3Example4cg">Парола</label>
                          <input onChange={e => {setPassword(e.target.value)}} type="password" name="password" id="form3Example4cg" className="custom-form-control form-control-lg" />
                        </div>
                        <div className="d-flex justify-content-center">
                          <button type="submit" className="btn btn-success btn-block btn-lg gradient-custom-4 text-body">Влез</button>
                        </div>
                        <p className="text-center text-muted mt-5 mb-0">Нямате акаунт? <Link to="/register" className="fw-bold text-body"><u>Регистрирайте се тук</u></Link></p>
                      </form>
                    </div>
                    <Link to="/" className="btn btn-success btn-block btn-lg gradient-custom-4 text-body home-page"><i className="fas fa-home"></i></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>     
    );

}
