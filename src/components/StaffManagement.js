import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/staffManagement.css'
import { Link } from "react-router-dom";
import StaffUser from "./StaffUser";

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [idFilter, setIdFilter] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');

    useEffect(() => {
        getStaff();
    }, []);

    function getStaff() {
        fetch('/staff-management/get-all', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setStaff(data);
        })
    }

    function sortTable(n, isNumber, tableID, firstRow) {
        let table = document.getElementById(tableID);
        let switching = true;
        let shouldSwitch;
        let i;
        let dir = "asc";
        let switchCount = 0;
    
        while (switching) {
            switching = false;
            let rows = table.rows;
    
            for (i = firstRow; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                let x = rows[i].getElementsByTagName('td')[n];
                let y = rows[i + 1].getElementsByTagName('td')[n];
    
                if (isNumber) {
                    if (dir === "asc") {
                        if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                    else if (dir === "desc") {
                        if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
                else {
                    if (dir === "asc") {
                        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                    else if (dir === "desc") {
                        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                }
            }
    
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchCount++;
            } else {
                if (switchCount === 0 && dir === "asc") {
                    dir = "desc";
                    switching = true;
                }
            }
        }
    }

    function filterTable() {

    }

    async function deleteStaff(id) {
        await fetch(`/staff-management/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.status === 200) {
                alert("User successfully deleted");
                setStaff(oldStaff => oldStaff.filter(r => r.id !== id));
            }
        })
    }

    return(
        <div className="container">
            <h1 className="text-center">Персонал</h1>
            <div className="container-fluid text-center response" id="response-msg"></div>
            <div className="table-wrapper container">
                <Link to="/staff-management/create-user" className="create-staff-user-btn" id="create-staff-user-btn">+</Link>
                <table id="staff-table" className="staff-table">
                    <tbody>
                        <tr className="filter-row">
                            <td>
                                <select id="select-1">
                                    <option value="equal">=</option>
                                    <option value="less">&lt;</option>
                                    <option value="greater">&gt;</option>
                                </select>
                                <input type="text" onChange={e => {setIdFilter(e.target.value);filterTable(e.target.value, document.getElementById('select-1').value, 'user_id', 0)}} />
                            </td>
                            <td>
                                <select id="select-2">
                                    <option value="equal">=</option>
                                    <option value="less">&lt;</option>
                                    <option value="greater">&gt;</option>
                                </select>
                                <input type="text" onChange={e => {setUsernameFilter(e.target.value); filterTable(e.target.value, document.getElementById('select-2').value, 'username', 1)}} />
                            </td>
                            <td>
                                <select id="select-3">
                                    <option value="equal">=</option>
                                    <option value="less">&lt;</option>
                                    <option value="greater">&gt;</option>
                                </select>
                                <input type="text" onChange={e => {setEmailFilter(e.target.value); filterTable(e.target.value, document.getElementById('select-3').value, 'email', 2)}} />
                            </td>
                            <td>

                            </td>
                        </tr>
                        <tr>
                            <td className="interactable" onClick={event => sortTable(0, true, 'staff-table', 2)}>Пореден Номер</td>
                            <td className="interactable" onClick={event => sortTable(1, false, 'staff-table', 2)}>Потребителско Име</td>
                            <td className="interactable" onClick={event => sortTable(2, false, 'staff-table', 2)}>Електронна поща</td>
                            <td>Операции</td>
                        </tr>
                        {staff.map(user => (
                            <StaffUser key={user.id} user={user} onStaffDelete={deleteStaff}/>
                        ))}
                    </tbody>
                </table>
            </div> 
        </div>
    );
}