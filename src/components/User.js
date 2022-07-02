import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/usersManagement.css'
import { Link } from "react-router-dom";

export default function User({user}) {
    function blockUser() {

    }

    return(
        <tr className="temporary-data">
            <td className="text-end">{user.user_id}</td>
            <td>{user.firstname}</td>
            <td>{user.lastname}</td>
            <td>{user.birthdate.split('T')[0]} {user.birthdate.split('T')[1].split('.')[0]}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.sex}</td>
            <td>{user.citizenship}</td>
            <td>{user.address}</td>
            <td>{user.address2}</td>
            <td>{user.verified ? "Да" : "Не"}</td>
            <td>{user.active? "Активен" : "Неактивен"}</td>
            <td>
                <div className="actions-cell">
                    <button className="details-btn" data-toggle="tooltip" id="change-status-btn" title="Suspend" onClick={() => blockUser(user.id)}>
                        Блокирай
                    </button>
                </div>
            </td>
        </tr>
    );
}