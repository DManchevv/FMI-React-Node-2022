import './UserItem.css'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import '../css/products.css'

const Product = ({ product }) => {
    const [btnClass, setBtnClass] = useState('shopcart-button-add');

    useEffect(() => {
        fetch(`/shopcart/get-products`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].product_id === product.product_id) {
                    setBtnClass('shopcart-button-remove');
                    break;
                }
            }
        })
    });

    function addProductToShopcart() {
        if (btnClass === 'shopcart-button-add') {
            console.log(product.product_id);
            fetch('/products/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productid: product.product_id
                })
            })
            .then(() => {
                setBtnClass('shopcart-button-remove');
            });
        }
        else {
            fetch('/products/remove-from-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productid: product.product_id
                })
            })
            .then(() => {
                setBtnClass('shopcart-button-add');
            });
        }
    }

    if (product.quantity > 0) {
        return (
            <table>
                <tbody>
                    <tr className="product-summary">
                        <td>
                            <img src={product.image} alt="" width="200px" height="200px" />
                        </td>
                        <td>
                            {product.name}
                        </td>
                        <td>
                            {product.price}
                        </td>
                        <td className='UserItem-button' title="Edt User">
                            <button className={btnClass} onClick={addProductToShopcart}></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
    else {
        return (
            <table>
                <tbody>
                    <tr className="product-summary">
                        <td>
                            <img src={product.image} alt="" width="200px" height="200px" />
                        </td>
                        <td>
                            {product.name}
                        </td>
                        <td>
                            {product.price}
                        </td>
                        <td>
                            <img className='image-out-of-stock' src="stockout.png" alt=""/>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}

Product.propTypes = {
    product: PropTypes.shape({
        product_id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    })
}

export default Product;