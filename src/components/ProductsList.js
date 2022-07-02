import './UsersList.css'
import React from 'react'
import UserItem from './UsersItem'
import { useEffect, useState } from 'react';
import Product from './Product';
import '../css/bootstrap5.css'
import '../css/products.css'

const ProductsList = ({products}) => {
  
    return (
        <div className="d-flex flex-row container-fluid products-gallery justify-content-around">
            {products
                .map(product => (
                <Product key={product.product_id} product={product} />
            ))}
        </div>
    )
}

ProductsList.propTypes = {
}

export default ProductsList;