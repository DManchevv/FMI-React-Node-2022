import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/shopcart.css'
import Voucher from "./Voucher";

export default function VouchersList() {
    const [vouchers, setVouchers] = useState([]);

    useEffect(() => {
        getVouchers();
    }, []);

    function getVouchers() {
        fetch(`/shopcart`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setVouchers(data.vouchers);
        });
    }

    return(
        <div>
            {vouchers ? vouchers.map(voucher => (
                <Voucher key={voucher.id} voucher={voucher} />
            )) : ""}
        </div>        
    );
}