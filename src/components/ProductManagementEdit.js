import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/productManagementEdit.css'
import { useParams } from "react-router-dom";

export default function ProductManagementEdit() {
    let { id } = useParams();
    const [product, setProduct] = useState(undefined);
    const [name, setName] = useState('');
    const [m_name, setM_name] = useState('');
    const [c_name, setC_name] = useState('');
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);

    useEffect(() => {
        getProduct();
    }, []);

    async function getProduct() {
        await fetch('/product-management/get-product-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        })
        .then(async response => {
            if (response.status === 200) {
                await response.json()
                .then(data => {
                    setProduct(data);
                    setName(data.name);
                    setC_name(data.c_name);
                    setM_name(data.m_name);
                    setDescription(data.description);
                    setSummary(data.summary);
                    setPrice((data.price / 1.2).toFixed(2));
                    setQuantity(data.quantity);
                })
            }
            else {
                alert("Възникна грешка! Моля презаредете страницата!");
            }
        })
    }

    function handleSubmit(e) {
        e.preventDefault();

        fetch('/product-management/update-product', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                name: name,
                manufacturer: m_name,
                category: c_name,
                price: price,
                description: description,
                summary: summary,
                quantity: quantity
            })
        })
        .then(response => {
            if (response.status === 200) {
                alert("Продуктът беше успешно модифициран!");
                window.location.href="/product-management";
            }
            else {
                alert("Възникна грешка! Моля опитайте отново!");
                window.location.reload();
            }
        })
    }

    if (product !== undefined) {
        return (
            <div className="product-operation container mx-auto">
                <h1>Модифицирай продукт</h1>
                <form method="post" className="product-modification mx-auto" action="/product-management/update-product" onSubmit={handleSubmit} encType = "application/json">
                    ID на продукт
                    <input type="text" value={product.product_id} name="id" id="update-product-id" className="product-id" readOnly/><br/>
                    Име на продукт
                    <input type="text" onChange={e => {setName(e.target.value)}} value={name} name="name" id="update-product-name"/><br/>
                    Производител
                    <input type="text" onChange={e => {setM_name(e.target.value)}} value={m_name} name="manufacturer" id="update-product-manufacturer"/><br/>
                    Категория
                    <input type="text" onChange={e => {setC_name(e.target.value)}} value={c_name} name="category" id="update-product-category"/><br/>
                    Цена БЕЗ ДДС
                    <input type="text" onChange={e => {setPrice(e.target.value)}} value={price} name="price" id="update-product-price"/><br/>
                    Описание
                    <input type="text" onChange={e => {setDescription(e.target.value)}} value={description} name="description" id="update-product-description"/><br/>
                    Кратко Описание
                    <input type="text" onChange={e => {setSummary(e.target.value)}} value={summary} name="summary" id="update-product-summary"/><br/>
                    Количество
                    <input type="text" onChange={e => {setQuantity(e.target.value)}} value={quantity} name="quantity" id="update-product-quantity"/><br/>
                    <button type="submit">Модифицирай</button>
                </form>
            </div>
        );
    }
    else {
        return (
            <div>

            </div>
        )
    }
}