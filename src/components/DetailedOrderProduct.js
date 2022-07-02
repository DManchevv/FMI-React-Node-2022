import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/detailedOrder.css'

export default function DetailedOrderProduct({product}) {
    return(
        <tr>
            <td className="text-end">{product.id}</td>
            <td>{product.name}</td>
            <td className="text-end">{product.singleUnitPrice}</td>
            <td className="text-end">{product.quantity}</td>
            <td className="text-end">{product.price}</td>
        </tr>
    );
}