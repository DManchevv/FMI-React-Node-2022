import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/usersManagement.css'
import User from "./User";

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [idFilter, setIdFilter] = useState('');
    const [firstnameFilter, setFirstnameFilter] = useState('');
    const [lastnameFilter, setLastnameFilter] = useState('');
    const [birthdateFilter, setBirthdateFilter] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState();
    const [sexFilter, setSexFilter] = useState('all');
    const [addressFilter, setAddressFilter] = useState('');
    const [address2Filter, setAddress2Filter] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSortAscending, setIsSortAscending] = useState(false);
    const [lastSelectedColumn, setLastSelectedColumn] = useState(0);
    const [scrollCounter, setScrollCounter] = useState(0);

    useEffect(() => {
        getUsers();
    }, []);

    async function getUsers() {
        await fetch(`/users-management`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setUsers(data);
        })
    }

    function filterTable(isClearingTable, sortCol = 0, clickInvoked = false, ascending = true, event) {
        if (clickInvoked === true) {
            if (lastSelectedColumn == sortCol) {
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
    
        const numberOfSelects = 11;
        const numberOfTextFields = 8;
    
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
            fetch(`/users-management/filter-table-data/${scrollCounter}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idSymbol: selects[0].value,
                    idValue: textFields[0].value,
                    firstNameSybmol: selects[1].value,
                    firstNameValue: textFields[1].value,
                    lastNameSymbol: selects[2].value,
                    lastNameValue: textFields[2].value,
                    birthdateSymbol: selects[3].value,
                    birthdateValue: textFields[3].value,
                    usernameSymbol: selects[4].value,
                    usernameValue: textFields[4].value,
                    emailSymbol: selects[5].value,
                    emailValue: textFields[5].value,
                    sexValue: selects[6].value,
                    address1Symbol: selects[7].value,
                    address1Value: textFields[6].value,
                    address2Symbol: selects[8].value,
                    address2Value: textFields[7].value,
                    verified: selects[9].value,
                    active: selects[10].value,
                    sortCol: sortCol,
                    ascending: ascending
                })
            })
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(function(res) {
                setScrollCounter(tmp);
            });
        }
    }

    return (
        <div className="users-table-wrapper">
            <h1 className="text-center mb-5">Клиенти</h1>
            <div className="container-fluid text-center response" id="response-msg"></div>
            <table id="users-table" className="users-table">
                <tbody>
                    <tr className="filter-row">
                        <td>
                            <select id="select-1">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={idFilter} type="text" id="text-filter-1" onChange={e => {setIdFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select id="select-2">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={firstnameFilter} type="text" id="text-filter-2" onChange={e => {setFirstnameFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select id="select-3">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={lastnameFilter} type="text" id="text-filter-3" onChange={e => {setLastnameFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select id="select-4">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={birthdateFilter} type="text" id="text-filter-4" onChange={e => {setBirthdateFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select id="select-5">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={usernameFilter} type="text" id="text-filter-5" onChange={e => {setUsernameFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select id="select-6">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={emailFilter} type="text" id="text-filter-6" onChange={e => {setEmailFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select value={sexFilter} id="select-7" onChange={e => {setSexFilter(e.target.value);filterTable(true)}} >
                                <option value="all">Всички</option>
                                <option value="male">Мъж</option>
                                <option value="female">Жена</option>
                                <option value="other">Друго</option>
                            </select>
                        </td>
                        <td></td>
                        <td>
                            <select id="select-8">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={addressFilter} type="text" id="text-filter-7" onChange={e => {setAddressFilter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select id="select-9">
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                            </select>
                            <input value={address2Filter} type="text" id="text-filter-8" onChange={e => {setAddress2Filter(e.target.value);filterTable(true)}} />
                        </td>
                        <td>
                            <select value={verifiedFilter} className="enlarge-dropdown" id="select-10" onChange={e => {setVerifiedFilter(e.target.value);filterTable(true)}} >
                                <option value="all">Всички</option>
                                <option value="yes">Да</option>
                                <option value="no">Не</option>
                            </select>
                        </td>
                        <td>
                            <select value={activeFilter} className="enlarge-dropdown" id="select-11" onChange={e => {setActiveFilter(e.target.value);filterTable(true)}} >
                                <option value="all">Всички</option>
                                <option value="active">Активни</option>
                                <option value="suspended">Блокирани</option>
                            </select>
                        </td>
                        <td style={{width:'100px !important'}}></td>
                    </tr>
                    <tr>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 0, true, true, event)}>Пореден Номер</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 1, true, true, event)}>Име</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 2, true, true, event)}>Фамилия</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 3, true, true, event)}>Дата на раждане</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 4, true, true, event)}>Потребителско Име</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 5, true, true, event)}>Електронна поща</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 6, true, true, event)}>Пол</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 7, true, true, event)}>Гражданство</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 8, true, true, event)}>Адрес 1</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 9, true, true, event)}>Адрес 2</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 10, true, true, event)}>Верифициран</td>
                        <td className="interactable table-header headerUnsorted" onClick={event => filterTable(true, 11, true, true, event)}>Акаунт Статус</td>
                        <td>Операции</td>
                    </tr>
                    {users.map(user => (
                        <User key={user.user_id} user={user}/>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
}