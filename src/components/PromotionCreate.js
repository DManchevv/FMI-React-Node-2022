import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/newPromotion.css'

export default function PromotionCreate() {
    const [targetGroups, setTargetGroups] = useState([]);
    const [targetGroup, setTargetGroup] = useState('');
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [voucherExpirationDate, setVoucherExpirationDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        getTargetGroups();
    }, []);

    async function getTargetGroups() {
        await fetch(`/target-groups`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setTargetGroups(data);
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        await fetch(`/promotions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                targetGroup: targetGroup,
                value: value,
                startDate: startDate,
                endDate: endDate,
                voucherExpirationDate: voucherExpirationDate
            })
        })
        .then(response => {
            if (response.status === 201) {
                alert("Промоцията беше създадена успешно!");
                window.location.href="/promotions";
            }
            else {
                alert("Възникна грешка! Моля опитайте отново!");
                window.location.reload();
            }
        })
    }

    return(
        <div className="container d-flex flex-column align-items-start mx-auto">
            <p className="container-fluid error-msg text-danger h1 text-center" id="error-msg"></p>
            <p className="h1 container-fluid mx-auto">Нова Промоция</p>
            <form id="form" onSubmit={handleSubmit} className="d-flex flex-column mx-auto mb-auto form mt-5" method="post" action="/promotions/create-promotion">
                <p className="h1 mt-4">Създай Промоция</p>
                <input value={name} onChange={e => setName(e.target.value)} name="name" id="promotion-name" placeholder="Име" className="mt-4 form-control" type="text" required/>
                <select value={targetGroup} onChange={e => setTargetGroup(e.target.value)} name="targetGroup" id="target-group" className="form-select mt-4" required>
                    <option value="" disabled>Целева група</option>
                    {targetGroups.map(targetGroup => (
                        <option key={targetGroup.id} value={targetGroup.id}>{targetGroup.name}</option>
                    ))}
                </select>
                <input value={value} onChange={e => setValue(e.target.value)} name="value" id="promotion-value" placeholder="Стойност" className="mt-4 form-control" type="text" required/>
                <input value={voucherExpirationDate} onChange={e => setVoucherExpirationDate(e.target.value)} name="voucher_expiration_date" 
                       id="voucher-expiration-date" placeholder="Дата на изтичане на ваучерите" className="mt-4 form-control" type="date" required/>
                <label className="form-label h4 mt-4">Период на валидност</label>
                <input value={startDate} onChange={e => setStartDate(e.target.value)} name="startDate" id="start-date" className="form-control mt-3" type="date" required/>
                <input value={endDate} onChange={e => setEndDate(e.target.value)} name="endDate" id="end-date" className="form-control mt-4" type="date" required/>
                <button type="submit" className="btn btn-light mt-4">Създай</button>
            </form>
        </div>
    );
}