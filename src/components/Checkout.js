import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/checkout.css'
import CheckoutList from "./CheckoutList";
import { useSearchParams } from "react-router-dom";

export default function Checkout() {
    const [price, setPrice] = useState(0);
    const [vouchersDiscount, setVouchersDiscount] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [vouchers, setVouchers] = useState([]);

    useEffect(() => {
        calculateTotalPrice();
    }, []);

    async function calculateTotalPrice() {
        await fetch(`/shopcart`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setPrice(data.totals.vatsubtotal);
            setVouchers(data.vouchers);
        });

        await fetch(`/checkout/calculate-final-price`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vouchers: searchParams.get("vouchers")
            })
        })
        .then(response => response.json())
        .then(data => {
            setVouchersDiscount(data);
        })
    }

    async function triggerPaymentGateway(e) {
        let discount = e.currentTarget.discount;
    
        // Merge arrays into JSON
        let productsInfo = [];

        let productsIdArray = [];
        let productsNameArray = [];
        let productsSinglePriceArray = [];
        let productsPriceArray = [];
        let productsQuantityArray = [];

        let productsIds = document.querySelectorAll('.product-id');
        let productsNames = document.querySelectorAll('.product-name');
        let productsSinglePrice = document.querySelectorAll('.single-product-price');
        let productQuantityValue = document.querySelectorAll('.product-quantity-value');
        let productPrice = document.querySelectorAll('.product-price');

        for (let i = 0; i < productsIds.length; i++) {
            productsIdArray.push(productsIds[i].innerText);
            productsNameArray.push(productsNames[i].innerText);
            productsSinglePriceArray.push(productsSinglePrice[i].innerText);
            productsPriceArray.push(productPrice[i].innerText);
            productsQuantityArray.push(productQuantityValue[i].innerText);
        }
        
        for (let i = 0; i < productsQuantityArray.length; i++) {
            productsInfo.push({
                id: productsIdArray[i],
                name: productsNameArray[i],
                singleUnitPrice: productsSinglePriceArray[i],
                price: productsPriceArray[i],
                quantity: productsQuantityArray[i]
            });
        }
        
        let productsJSON = {};
    
        productsInfo = JSON.stringify(productsInfo);
    
        productsJSON["products"] = productsInfo;
    
        productsJSON = JSON.stringify(productsJSON);
    
        console.log(productsJSON);

        // Sending post request
        let isPaypalChecked = document.getElementById('paypal') ? document.getElementById('paypal').checked : false;
        let isCashChecked = document.getElementById('cash').checked;
    
        if (isPaypalChecked === false && isCashChecked === false) {
            alert("Моля посочете платежен метод!");
        }
        else {
            await fetch("/checkout/paypal", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paypal: isPaypalChecked,
                    totalPrice: (price - vouchersDiscount).toFixed(2),
                    products: productsJSON,
                    discount: discount,
                    vouchers: vouchers
                })
            })
            .then(response => response.json())
            .then(data => {
                window.location.href = data.path;
            });
        }
    }

    return(
        <div>
            <div className="h1 text-center text-danger mb-5 mt-2" id="error-message"></div>

            <div className="shopcart-products d-flex flex-column" id="shopcart-products">
                <div className="container product-details first-product text-center">
                    <div className="col">Пореден Номер</div>
                    <div className="col-5">Име на продукт</div>
                    <div className="col">Единична Цена</div>
                    <div className="col">Количество</div>
                    <div className="col">Цена</div>
                    <div className="col">Валута</div>
                </div>
                <CheckoutList/>
                <div className="container product-details">
                    <div className="col-10">
                        Отстъпка от ваучери в абсолютна стойност:
                    </div>
                    <div className="col-2 text-danger">
                        -{vouchersDiscount} лв.
                    </div>
                </div>
                <div className="container checkout-info">
                    <div className="payment-options">
                        <div>
                            <input type="radio" id="paypal" name="payment-method" value="paypal"/>
                            <label htmlFor="paypal" className="text-light">
                                Paypal / Дебитна(Кредитна) карта
                            </label>
                        </div>
                        <div>
                            <input type="radio" id="cash" name="payment-method" value="cash"/>
                            <label htmlFor="cash" className="text-light">
                                В брой
                            </label>
                        </div>
                    </div>
                    <div className="total-price-value" id="total-price">
                        Крайна сума: {price} лв.
                    </div>
                </div>
                <button className="checkout-btn btn mx-auto" onClick={e => triggerPaymentGateway(e)}>Плати</button>
            </div>
        </div>
    );
}