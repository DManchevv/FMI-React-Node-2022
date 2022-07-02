import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/shopcart.css'

export default function Voucher({voucher}) {
    <div style={{position: 'relative'}} id={voucher.id} className="d-flex flex-row voucher container-fluid align-items-center p-2 justify-content-around">
        <img src="/voucher.webp" alt="" width="200" height="125"/>
        <div className="d-flex flex-column">
            <p>Ваучер: {voucher.name}</p>
            <p>Срок на валидност:</p>
            <p>{voucher.expiration_date.split(' ')[0]}</p>
            <p>Стойност: {voucher.value} лв.</p>
        </div>
        <div className="voucher-label w-100 h-100 filter-background d-flex justify-content-center align-items-center display-none"> 
            Премахни ваучер
        </div>
    </div>
}