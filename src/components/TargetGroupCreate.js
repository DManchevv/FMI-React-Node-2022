import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/newTargetGroup.css'

export default function TargetGroupCreate() {
    const [targetGroupName, setTargetGroupName] = useState('');
    const [users, setUsers] = useState([]);
    const [sex, setSex] = useState('all')
    const [citizenship, setCitizenship] = useState('all');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [birthday, setBirthday] = useState('');
    const [userid, setUserid] = useState('');

    async function addToTargetGroup() {
        if (sex === "") {
            alert("Моля изберете пол!");
        }
        else if (citizenship === "") {
            alert("Моля изберете гражданство!");
        }
        else {
            await fetch("/target-groups/add-to-target-group", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userid: userid,
                    firstname: firstname,
                    lastname: lastname.value,
                    gender: sex,
                    citizenship: citizenship,
                    birthday: birthday.value
                })
            })
            .then(async response => {
                if (response.status === 200) {
                    await response.json()
                    .then(data => {
                        setUsers(data);
                    });
                }
                else {
                    alert("Възникна грешка при добавяне на потребители в целевата група!");
                }
            })
        }
    }

    function deleteUserFromGroup(userid) {
        setUsers(oldUsers => oldUsers.filter(r => r.user_id !== userid));
    }

    async function handleSubmit(e) {
        e.preventDefault();
    
        let targetGroupNameRegex = /^[^\s][a-z0-9A-Z ]{1,98}[^\s]$/;
    
        if (targetGroupName === "") {
            alert("Моля попълнете име на целевата група!");
            return;
        }
        else if (!targetGroupNameRegex.test(targetGroupName.value)) {
            alert("Името на целевата група може да съдържа само букви и цифри с дължина между 3 и 100 символа!");
            return;
        }
    
        if (users.length === 0) {
            alert("Моля добавете поне 1 потребител в целевата група!");
            return;
        }

        await fetch('/target-groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: users,
                name: targetGroupName
            })
        })
        .then(response => {
            if (response.status === 201) {
                alert("Целевата група беше успешно създадена!");
                window.location.href = "/target-groups";
            }
            else if (response.status === 400) {
                alert("Неправилно име на целева група! Моля опитайте отново!");
                window.location.reload();
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
            <p className="h1">Нова Целева Група</p>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <input value={userid} onChange={e => setUserid(e.target.value)} className="container-fluid" id="userid" type="text" placeholder="User ID"/>
                        </td>
                        <td>
                            <input value={firstname} onChange={e => setFirstname(e.target.value)} className="container-fluid" id="firstname" type="text" placeholder="First Name"/>
                        </td>
                        <td>
                            <input value={lastname} onChange={e => setLastname(e.target.value)} className="container-fluid" id="lastname" type="text" placeholder="Last Name"/>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <select value={sex} onChange={e => setSex(e.target.value)} className="container-fluid" id="select-gender">
                                <option value="all" disabled>Пол</option>
                                <option value="all">Всички</option>
                                <option value="male">Мъж</option>
                                <option value="female">Жена</option>
                                <option value="other">Друго</option>
                            </select>
                        </td>
                        <td>
                            <select value={citizenship} onChange={e => setCitizenship(e.target.value)} className="container-fluid" id="select-citizenship">
                            <option value="all" disabled>Гражданство</option>
                            <option value="all">Всички</option>
                            <option value="AF">Afghanistan</option>
                            <option value="AX">Åland Islands</option>
                            <option value="AL">Albania</option>
                            <option value="DZ">Algeria</option>
                            <option value="AS">American Samoa</option>
                            <option value="AD">Andorra</option>
                            <option value="AO">Angola</option>
                            <option value="AI">Anguilla</option>
                            <option value="AQ">Antarctica</option>
                            <option value="AG">Antigua and Barbuda</option>
                            <option value="AR">Argentina</option>
                            <option value="AM">Armenia</option>
                            <option value="AW">Aruba</option>
                            <option value="AU">Australia</option>
                            <option value="AT">Austria</option>
                            <option value="AZ">Azerbaijan</option>
                            <option value="BS">Bahamas (the)</option>
                            <option value="BH">Bahrain</option>
                            <option value="BD">Bangladesh</option>
                            <option value="BB">Barbados</option>
                            <option value="BY">Belarus</option>
                            <option value="BE">Belgium</option>
                            <option value="BZ">Belize</option>
                            <option value="BJ">Benin</option>
                            <option value="BM">Bermuda</option>
                            <option value="BT">Bhutan</option>
                            <option value="BO">Bolivia (Plurinational State of)</option>
                            <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
                            <option value="BA">Bosnia and Herzegovina</option>
                            <option value="BW">Botswana</option>
                            <option value="BV">Bouvet Island</option>
                            <option value="BR">Brazil</option>
                            <option value="IO">British Indian Ocean Territory (the)</option>
                            <option value="BN">Brunei Darussalam</option>
                            <option value="BG">Bulgaria</option>
                            <option value="BF">Burkina Faso</option>
                            <option value="BI">Burundi</option>
                            <option value="CV">Cabo Verde</option>
                            <option value="KH">Cambodia</option>
                            <option value="CM">Cameroon</option>
                            <option value="CA">Canada</option>
                            <option value="KY">Cayman Islands (the)</option>
                            <option value="CF">Central African Republic (the)</option>
                            <option value="TD">Chad</option>
                            <option value="CL">Chile</option>
                            <option value="CN">China</option>
                            <option value="CX">Christmas Island</option>
                            <option value="CC">Cocos (Keeling) Islands (the)</option>
                            <option value="CO">Colombia</option>
                            <option value="KM">Comoros (the)</option>
                            <option value="CD">Congo (the Democratic Republic of the)</option>
                            <option value="CG">Congo (the)</option>
                            <option value="CK">Cook Islands (the)</option>
                            <option value="CR">Costa Rica</option>
                            <option value="HR">Croatia</option>
                            <option value="CU">Cuba</option>
                            <option value="CW">Curaçao</option>
                            <option value="CY">Cyprus</option>
                            <option value="CZ">Czechia</option>
                            <option value="CI">Côte d'Ivoire</option>
                            <option value="DK">Denmark</option>
                            <option value="DJ">Djibouti</option>
                            <option value="DM">Dominica</option>
                            <option value="DO">Dominican Republic (the)</option>
                            <option value="EC">Ecuador</option>
                            <option value="EG">Egypt</option>
                            <option value="SV">El Salvador</option>
                            <option value="GQ">Equatorial Guinea</option>
                            <option value="ER">Eritrea</option>
                            <option value="EE">Estonia</option>
                            <option value="SZ">Eswatini</option>
                            <option value="ET">Ethiopia</option>
                            <option value="FK">Falkland Islands (the) [Malvinas]</option>
                            <option value="FO">Faroe Islands (the)</option>
                            <option value="FJ">Fiji</option>
                            <option value="FI">Finland</option>
                            <option value="FR">France</option>
                            <option value="GF">French Guiana</option>
                            <option value="PF">French Polynesia</option>
                            <option value="TF">French Southern Territories (the)</option>
                            <option value="GA">Gabon</option>
                            <option value="GM">Gambia (the)</option>
                            <option value="GE">Georgia</option>
                            <option value="DE">Germany</option>
                            <option value="GH">Ghana</option>
                            <option value="GI">Gibraltar</option>
                            <option value="GR">Greece</option>
                            <option value="GL">Greenland</option>
                            <option value="GD">Grenada</option>
                            <option value="GP">Guadeloupe</option>
                            <option value="GU">Guam</option>
                            <option value="GT">Guatemala</option>
                            <option value="GG">Guernsey</option>
                            <option value="GN">Guinea</option>
                            <option value="GW">Guinea-Bissau</option>
                            <option value="GY">Guyana</option>
                            <option value="HT">Haiti</option>
                            <option value="HM">Heard Island and McDonald Islands</option>
                            <option value="VA">Holy See (the)</option>
                            <option value="HN">Honduras</option>
                            <option value="HK">Hong Kong</option>
                            <option value="HU">Hungary</option>
                            <option value="IS">Iceland</option>
                            <option value="IN">India</option>
                            <option value="ID">Indonesia</option>
                            <option value="IR">Iran (Islamic Republic of)</option>
                            <option value="IQ">Iraq</option>
                            <option value="IE">Ireland</option>
                            <option value="IM">Isle of Man</option>
                            <option value="IL">Israel</option>
                            <option value="IT">Italy</option>
                            <option value="JM">Jamaica</option>
                            <option value="JP">Japan</option>
                            <option value="JE">Jersey</option>
                            <option value="JO">Jordan</option>
                            <option value="KZ">Kazakhstan</option>
                            <option value="KE">Kenya</option>
                            <option value="KI">Kiribati</option>
                            <option value="KP">Korea (the Democratic People's Republic of)</option>
                            <option value="KR">Korea (the Republic of)</option>
                            <option value="KW">Kuwait</option>
                            <option value="KG">Kyrgyzstan</option>
                            <option value="LA">Lao People's Democratic Republic (the)</option>
                            <option value="LV">Latvia</option>
                            <option value="LB">Lebanon</option>
                            <option value="LS">Lesotho</option>
                            <option value="LR">Liberia</option>
                            <option value="LY">Libya</option>
                            <option value="LI">Liechtenstein</option>
                            <option value="LT">Lithuania</option>
                            <option value="LU">Luxembourg</option>
                            <option value="MO">Macao</option>
                            <option value="MG">Madagascar</option>
                            <option value="MW">Malawi</option>
                            <option value="MY">Malaysia</option>
                            <option value="MV">Maldives</option>
                            <option value="ML">Mali</option>
                            <option value="MT">Malta</option>
                            <option value="MH">Marshall Islands (the)</option>
                            <option value="MQ">Martinique</option>
                            <option value="MR">Mauritania</option>
                            <option value="MU">Mauritius</option>
                            <option value="YT">Mayotte</option>
                            <option value="MX">Mexico</option>
                            <option value="FM">Micronesia (Federated States of)</option>
                            <option value="MD">Moldova (the Republic of)</option>
                            <option value="MC">Monaco</option>
                            <option value="MN">Mongolia</option>
                            <option value="ME">Montenegro</option>
                            <option value="MS">Montserrat</option>
                            <option value="MA">Morocco</option>
                            <option value="MZ">Mozambique</option>
                            <option value="MM">Myanmar</option>
                            <option value="NA">Namibia</option>
                            <option value="NR">Nauru</option>
                            <option value="NP">Nepal</option>
                            <option value="NL">Netherlands (the)</option>
                            <option value="NC">New Caledonia</option>
                            <option value="NZ">New Zealand</option>
                            <option value="NI">Nicaragua</option>
                            <option value="NE">Niger (the)</option>
                            <option value="NG">Nigeria</option>
                            <option value="NU">Niue</option>
                            <option value="NF">Norfolk Island</option>
                            <option value="MP">Northern Mariana Islands (the)</option>
                            <option value="NO">Norway</option>
                            <option value="OM">Oman</option>
                            <option value="PK">Pakistan</option>
                            <option value="PW">Palau</option>
                            <option value="PS">Palestine, State of</option>
                            <option value="PA">Panama</option>
                            <option value="PG">Papua New Guinea</option>
                            <option value="PY">Paraguay</option>
                            <option value="PE">Peru</option>
                            <option value="PH">Philippines (the)</option>
                            <option value="PN">Pitcairn</option>
                            <option value="PL">Poland</option>
                            <option value="PT">Portugal</option>
                            <option value="PR">Puerto Rico</option>
                            <option value="QA">Qatar</option>
                            <option value="MK">Republic of North Macedonia</option>
                            <option value="RO">Romania</option>
                            <option value="RU">Russian Federation (the)</option>
                            <option value="RW">Rwanda</option>
                            <option value="RE">Réunion</option>
                            <option value="BL">Saint Barthélemy</option>
                            <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
                            <option value="KN">Saint Kitts and Nevis</option>
                            <option value="LC">Saint Lucia</option>
                            <option value="MF">Saint Martin (French part)</option>
                            <option value="PM">Saint Pierre and Miquelon</option>
                            <option value="VC">Saint Vincent and the Grenadines</option>
                            <option value="WS">Samoa</option>
                            <option value="SM">San Marino</option>
                            <option value="ST">Sao Tome and Principe</option>
                            <option value="SA">Saudi Arabia</option>
                            <option value="SN">Senegal</option>
                            <option value="RS">Serbia</option>
                            <option value="SC">Seychelles</option>
                            <option value="SL">Sierra Leone</option>
                            <option value="SG">Singapore</option>
                            <option value="SX">Sint Maarten (Dutch part)</option>
                            <option value="SK">Slovakia</option>
                            <option value="SI">Slovenia</option>
                            <option value="SB">Solomon Islands</option>
                            <option value="SO">Somalia</option>
                            <option value="ZA">South Africa</option>
                            <option value="GS">South Georgia and the South Sandwich Islands</option>
                            <option value="SS">South Sudan</option>
                            <option value="ES">Spain</option>
                            <option value="LK">Sri Lanka</option>
                            <option value="SD">Sudan (the)</option>
                            <option value="SR">Suriname</option>
                            <option value="SJ">Svalbard and Jan Mayen</option>
                            <option value="SE">Sweden</option>
                            <option value="CH">Switzerland</option>
                            <option value="SY">Syrian Arab Republic</option>
                            <option value="TW">Taiwan (Province of China)</option>
                            <option value="TJ">Tajikistan</option>
                            <option value="TZ">Tanzania, United Republic of</option>
                            <option value="TH">Thailand</option>
                            <option value="TL">Timor-Leste</option>
                            <option value="TG">Togo</option>
                            <option value="TK">Tokelau</option>
                            <option value="TO">Tonga</option>
                            <option value="TT">Trinidad and Tobago</option>
                            <option value="TN">Tunisia</option>
                            <option value="TR">Turkey</option>
                            <option value="TM">Turkmenistan</option>
                            <option value="TC">Turks and Caicos Islands (the)</option>
                            <option value="TV">Tuvalu</option>
                            <option value="UG">Uganda</option>
                            <option value="UA">Ukraine</option>
                            <option value="AE">United Arab Emirates (the)</option>
                            <option value="GB">United Kingdom of Great Britain and Northern Ireland (the)</option>
                            <option value="UM">United States Minor Outlying Islands (the)</option>
                            <option value="US">United States of America (the)</option>
                            <option value="UY">Uruguay</option>
                            <option value="UZ">Uzbekistan</option>
                            <option value="VU">Vanuatu</option>
                            <option value="VE">Venezuela (Bolivarian Republic of)</option>
                            <option value="VN">Viet Nam</option>
                            <option value="VG">Virgin Islands (British)</option>
                            <option value="VI">Virgin Islands (U.S.)</option>
                            <option value="WF">Wallis and Futuna</option>
                            <option value="EH">Western Sahara</option>
                            <option value="YE">Yemen</option>
                            <option value="ZM">Zambia</option>
                            <option value="ZW">Zimbabwe</option>
                            </select>
                        </td>
                        <td>
                            <input value={birthday} onChange={e => setBirthday(e.target.value)} className="container-fluid" id="birthday" type="text" placeholder="Birthday: dd/mm"/>
                        </td>
                    </tr>
                </tbody>
            </table>
            <button className="filter-btn text-center mt-5" onClick={() => addToTargetGroup()}>Филтрирай</button>
            <p className="h1 mt-5">Текуща целева група:</p>
            <table className="table table-dark table-bordered table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Име</th>
                        <th>Фамилия</th>
                        <th>Пол</th>
                        <th>Гражданство</th>
                        <th>Рожденна Дата</th>
                        <th>Операции</th>
                    </tr>
                </thead>
                <tbody id="users-list">
                    {users.map(user => (
                        <tr key={user.user_id}>
                            <td className="user-id">{user.user_id}</td>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.sex}</td>
                            <td>{user.citizenship}</td>
                            <td>{user.birthdate.split('T')[0]} {user.birthdate.split('T')[1].split('.')[0]}</td>
                            <td className="zero-width">
                                <button className="btn filter-btn" style={{color: 'white'}} onClick={() => deleteUserFromGroup(user.user_id)}>Изтрий</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <form id="form" onSubmit={handleSubmit} className="d-flex flex-column" method="post" action="/target-groups">
                <label className="form-label h3 mt-5 text-light" htmlFor="target-group-name">Име на целева група</label>
                <input value={targetGroupName} onChange={e => setTargetGroupName(e.target.value)} name="name" id="target-group-name" className="mt-2" type="text"/>
                <input name="users" id="users" style={{display: 'none'}} type="text"/>
                <button type="submit" className="filter-btn mt-5 mb-5">Създай целева група</button>
            </form>
        </div>
    )
}