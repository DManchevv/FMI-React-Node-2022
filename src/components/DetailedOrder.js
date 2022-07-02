import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/detailedOrder.css'
import {useParams} from 'react-router-dom';
import DetailedOrderProduct from "./DetailedOrderProduct";

export default function DetailedOrder() {
    let { id } = useParams();
    const [order, setOrder] = useState(undefined);

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

    useEffect(() => {
        let asyncWrapper = async() => {
            let newOrder = await getOrderDetails();
            setOrder(newOrder);
            console.log(newOrder);
            console.log(newOrder);
        }
        
        asyncWrapper();
    }, []);

    async function getOrderDetails() {
        return await new Promise(async (resolve, reject) => {
            await fetch(`/myOrders/get-specific-order`, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    orderID: id
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                resolve(data);
            })
        }) 
    }

    if (order !== undefined) {
        console.log(order);
        return (
            <div className="orders-list d-flex flex-column" id="order-list">
                <div className="order">
                    <div className="order-details-wrapper">
                        <p>
                            Поръчка № {order.id}
                        </p>
                        <p>
                            Регистрирана на: {order.date.split('T')[0]} {order.date.split('T')[1].split('.')[0]}
                        </p>
                        <p>
                            Цена: {order.price} лв.
                        </p>
                        <p>
                            Отстъпка от ваучери: {order.discount || 0}
                        </p>
                        <p>
                            Статус на поръчката: {status[order.status]}
                        </p>
                        <p>
                            Платежен Метод: {order.type === 'cash' ? "В брой" : "Paypal, Дебитна / Кредитна карта"}
                        </p>
                    </div>
                    <table className="products-table">
                        <tbody>
                            <tr>
                                <td>
                                    ID
                                </td>
                                <td>
                                    Име на продукт
                                </td>
                                <td>
                                    Единична Цена
                                </td>
                                <td>
                                    Количество
                                </td>
                                <td>
                                    Крайна цена на продукта
                                </td>
                            </tr>
                            {order.products.map(product => (
                                <DetailedOrderProduct key={product.id} product={product}/>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    else {
        return(
            <div></div>
        )
    }
}