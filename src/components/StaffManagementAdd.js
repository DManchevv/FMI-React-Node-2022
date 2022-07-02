import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/staffManagement.css'

export default function StaffManagementAdd() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        fetch('/staff-management', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        })
        .then(response => {
            if (response.status === 201) {
                alert("Потребителят беше успешно създаден!");
                window.location.href="/staff-management";
            }
            else if (response.status === 400) {
                alert("Вече съществува такова потребителско име или електронна поща!");
                window.location.reload();
            }
            else if (response.status === 460) {
                alert("Данните са в невалиден формат! Моля опитайте отново!");
                window.location.reload();
            }
            else {
                alert("Възникна грешка! Моля опитайте отново!");
                window.location.reload();
            }
        })
    }

    return(
        <div>
            <h1>Създаване на акаунт на Персонал</h1>
            <form id="create-staff-user-form" onSubmit={handleSubmit} className="create-staff-user-form container mx-auto mt-5" action="/staff-management" method="POST">
                <div className="container-fluid">
                    <div className="row justify-content-md-center">
                        <label className="col-4" htmlFor="staff-username">Потребителско Име</label>
                        <input value={username} onChange={e => setUsername(e.target.value)} className="col-8" id="staff-username" type="text" placeholder="staff" name="username"/>
                    </div>
                    <div className="row justify-content-md-center">
                        <label className="col-4" htmlFor="staff-password">Парола</label>
                        <input value={password} onChange={e => setPassword(e.target.value)} className="col-8" id="staff-password" type="password" name="password"/>
                    </div>
                    <div className="row justify-content-md-center">
                        <label className="col-4" htmlFor="staff-email">Електронна Поща</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className="col-8" id="staff-email" type="email" placeholder="staff@eshop.bg" name="email"/>
                    </div>
                    <div className="row justify-content-md-center">
                        <button className="col-4" type="submit">Създай Потребител</button>
                    </div>
                </div>
            </form>
        </div>
    );
}