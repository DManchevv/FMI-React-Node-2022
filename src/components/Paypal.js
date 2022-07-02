import { useEffect, useState } from "react";
import { PayPalButton } from "react-paypal-button-v2";

export default function Paypal() {
    let isPaid = false;
    const [orderId, setOrderId] = useState(null);
    const [orderValue, setOrderValue] = useState(0);

    useEffect(() => {
        let newOrderId;
        let asyncWrapper = async () => {
            newOrderId = await getOrderId();
            console.log(newOrderId);
            setOrderId(newOrderId);
            console.log(orderId);

            const newOrderValue = await getOrderValue(newOrderId);
            console.log(newOrderValue);
            setOrderValue(newOrderValue);
        }
        asyncWrapper();
        
        console.log(orderValue);
    }, []);

    // get order ID
    async function getOrderId() {
        return await new Promise(async(resolve, reject) => {
            if (orderId === null) {
                await fetch("/checkout/paypal/orderid", {
                    method: 'GET'
                })
                .then(response => response.json()
                .then(data => {
                    console.log(data);
                    resolve(data[0].max);
                }))
            }
        })
        
    }

    async function getOrderValue(newOrderId) {
        return await new Promise(async(resolve, reject) => {
            await fetch(`/checkout/paypal/get-order-details?orderId=${newOrderId}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                setOrderValue(parseFloat(data[0].price));
                return convertToUSD();
            })
        })
    }

    function convertToUSD() {
        /*fetch("/currencyConverter", {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            return (orderValue * data.USD).toFixed(2);
        })*/
        return (orderValue * 0.53).toFixed(2);
    }

    return (
        <PayPalButton
        createOrder={(data, actions) => {
            return fetch('/checkout/paypal/create-order', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    price: orderValue
                })
            }).then(function(res) {
                return res.json();
            }). then(function (data) {
                return data.orderID;
            })
        }}
        onApprove={(data, actions) => {
                // Full available details
                fetch('/checkout/paypal-capture-transaction',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        paypalOrderID: data.orderID,
                        orderID: orderId
                    })
                })
                .then(async response => {

                    if (response.status === 270) {
                        const element = document.getElementById('buttons-container');
                        element.innerHTML = `<div class="answer-container">
                                                <h3>` + data.message + `</h3>
                                                <a href="/">Продължи към Начална Страница!</a>
                                            </div>`;
                    }
                    else if (response.status === 280) {
                        let data = await response.json();
                        console.log(data);
                        fetch("/checkout/paypal/update-order-status", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                newStatus: 5,
                                orderId: orderId
                            })
                        })
                        .then(() => {
                            const element = document.getElementById('buttons-container');
                            element.innerHTML = '<h3>' + data.message + '</h3>'
                        });
                    }
                    else if (response.status === 260) {
                        fetch("/checkout/paypal/update-order-status", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                newStatus: 1,
                                orderId: orderId
                            })
                        })
                        .then(data => {
                            alert("Плащането е успешно!");
                            window.location.href="/";
                        });
                    }
                })
                .catch(res => {
                    fetch("/checkout/paypal/update-order-status", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            newStatus: 5,
                            orderId: orderId
                        })
                    })
                    .then(() => {
                        alert("Нещо се обърка! Моля презаредете страницата!");
                    })
                })  
            } 
        }
        onError={function(err) {
            fetch("/checkout/paypal/update-order-status", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newStatus: 4,
                    orderId: orderId
                })
            })
            .then(() => {
                alert("Възникна неочаквана грешка! Моля презаредете страницата!");
            })
        }}

        onCancel={function() {
            fetch("/checkout/paypal/update-order-status", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newStatus: 3,
                    orderId: orderId
                })
            });
        }}
        />
    );
}