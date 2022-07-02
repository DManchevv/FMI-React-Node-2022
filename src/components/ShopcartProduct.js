import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/shopcart.css'

export default function ShopcartProduct({shopcartProduct, onProductDelete}) {
    const [product, setProduct] = useState(shopcartProduct);

    let dictionary = {
        en: {
            currency: {
                "bgn": "лв.",
                "usd": "$",
                "eur": "€"
            },
            email: {
                "name": "Име",
                "quantity": "Количество",
                "singlePrice": "Единична Цена",
                "totalPrice": "Общо за продукта"
            },
            status: {
                "PAID": "Платенa",
                "NOT PAID": "Неплатенa",
                "CANCELLED": "Отказанa",
                "ERROR DURING PAYMENT": "Грешка при плащане",
                "SERVER ERROR": "Сървърна грешка",
                "SENT": "Изпратена",
                "DELIVERED": "Доставена",
                "EXPIRED": "Изтекла/Невзета",
                "COMPLETED": "Завъшена",
                "DELIVERY PROBLEM": "Проблем при доставка",
                "all": "Няма избран филтър"
            },
            type: {
                "online": "Онлайн",
                "cash": "В брой",
                "all": "Няма избран филтър"
            },
            yesno: {
                "false": "Не",
                "true": "Да"
            }
        },
        technical: {
            status:{
                1: "PAID",
                2: "NOT PAID",
                3: "CANCELLED",
                4: "ERROR DURING PAYMENT",
                5: "SERVER ERROR",
                6: "SENT",
                7: "DELIVERED",
                8: "EXPIRED",
                9: "COMPLETED",
                10: "DELIVERY PROBLEM"
            } 
        }
    }

    useEffect(() => {
        setShopcartTotalPrice();
    }, []);

    const [vouchersDiscountValue, setVouchersDiscountValue] = useState(0);

    function setShopcartTotalPrice() {
        fetch("/shopcart/recalculate-total-price", {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-vat').innerText = data.vatsubtotal + ' ' + dictionary.en.currency[data.currency];
            document.getElementById('total').innerText = data.subtotal + ' ' + dictionary.en.currency[data.currency];
            document.getElementById('vat').innerText = data.vat + ' ' + dictionary.en.currency[data.currency];
            let totalWithDiscount = parseFloat(data.vatsubtotal) + parseFloat(vouchersDiscountValue);
            console.log(totalWithDiscount);
            if (totalWithDiscount < 0) {
                totalWithDiscount = 0;
            }
    
            document.getElementById('total-with-discount').innerText = totalWithDiscount.toFixed(2) + ' ' + dictionary[data.currency];
        })
    }

    async function decrementQuantity(productId, initialValue) {
        if (product.quantity > 1) {
            let newValue = product.quantity - 1;
            console.log(newValue);
            await fetch("/shopcart/product-quantity-update", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productid: productId,
                    quantity: newValue
                })
            })
            .then(response => response.json())
            .then(data => {
                setProduct({...product, quantity: product.quantity - 1})
                product.product_price = (product.quantity * parseFloat(initialValue)).toFixed(2);
                setShopcartTotalPrice();
            })
        }
    }

    async function incrementQuantity(productId, initialValue) {            
        await fetch(`/shopcart/product-quantity-get?productid=${productId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            updatePriceAndQuantity(data, productId, initialValue);
        });
    }

    async function updatePriceAndQuantity(data, productId, initialValue) {
        if (data[0].quantity > product.quantity) {
            await fetch("/shopcart/product-quantity-update", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productid: productId,
                    quantity: product.quantity + 1
                })
            })
            .then(response => response.json())
            .then(data => {
                setProduct({...product, quantity: product.quantity + 1})
                product.product_price = (product.quantity * parseFloat(initialValue)).toFixed(2);
                setShopcartTotalPrice();
            })
        }
    }

    return(
        <div className="container product-details" id="product-row-<%=row.product_id%>">
            <div className="col d-flex justify-content-end align-items-center">{product.product_id}</div>
            <div className="col-4 d-flex align-items-center">{product.product_name}</div>
            <div className="col d-flex flex-row text-center justify-content-evenly align-items-center product-quantity">
                <button onClick={() => decrementQuantity(product.product_id, product.product_price)}>
                    -
                </button>
                <span id="product-quantity-value-<%= row.product_id %>">{product.quantity}</span>
                <button onClick={() => incrementQuantity(product.product_id, product.product_price)}>
                    +
                </button>
            </div>
            <div className="col-2 d-flex justify-content-end align-items-center">{product.product_price}</div>
            <div id='product-price-<%=row.product_id%>' className="col d-flex justify-content-end align-items-center product-price">{(product.product_price * product.quantity).toFixed(2)}</div>
            <div className="col d-flex align-items-center">{product.product_currency}</div>
            <div className="col text-center">
                <button className="remove-product-btn btn" onClick={() => onProductDelete(product.product_id)}></button>
            </div>
            
        </div>
    );
}