import React, { useEffect } from "react"
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductsList from "../components/ProductsList";
import '../css/products.css'

export default function Products() {
    const [products, setProducts] = useState([]);
    let helper = [];

    useEffect(() => {
        console.log("I fired twice");
        getProducts();
    }, []);

    const getProducts = async() => {
        await fetch(`/products/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json()).then(async data => {
            for (let i = 0; i < data.length; i++) {
                await fetch(`/products/getByCategory/${data[i].category_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(async response => await response.json()).then(data => {
                    helper = helper.concat(data);
                });
            }

            setProducts(helper);
        });
    }

    return(
        <main className="main-content container-fluid d-flex flex-row">
            <div className="products-gallery-wrapper col-sm" id="gallery">
                <h1>Лаптопи</h1>
                <div className="products-gallery-border">
                    <div className="products-gallery justify-content-around" id="category-2">
                        <ProductsList products={products.filter(p => p.c_name === "Лаптопи")}/>
                        <Link className="frontend-products-btn" to="/products/fullCategory/2/page/1">Виж повече</Link>
                    </div>
                </div>
                <h1>Телевизори</h1>
                <div className="products-gallery-border">
                    <div className="products-gallery justify-content-around" id="category-1">
                        <ProductsList products={products.filter(p => p.c_name === "Телевизори")}/>
                        <Link className="frontend-products-btn" to="/products/fullCategory/1/page/1">Виж повече</Link>
                    </div>
                </div>
            </div>
        </main>
    )
}