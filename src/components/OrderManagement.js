import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/productManagement.css'
import BackOfficeOrder from "./BackOfficeOrder";

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [idFilter, setIdFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [buyerFilter, setBuyerFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('all');
    const [statuses, setStatuses] = useState([]);
    const [types, setTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [isSortAscending, setIsSortAscending] = useState(false);
    const [lastSelectedColumn, setLastSelectedColumn] = useState(0);
    const [scrollCounter, setScrollCounter] = useState(0);

    useEffect(() => {
        getOrders();
        getStatuses();
        getTypes();
        getCurrencies();
    }, []);

    async function getStatuses() {
        await fetch('/order-management/get-all-statuses', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setStatuses(data);
        })
    }

    async function getTypes() {
        await fetch('/order-management/get-all-types', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setTypes(data);
        })
    }

    async function getCurrencies() {
        await fetch('/order-management/get-all-currencies', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setCurrencies(data);
        })
    }

    async function getOrders() {
        await fetch('/order-management/get-all/1', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setOrders(data);
        })
    }

    function filterTable(isClearingTable, sortCol = 0, clickInvoked = false, ascending = true, event) {
        if (clickInvoked === true) {
            console.log(lastSelectedColumn);
            console.log(isSortAscending);
            if (lastSelectedColumn === sortCol) {
                setIsSortAscending(!isSortAscending);
                ascending = isSortAscending;
            }
            else {
                setLastSelectedColumn(sortCol);
                setIsSortAscending(false);
            }
        
            let allTableHeaders = document.getElementsByClassName('table-header');
        
            for (let i = 0; i < allTableHeaders.length; i++) {
                if (allTableHeaders[i].classList.contains('headerUnsorted') === false) {
                    allTableHeaders[i].classList.remove('headerSortDown');
                    allTableHeaders[i].classList.remove('headerSortUp');
                    allTableHeaders[i].classList.add('headerUnsorted');
                }
            }
    
            if (ascending === false) {
                event.target.classList.add('headerSortDown');
                event.target.classList.remove('headerSortUp');
                event.target.classList.remove('headerUnsorted');
            }
            else {
                event.target.classList.add('headerSortUp');
                event.target.classList.remove('headerSortDown');
                event.target.classList.remove('headerUnsorted');
            }
        }
        else {
            if (isSortAscending === false) {
                ascending = false;
            }
        }
    
        const numberOfSelects = 7;
        const numberOfTextFields = 4;
    
        let selects = [];
        let textFields = [];
    
        for (let i = 1; i <= numberOfSelects; i++) {
            selects.push(document.getElementById('select-' + i));
        }
    
        for (let i = 1; i <= numberOfTextFields; i++) {
            textFields.push(document.getElementById('text-filter-' + i));
        }
    
        let tmp = scrollCounter;
    
        if (isClearingTable) {
            setScrollCounter(0);
        }
    
        if (!selects.includes(null) && !textFields.includes(null)) {
            fetch("/order-management/filter-table-data/" + scrollCounter, {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idSymbol: selects[0].value,
                    idValue: textFields[0].value,
                    dateSymbol: selects[1].value,
                    dateValue: textFields[1].value,
                    status: selects[2].value,
                    type: selects[3].value,
                    buyerIDSymbol: selects[4].value,
                    buyerIDValue: textFields[2].value,
                    priceSymbol: selects[5].value,
                    priceValue: textFields[3].value,
                    currency: selects[6].value,
                    sortCol: sortCol,
                    ascending: ascending
                })
            }) 
            .then(response => response.json())
            .then(data => {        
                console.log(data);
                setOrders(data);
            })
            .catch(function(res) {
                setScrollCounter(tmp);
            });
        }
    }
    return(
        <div className="mx-auto main-content">
                <div className="container-fluid text-center response" id="response-msg"></div>
                <h1 className="text-center">Поръчки</h1>
                <table id="products-table" className="products-table mx-auto">
                    <tbody>
                        <tr className="filter-row">
                            <td>
                                <div className="d-flex flex-column align-items-center">
                                    <select id="select-1">
                                        <option value="=">=</option>
                                        <option value="<">&lt;</option>
                                        <option value=">">&gt;</option>
                                    </select>
                                </div>
                                <input value={idFilter} type="text" id="text-filter-1" onChange={e => {setIdFilter(e.target.value);filterTable(true)}} />
                            </td>
                            <td>
                                <div className="d-flex flex-column align-items-center">
                                    <select id="select-2">
                                        <option value="=">=</option>
                                        <option value="<">&lt;</option>
                                        <option value=">">&gt;</option>
                                    </select>
                                    <input value={dateFilter} type="text" id="text-filter-2" onChange={e => {setDateFilter(e.target.value);filterTable(true)}} />
                                </div>
                            </td>
                            <td>
                                <select value={statusFilter} id="select-3" onChange={e => {setStatusFilter(e.target.value);filterTable(true)}}>
                                    <option value="all">Всички</option>
                                    {statuses.map(status => (
                                        <option key={status.id} value={status.name}>{status.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <select value={typeFilter} id="select-4" onChange={e => {setTypeFilter(e.target.value);filterTable(true)}}>
                                    <option value="all">Всички</option>
                                    {types.map(type => (
                                        <option key={type.type} value={type.type}>{type.type}</option>
                                    ))}
                                </select>
                            </td>
                            <td>
                                <div className="d-flex flex-column align-items-center">
                                    <select id="select-5">
                                        <option value="=">=</option>
                                        <option value="<">&lt;</option>
                                        <option value=">">&gt;</option>
                                    </select>
                                    <input value={buyerFilter} type="text" id="text-filter-3" onChange={e => {setBuyerFilter(e.target.value);filterTable(true)}} />
                                </div>
                            </td>
                            <td>
                                <div className="d-flex flex-column align-items-center">
                                    <select id="select-6">
                                        <option value="=">=</option>
                                        <option value="<">&lt;</option>
                                        <option value=">">&gt;</option>
                                    </select>
                                    <input value={priceFilter} type="text" id="text-filter-4" onChange={e => {setPriceFilter(e.target.value);filterTable(true)}} />
                                </div>
                            </td>
                            <td>
                                <select value={currencyFilter} id="select-7" onChange={e => {setCurrencyFilter(e.target.value);filterTable(true)}}>
                                    <option value="all">Всички</option>
                                    {currencies.map(currency => (
                                        <option key={currency.currency} value={currency.currency}>{currency.bgcurrency}</option>
                                    ))}
                                </select>
                            </td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 0, true, true, event)}>Пореден Номер</td>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 1, true, true, event)}>Дата</td>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 2, true, true, event)}>Статус</td>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 3, true, true, event)}>Тип</td>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 4, true, true, event)}>ID на купувача</td>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 5, true, true, event)}>Обща сума</td>
                            <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 6, true, true, event)}>Валута</td>
                            <td>Продукти</td>
                            <td>Смени статус</td>
                        </tr>

                        {orders.map(order => (
                            <BackOfficeOrder key={order.id} order={order}/>
                        ))}
                    </tbody>
                </table>
            </div>
    );
}