import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/ordersHistory.css'
import {Link} from 'react-router-dom';

export default function Order({order}) {
    let status = {
        1: "Платена",
        2: "Неплатена",
        3: "Отказана",
        4: "Грешка по време на плащане",
        5: "Сървърна грешка",
        6: "Изпратена за доставка",
        7: "Доставена",
        8: "Изтекла",
        9: "Завършена",
        10: "Проблем при доставка"
    } 

    return(
        <div className="order">
            <div className="order-details-wrapper">
                <p>
                    Поръчка № {order.id}
                </p>
                <p>
                    Регистрирана на: {order.date.split('T')[0]} {order.date.split('T')[1].split('.')[0]}
                </p>
                <p>
                    Отстъпка от ваучери: {order.discount || 0}
                </p>
                <p>
                    Цена: {order.price} лв.
                </p>
                <p>
                    Статус на поръчката: {status[order.status]}
                </p>
            </div>
            <Link className="btn order-details-btn" to={`/myOrders/order-details/${order.id}`}>Детайли за поръчката</Link>
        </div>
    );
}