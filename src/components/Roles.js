import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/roles.css'
import { Link } from "react-router-dom";
import { getRoles } from "@testing-library/react";

export default function Roles() {
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        getRoles();
    }, []);

    async function getRoles() {
        await fetch(`/roles/get-roles`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setRoles(data);
        })
    }

    return(
        <div className="container-fluid">
			<p className="response-message" id="response-message"></p>
			<h1 className="text-center">Управление на Роли и Права</h1>
			<div className="table-wrapper" id="table-wrapper">
				<div>
					<Link className="create-role-btn" id="create-role-btn" to="">Създай роля</Link>
				</div>
				<table className="roles-table" id="roles-table">
                    <tbody>
                        <tr>
                            <td className="col-2">Пореден Номер</td>
                            <td className="col-6">Име</td>
                            <td className="col-4">Операции</td>
                        </tr>
                        {roles.map(role => (
                            <tr key={role.id}>
                                <td className="text-end">{role.id}</td>
                                <td>{role.name}</td>
                                <td>
                                    <div className="operations-div">
                                        <button data-toggle="tooltip" data-placement="top" title="Edit"><i className="fas fa-edit"></i></button>
                                        <button data-toggle="tooltip" data-placement="top" title="Delete"><i className="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
				</table>
			</div>
		</div>
    );
}