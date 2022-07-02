import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/detailedOrder.css'

export default function BackOfficeOrder({order}) {
    const [currentOrder, setCurrentOrder] = useState(order);
    let changeStatus = 0;


    return(
        <tr className="temporary-data">
            <td className="text-end">{order.id}</td>
            <td>{order.date.split('T')[0]} {order.date.split('T')[1].split('.')[0]}</td>
            <td>{order.status}</td>
            <td>{order.type}</td>
            <td>{order.user_id}</td>
            <td>{order.price}</td>
            <td>{order.currency}</td>
            <td className="products-table-cell">
                <button data-toggle="tooltip" data-placement="top" title="See more details" className="details-btn">
                    Продукти
                </button>
            </td>
            <td>
                <div className="actions-cell">
                    Финално състояние
                </div>
            </td>
        </tr>
    );
}