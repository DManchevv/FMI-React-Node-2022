import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/ordersHistory.css'
import { useSearchParams } from "react-router-dom";
import Order from "./Order";

export default function OrdersHistory() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch('/myOrders/get-orders/1', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setOrders(data);
        });
    }, []);

    function viewOrder() {

    }

    return(
        <div className="orders-list d-flex flex-column" id="order-list">
            {orders ? orders.map(order => (
                <Order key={order.id} order={order} onOrderView={viewOrder}/>
            )) : ""}
        </div>
    )
}