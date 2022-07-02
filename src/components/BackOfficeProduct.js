import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/detailedOrder.css'
import { Link } from "react-router-dom";

export default function BackOfficeProduct({product}) {
    const [currentProduct, setCurrentProduct] = useState(product);
    const [activeClass, setActiveClass] = useState(product.active === true ? 'fas fa-trash' : 'fas fa-play');
    let changeStatus = 0;

    useEffect(() => {},[changeStatus]);

    function changeActiveStatus() {
        fetch("/product-management/change-product-active", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: currentProduct.product_id,
                active: !currentProduct.active
            })
        })
        .then(response => {
            if (response.status === 260) {
                if (activeClass === 'fas fa-trash') {
                    setActiveClass('fas fa-play');
                }
                else {
                    setActiveClass('fas fa-trash');
                }

                window.location.reload();
            }
        })
    }

    return(
        <tr className="temporary-data">
            <td className="text-end">{product.product_id}</td>
            <td>{product.name}</td>
            <td className="text-end">{product.price}</td>
            <td className="text-end">{product.quantity}</td>
            <td>{product.m_name}</td>
            <td>{product.c_name}</td>
            <td>{product.active ? "Да" : "Не"}</td>
            <td>{product.description}</td>
            <td>{product.summary}</td>
            <td>
                <div className="actions-cell">
                <Link className="button" to={`/product-management/edit-product/${product.product_id}`} data-toggle="tooltip" data-placement="top" title="Edit">
                    <i className="fas fa-edit"></i>
                </Link>
                <button data-toggle="tooltip" data-placement="top" title="Upload Image">
                    <i className="fas fa-images"></i>
                </button>
                <button data-toggle="tooltip" data-placement="top" title="Activate" onClick={() => changeActiveStatus()}>
                    <i className={activeClass} onClick={() => changeActiveStatus()}></i>
                </button>
                </div>
            </td>
        </tr>
    );
}