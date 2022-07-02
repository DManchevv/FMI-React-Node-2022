import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/checkout.css'

export default function CheckoutProduct({product}) {
    return(
        <div className="container product-details" id="product-row-<%=row.product_id%>">
            <div className="col product-id d-flex justify-content-end align-items-center">{product.product_id}</div>
            <div className="col-5 product-name d-flex align-items-center">{product.product_name}</div>
            <div className="col single-product-price d-flex justify-content-end align-items-center">{product.product_price}</div>
            <div className="col justify-content-end product-quantity-value">{product.quantity}</div>
            <div className="col d-flex justify-content-end align-items-center product-price">{(product.product_price * product.quantity).toFixed(2)}</div>
            <div className="col d-flex align-items-center">лв.</div>
        </div>
    );
}