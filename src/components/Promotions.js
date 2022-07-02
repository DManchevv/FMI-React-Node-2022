import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/promotions.css'
import { Link } from "react-router-dom";

export default function Promotions() {
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        getPromotions();
    }, []);

    async function getPromotions() {
        await fetch(`/promotions`, {
            method: 'GET'
        })
        .then(async response => {
            if (response.status === 200) {
                await response.json()
                .then(data => {
                    setPromotions(data);
                })
            }
            else {
                alert("Нещо се обърка! Моля презаредете страницата!");
            }
        })
    }

    return(
        <div className="container-fluid d-flex flex-column align-items-start" style={{marginLeft: '12rem'}}>
            <p className="h2">Промоции</p>
            <Link className="btn-primary add-btn text-center align-self-start mt-3" to="/promotions/new-promotion">Създай</Link>
            <table className="table table-dark mt-5">
                <thead>
                    <tr>
                        <th>Статус</th>
                        <th>Име</th>
                        <th>Дата на създаване</th>
                        <th>Период на валидност</th>
                        <th>Целева група</th>
                        <th>Стойност</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map(promotion => (
                        <tr key={promotion.id}>
                            <td className="user-id">{promotion.status}</td>
                            <td>{promotion.name}</td>
                            <td>{promotion.creation_date}</td>
                            <td>{promotion.start_date} - {promotion.end_date}</td>
                            <td>{promotion.target_group_name}</td>
                            <td className="text-end">{promotion.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}