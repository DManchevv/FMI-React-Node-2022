import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/productManagement.css'
import BackOfficeProduct from "./BackOfficeProduct";
import { Link } from "react-router-dom";

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [idFilter, setIdFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [quantityFilter, setQuantityFilter] = useState('');
    const [manufacturerFilter, setManufacturerFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSortAscending, setIsSortAscending] = useState(false);
    const [lastSelectedColumn, setLastSelectedColumn] = useState(0);
    const [scrollCounter, setScrollCounter] = useState(0);
    const [categories, setCategories] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        getProducts();
        getCategories();
        getManufacturers();
    }, []);

    function getProducts() {
        fetch('/product-management/get-all-products/1', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setProducts(data);
        })
    }

    async function getCategories() {
        await fetch('/product-management/categories', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setCategories(data);
        })
    }

    async function getManufacturers() {
        await fetch('/products/manufacturers', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setManufacturers(data);
        })
    }

    function filterTable(isClearingTable, sortCol = 0, clickInvoked = false, ascending = true, event) {
        if (clickInvoked === true) {
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
    
        console.log(selects);
        let tmp = scrollCounter;
    
        if (isClearingTable) {
            setScrollCounter(0);
        }
        
        if (!selects.includes(null) && !textFields.includes(null)) {
            fetch(`/product-management/filter-table-data/${scrollCounter}`, {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idSymbol: selects[0].value,
                    idValue: textFields[0].value,
                    nameSymbol: selects[1].value,
                    nameValue: textFields[1].value,
                    priceSymbol: selects[2].value,
                    priceValue: textFields[2].value,
                    quantitySymbol: selects[3].value,
                    quantityValue: textFields[3].value,
                    manufacturer: selects[4].value,
                    category: selects[5].value,
                    active: selects[6].value,        
                    sortCol: sortCol,
                    ascending: ascending
                })
            })
            .then(response => response.json())
            .then(data => {        
                console.log(data);
                setProducts(data);
            })
            .catch(function(res) {
                setScrollCounter(tmp);
            });
        }
    }

        return(
            <div className="products-main-content container-fluid" id="main-content">
            <div className="container-fluid text-center text-danger mt-2 mb-2 response" id="error-msg">
        
            </div>
            <h1 className="text-center">Продукти</h1>
            <div className="d-flex flex-row align-items-center" style={{gap:'1rem'}}>
                <Link to="/product-management/add-product" className="add-product-btn text-center">Добави Продукт</Link>
                <form id="import-form" method="POST" action="/product-management/import-products" encType = "multipart/form-data">
                    <label htmlFor="import-xlsx" className="import-products-btn">Качи продукти от XLSX файл</label>
                    <input id="import-xlsx" type="file" name="file" accept=".xlsx" hidden/>
                </form>
            </div>
            <table id="products-table" className="products-table">
                <tbody>
                <tr className="filter-row">
                    <td className="allow-wrap">
                        <select id="select-1">
                            <option value="=">=</option>
                            <option value="<">&lt;</option>
                            <option value=">">&gt;</option>
                        </select>
                        <input value={idFilter} type="text" id="text-filter-1" onChange={e => {setIdFilter(e.target.value);filterTable(true)} }/>
                    </td>
                    <td className="allow-wrap">
                        <select id="select-2">
                            <option value="=">=</option>
                            <option value="<">&lt;</option>
                            <option value=">">&gt;</option>
                        </select>
                        <input value={nameFilter} type="text" id="text-filter-2" onChange={e => {setNameFilter(e.target.value);filterTable(true)}} />
                    </td>
                    <td className="allow-wrap">
                        <select id="select-3">
                            <option value="=">=</option>
                            <option value="<">&lt;</option>
                            <option value=">">&gt;</option>
                        </select>
                        <input value={priceFilter} type="text" id="text-filter-3" onChange={e => {setPriceFilter(e.target.value);filterTable(true)}} />
                    </td>
                    <td className="allow-wrap">
                        <select id="select-4">
                            <option value="=">=</option>
                            <option value="<">&lt;</option>
                            <option value=">">&gt;</option>
                        </select>
                        <input value={quantityFilter} type="text" id="text-filter-4" onChange={e => {setQuantityFilter(e.target.value);filterTable(true)}} />
                    </td>
                    <td className="allow-wrap">
                        <select value={manufacturerFilter} id="select-5" onChange={e => {setManufacturerFilter(e.target.value);filterTable(true)}}>
                            <option value="all">Всички</option>
                            {manufacturers.map(manufacturer => (
                                <option key={manufacturer.manufacturer_id} value={manufacturer.manufacturer_id}>{manufacturer.name}</option>
                            ))}
                        </select>
                    </td>
                    <td className="allow-wrap">
                        <select value={categoryFilter} id="select-6" onChange={e => {setCategoryFilter(e.target.value);filterTable(true)}}>
                            <option value="all">Всички</option>
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>{category.name}</option>
                            ))}
                        </select>
                    </td>
                    <td>
                        <select value={activeFilter} id="select-7" onChange={e => {setActiveFilter(e.target.value);filterTable(true)}}>
                            <option value="all">Всички</option>
                            <option value="Yes">Да</option>
                            <option value="No">Не</option>
                        </select>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 0, true, true, event)}>Пореден Номер</td>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 1, true, true, event)}>Име</td>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 2, true, true, event)}>Цена</td>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 3, true, true, event)}>Количество</td>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 4, true, true, event)}>Производител</td>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 5, true, true, event)}>Категория</td>
                    <td className="interactable disable-wrap table-header headerUnsorted" onClick={event => filterTable(true, 6, true, true, event)}>Активен</td>
                    <td className="disable-wrap">Описание</td>
                    <td className="disable-wrap">Кратки детайли</td>
                    <td className="disable-wrap">Операции</td>
                </tr>
                {products.map(product => (
                    <BackOfficeProduct key={product.product_id} product={product}/>
                ))}
                </tbody>
            </table>
        </div>
        );
    
}