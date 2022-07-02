import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/targetGroups.css'
import User from "./User";
import Group from "./Group";
import { Link } from "react-router-dom";

export default function TargetGroups() {
    const [targetGroups, setTargetGroups] = useState([]);

    useEffect(() => {
        getTargetGroups();
    }, []);

    async function getTargetGroups() {
        await fetch(`/target-groups`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setTargetGroups(data);
        });
    }

    return(
        <div className="container-fluid d-flex flex-column align-items-start" style={{marginLeft: '12rem'}}>
            <p className="h2">Целеви групи</p>
            <Link className="btn-primary add-btn text-center align-self-start mt-3" to="/new-target-group">Създай</Link>
            <table className="table table-dark mt-5">
                <thead>
                    <tr>
                        <th>Пореден Номер</th>
                        <th>Име</th>
                        <th>Брой получатели</th>
                    </tr>
                </thead>
                <tbody>
                    {targetGroups.map(targetGroup => (
                        <Group key={targetGroup.id} targetGroup={targetGroup}/>
                    ))}
                </tbody>
            </table>
        </div>
    );
}