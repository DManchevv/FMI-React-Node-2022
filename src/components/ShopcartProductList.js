import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/shopcart.css'
import ShopcartProduct from "./ShopcartProduct";

export default function ShopcartProductList() {
    const [products, setProducts] = useState([]);

    function getProducts() {
        fetch(`/shopcart`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setProducts(data.data);
        });
    }

    function deleteProduct(product_id) {
        fetch("/products/remove-from-cart", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productid: product_id
            })
        })
        .then(response => {
            console.log(response.status);
            if (response.status === 200) {
                console.log("YO");
                setProducts(oldProducts => oldProducts.filter(r => r.product_id !== product_id));
            }
        })
    }

    useEffect(() => {
        getProducts();
    }, []);

    return(
        <div className="d-flex flex-row container-fluid mt-4">
            <div className="shopcart-products d-flex flex-column col-9 mt-0" id="shopcart-products">
                <div className="container product-details first-product">
                    <div className="col text-center">Пореден Номер</div>
                    <div className="col-4 d-flex justify-content-center align-items-center">Име на Продукт</div>
                    <div className="col d-flex flex-row text-center justify-content-evenly align-items-center product-quantity">
                        <div id="product-quantity-value">Количество</div>
                    </div>
                    <div className="col-2 d-flex justify-content-center align-items-center">Единична цена</div>
                    <div className="col d-flex justify-content-center align-items-center">Цена</div>
                    <div className="col d-flex justify-content-center align-items-center">Валута</div>
                    <div className="col d-flex justify-content-center align-items-center">Премахни</div>
                </div>
                    {products.map(product => (
                        <ShopcartProduct key={product.product_id} shopcartProduct={product} onProductDelete={deleteProduct} />
                    ))}
                <div className="container d-flex flex-column checkout-form p-3" id="checkout-form">
                    <div>Адрес на доставка</div>
                    <input id="checkout-address-input" type="text"/>
                    <div>Забележки по поръчката</div>
                    <textarea className="checkout-note"></textarea>
                    <div id="checkout-total-price" className="text-center"></div>
                </div>
            </div>
        </div>
    );
}