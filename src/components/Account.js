import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/account.css'

export default function Account() {
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        getCredentials();
    }, []);

    async function getCredentials() {
        await fetch(`/myAccount/details`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setEmail(data[0].email);
            setAddress(data[0].address);
        });
    }

    return(
        <div>
            <div className="container-fluid text-center h1 my-account-heading">Вашите данни</div>
                <div className="container d-flex flex-row profile-details mx-auto">
                    <div className="d-flex flex-column profile-information mx-auto">
                        <div className="container-fluid">
                            <span>Електронна поща: </span>
                            <span className="container-fluid" id="user-email">{email}</span>
                        </div>
                        <div className="container-fluid" id="address-wrapper">
                            <span>Адрес: </span>
                            <span className="container-fluid" id="user-address">{address}</span>
                        </div>
                    </div>
                </div>
        </div>
    );
}