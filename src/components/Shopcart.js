import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/shopcart.css'
import ShopcartProductList from "./ShopcartProductList";
import VouchersList from "./VouchersList";

export default function Shopcart() {
    const [usedVouchers, setUsedVouchers] = useState([]);
    let subtotal;
    let vat;
    let vatsubtotal;

    function checkProductQuantity() {
        fetch(`/shopcart/get-all-products-details?vouchers=${usedVouchers}`, {
            method: 'GET'
        })
        .then(response => {
            if (response.status === 200) {
                window.location.replace("/checkout?vouchers=" + usedVouchers);
            }
            else if (response.status === 500) {
                alert("Количеството продукти, което желаете да закупите, вече не е налично! Моля презаредете страницата!");
            }
        })
    }

    return(
        <div>
            <div className="d-flex flex-row container-fluid mt-4">
                <ShopcartProductList/>
                <div className="d-flex p-2 h-100 flex-column bg-light col-3 align-items-center justify-content-between" id="price-window">
                    <table className="table table-dark">
                        <tbody>
                            <tr>
                                <td>Цена без ДДС:</td>
                                <td id="total" className="text-end"></td>
                            </tr>
                            <tr>
                                <td>ДДС:</td>
                                <td id="vat" className="text-end"></td>
                            </tr>
                            <tr>
                                <td>Крайна цена с ДДС:</td>
                                <td id="total-vat" className="text-end"></td>
                            </tr>
                            <tr className="display-none">
                                <td>Отстъпка от ваучери:</td>
                                <td id="vouchers-discount" className="text-end text-danger"></td>
                            </tr>
                            <tr className="display-none">
                                <td>Крайна цена след включена отстъпка:</td>
                                <td id="total-with-discount" className="text-end text-success"></td>
                            </tr>
                        </tbody>
                    </table>
                    <VouchersList/>
                    <button className="checkout-btn btn mx-auto mt-3" onClick={() => checkProductQuantity()}>Завърши Поръчката</button>
                </div>
	    {/*"<% } %>"*/}
	        </div>
        </div>
    );
}