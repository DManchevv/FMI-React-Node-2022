import React from 'react';
import { NavLink } from 'react-router-dom';
import './css/backOfficeNav.css';
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'

export const BackOfficeNav = ({activeUser, onLogout}) => {
    const logout = () => {
        onLogout();
    }

    if (activeUser !== undefined) {
        return (
            <div className="back-office-navbar-wrapper" id="back-office-navbar-wrapper">
			<nav className="back-office-navbar" id="back-office-navbar">
				<a href="/" className="back-office-navbar-brand"><img src="https://cdn.discordapp.com/attachments/491681614359953408/909146883971244062/eshoplogo.png" alt=""/></a>	
				<ul id="back-office-navbar-menu">
					<li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 active nav-client">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/product-management">
                            Продукти
                        </NavLink>
					</li>
					<li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/order-management">
                            Поръчки
                        </NavLink>
					</li>
					<li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/staff-management">
                            Персонал
                        </NavLink>
					</li>
					<li id="back-office-navbar-login" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/users-management">
                            Клиенти
                        </NavLink>
					</li>
                    <li id="back-office-navbar-register" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/target-groups">
                            Целеви Групи
                        </NavLink>
					</li>
                    <li id="back-office-navbar-register" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/promotions">
                            Промоции
                        </NavLink>
					</li>
					<li id="back-office-navbar-register" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/create-roles">
                            Роли
                        </NavLink>
					</li>
                    <li id="back-office-navbar-register" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/email-template">
                            Шаблон за мейли
                        </NavLink>
					</li>
                    <li id="back-office-navbar-register" className="nav-item pl-4 pl-md-0 ml-0 ml-md-4">
                        <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} onClick={() => logout()} to="/back-office">
                            Изход
                        </NavLink>
					</li>
				</ul>
			</nav>
		</div>
        );
    }
    else {
        return (
            <div className="navigation-wrap bg-light start-header start-style">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <nav className="back-office-navbar back-office-navbar-expand-md back-office-navbar-light">
                            
                                <a href="/" className="back-office-navbar-brand"><img src="https://cdn.discordapp.com/attachments/491681614359953408/909146883971244062/eshoplogo.png" alt=""/></a>	
                                
                                <button className="back-office-navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="back-office-navbar-toggler-icon"></span>
                                </button>
                                
                                <div className="collapse back-office-navbar-collapse" id="navbarSupportedContent">
                                    <ul id="back-office-navbar-menu" className="back-office-navbar-nav ml-auto py-4 py-md-0">
                                        <li className="nav-item pl-4 pl-md-0 ml-0 ml-md-4 nav-client">
                                            <NavLink className={[({ isActive }) => isActive ? "active" : undefined, 'nav-link'].join(' ')} to="/">
                                                Начало
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
