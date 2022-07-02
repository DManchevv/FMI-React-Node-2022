import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/checkout.css'
import CheckoutProduct from "./CheckoutProduct";

export default function CheckoutList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts();
    }, []);

    function getProducts(){
        fetch("/shopcart/get-products", {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setProducts(data);
        })
    }

    return(
        <div>
            {products ? products.map(
                product => (
                    <CheckoutProduct key={product.product_id} product={product}/>
                )) : ""}
        </div>
    );
}