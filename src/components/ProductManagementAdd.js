import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/productManagementAdd.css'

export default function ProductManagementAdd() {
    const [categories, setCategories] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [manufacturer, setManufacturer] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [quantity, setQuantity] = useState(0);

    useEffect(() => {
        getCategories();
        getManufacturers();
    }, []);

    async function getCategories() {
        await fetch('/product-management/categories', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setCategory(data[0]);
            setCategories(data);
        })
    }

    async function getManufacturers() {
        await fetch('/products/manufacturers', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setManufacturer(data[0]);
            setManufacturers(data);
        })
    }

    function handleSubmit(e) {
        e.preventDefault();

        fetch('/product-management/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                manufacturer: manufacturer,
                category: category,
                price: price,
                description: description,
                summary: summary,
                quantity: quantity
            })
        })
        .then(response => {
            if (response.status === 201) {
                alert("Продуктът беше успешно създаден!");
                window.location.href="/product-management";
            }
            else {
                alert("Възникна грешка! Моля опитайте отново!");
                window.location.reload();
            }
        })
    }

    function loadImage(event) {
        let image = document.getElementById('output');
        image.src = URL.createObjectURL(event.target.files[0]);
    }

    if (categories.length > 0 && manufacturers.length > 0) {
        return(
            <div className="product-operation container-fluid">
                <h1>Добави продукт</h1>
                <form method="post" className="product-add" action="/product-management/add-product" encType = "multipart/form-data">
                    <div className="form-text-fields">
                            Име на продукт
                        <input type="text" onChange={e => {setName(e.target.value)}} name="name" required/><br/>
                            Производител
                        <select name="manufacturer" onChange={e => {setManufacturer(e.target.value)}} required>
                            {manufacturers.map(manufacturer => (
                                <option key={manufacturer.manufacturer_id}>{manufacturer.name}</option>
                            ))}
                        </select>
                            Категория
                        <select name="category" onChange={e => {setCategory(e.target.value)}} required>
                            {categories.map(category => (
                                <option key={category.category_id}>{category.name}</option>
                            ))}
                        </select>
                            Цена
                        <input type="text" onChange={e => {setPrice(e.target.value)}} name="price" required/><br/>
                            Описание
                        <input type="text" onChange={e => {setDescription(e.target.value)}} name="description" required/><br/>
                            Кратко описание (ще се визуализира в главното меню)
                        <input type="text" onChange={e => {setSummary(e.target.value)}} name="summary" required/><br/>
                            Количество
                        <input type="text" onChange={e => {setQuantity(e.target.value)}} name="quantity" required/><br/>
                        <button type="submit" value="Upload">Добави</button>
                    </div>
                    <div className="form-image">
                        <input type="file" name="file" accept="image/*" id="file" onChange={event => loadImage(event)} style={{display: 'none'}}/>
                        <p><label htmlFor="file" style={{cursor: 'pointer'}}>Прикачи изображение</label></p>
                        <p><img id="output" width="300" alt="" /></p>
                    </div>
                </form>
            </div>
        )
    }
    else {
        return (
            <div></div>
        );
    }

    
}