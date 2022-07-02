import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/staffManagement.css'
import { Link } from "react-router-dom";

export default function StaffUser({user, onStaffDelete}) {
    return(
        <tr className="temporary-data">
            <td className="text-end">{user.id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>
                <div className="actions">
                    <Link to={`/staff-management/${user.id}`}><i className="fas fa-edit"></i></Link>
                    <button onClick={() => onStaffDelete(user.id)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
}