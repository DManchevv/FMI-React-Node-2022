import React from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'

export const Nav = ({activeUser, onLogout}) => {
    const logout = () => {
        onLogout();
    }

    if (activeUser === undefined) {
        return (
            <div className="navigation-wrap bg-light start-header start-style">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <nav className="navbar navbar-expand-md navbar-light">
                            
                                <a href="/" className="navbar-brand"><img src="https://cdn.discordapp.com/attachments/491681614359953408/909146883971244062/eshoplogo.png" alt=""/></a>	
                                
                                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon"></span>
                                </button>
                                
                                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul id="navbar-menu" className="navbar-nav ml-auto py-4 py-md-0">
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/">
                                                Начало
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/products">
                                                Продукти
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/contacts">
                                                Свържи се с нас
                                            </NavLink>
                                        </li>
                                        <li id="navbar-login" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/login">
                                                Влез в акаунта си
                                            </NavLink>
                                        </li>
                                        <li id="navbar-register" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/register">
                                                Регистрирай се
                                            </NavLink>
                                        </li>
                                    </ul>
                                </div>
                            </nav>		
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="navigation-wrap bg-light start-header start-style">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <nav className="navbar navbar-expand-md navbar-light">
                            
                                <a href="/" className="navbar-brand"><img src="https://cdn.discordapp.com/attachments/491681614359953408/909146883971244062/eshoplogo.png" alt=""/></a>	
                                
                                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon"></span>
                                </button>
                                
                                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul id="navbar-menu" className="navbar-nav ml-auto py-4 py-md-0">
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/">
                                                Начало
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/products">
                                                Продукти
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/contacts">
                                                Свържи се с нас
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/account">
                                                Моят Профил
                                            </NavLink>
                                        </li>
                                        <li className='nav-item pl-4 pl-md-0 ml-0 ml-md-4'>
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/myOrders">
                                                Моите поръчки
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} onClick={() => logout()} to="/">
                                                Изход
                                            </NavLink>
                                        </li>
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                                            <NavLink className={[({ isActive }) => isActive ? "back-office-active" : undefined, 'nav-link'].join(' ')} to="/shopcart">
                                                <i className="fas fa-shopping-cart fa-2x">&#xf07a;</i>
                                            </NavLink>
                                        </li>
                                    </ul>
                                </div>
                            </nav>		
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
