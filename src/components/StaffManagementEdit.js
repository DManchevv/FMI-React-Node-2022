import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/productManagementEdit.css'
import { useParams } from "react-router-dom";

export default function StaffManagementEdit() {
    let { id } = useParams();
    const [user, setUser] = useState(undefined);
    const [username, setUserame] = useState('');
    const [email, setEmail] = useState(''); 

    useEffect(() => {
        getUser();
    }, []);

    async function getUser() {
        await fetch(`/staff-management/get-user/${id}`, {
            method: 'GET'
        })
        .then(response => {
            if (response.status === 200) {
                response.json()
                .then(data => {
                    setUser(data);
                    setUserame(data.username);
                    setEmail(data.email);
                })
            }
            else {
                alert("Възникна грешка! Моля опитайте отново!");
            }
        })
    }

    function handleSubmit(e) {
        e.preventDefault();

        fetch(`/staff-management/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email
            })
        })
        .then(response => {
            if (response.status === 200) {
                alert("Потребителят беше успешно модифициран!");
                window.location.href="/staff-management";
            }
            else {
                alert("Възникна грешка! Моля опитайте отново!");
                window.location.reload();
            }
        })
    }

    if (user !== undefined) {
        return (
            <div className="product-operation container mx-auto">
                <h1>Редактирай потребител</h1>
                <form method="post" className="product-modification mx-auto" action={`/staff-management/${id}`} onSubmit={handleSubmit} encType = "application/json">
                    ID на потребител
                    <input type="text" value={id} name="id" id="update-product-id" className="product-id" readOnly/><br/>
                    Потребителско име
                    <input type="text" onChange={e => {setUserame(e.target.value)}} value={username} name="username" id="update-user-username"/><br/>
                    Електронна поща
                    <input type="text" onChange={e => {setEmail(e.target.value)}} value={email} name="email" id="update-user-email"/><br/>
                    <button type="submit">Редактирай</button>
                </form>
            </div>
        );
    }
    else {
        return(
            <div></div>
        )
    }
    
}