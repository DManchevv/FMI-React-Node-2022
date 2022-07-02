import React, { useEffect } from "react";
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField } from "../components/TextField";
import '../css/register.css'
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'

export default function Register({onAddUser}) {
    const navigate = useNavigate();
    const [sex, setSex] = useState('male');
    const [country, setCountry] = useState('BG');

    const RegisterSchema = Yup.object().shape({
        name: Yup.string()
         .min(2, 'First Name should be atleast 2 characters long!')
         .max(50, 'First name should be maximum 50 characters long!')
         .required('First Name is required!'),
        username: Yup.string()
         .min(2, 'Username should be atleast 2 characters long!')
         .max(15, 'Username should be maximum 15 characters long!')
         .matches(/[a-zA-Z]/, 'Username can only contain Latin letters!')
         .required('Username is required!'),
        password: Yup.string()
         .min(8, 'Password should be atleast 8 characters long!')
         .max(20, 'Password should be maximum 20 characters long!')
         .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&])(?=.*[0-9])(?=.{8,})/, 'Password must contain atleast 1 uppercase and 1 lowercase Latin letter, atleast 1 number and atleast 1 special symbol!')
         .required('Password is required!')
    });

    useEffect(() => {
        document.body.classList.remove('dark');
        document.body.classList.add('gradient-custom-4');
    }, []);

    return (
        <section className="vh-100">
        <div className="mask d-flex align-items-center h-100">
          <div className="container h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
              <div className="col-12 col-md-12 col-lg-12 col-xl-7">
                <div className="card">
                  <div className="card-body p-4">
                    <h2 className="text-uppercase text-center mb-2">Създай Акаунт</h2>
                    <Formik
                        initialValues={{
                            name: '',
                            surname: '',
                            username: '',
                            email: '',
                            password: '',
                            address: '',
                            confirmPassword: '',
                            sex: 'male',
                            country: 'BG',
                            birthdate: ''
                        }}
                        validationSchema={RegisterSchema}
                        onSubmit={values => {
                            values.sex = sex;
                            values.country = country;

                            onAddUser(values);
                            navigate('/login', { replace: true });
                        }}
                    >
                        {formik => (
                            <Form className="custom-form">
                                <TextField label="Име *" id="name" name="name" type="text"/>
                                <TextField label="Фамилия *" id="surname" name="surname" type="text"/>
                                <TextField label="Потребителско име *" id="username" name="username" type="text"/>
                                <TextField label="Парола *" id="password" name="password" type="password"/>
                                <TextField label="Потвърдете паролата *" id="confirm-password" name="confirmPassword" type="password"/>
                                <TextField label="Електронна поща *" id="email" name="email" type="email"/>
                                <TextField label="Адрес" id="address" name="address" type="text"/>
                                <div className="form-row d-flex justify-content-between">
                                    <div className="form-group mb-4 col-2">
                                        <label className="form-label" htmlFor="sex">Пол*</label>
                                        <select className="form-select form-select-sm" value={sex} id="sex" name="sex" onChange={(e) => setSex(e.target.value)} required>
                                            <option value="male">Мъж</option>
                                            <option value="female">Жена</option>
                                            <option value="other">Друго</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-4 col-3">
                                        <TextField label="Дата на раждане *" id="birthdate" name="birthdate" type="date"/>
                                    </div>
                                    <div className="form-group mb-4 col-5">
                                        <label className="form-label" htmlFor="country">Гражданство *</label>
                                        <select value={country} onChange={(e) => setCountry(e.target.value)} className="form-select form-select-sm" id="country" name="country" required>
                                            <option value="" disabled>Избери държава</option>
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
                                    </div>
                                </div>
                                <div className="d-flex flex-row justify-content-around">
                                    <button type="submit" className="btn btn-success btn-block btn-lg gradient-custom-4 text-body" name="action">Регистрирай се</button>
                                </div>
                                <p className="text-center text-muted mt-4 mb-0">
                                    <Link to="/" className={"btn btn-success btn-block btn-lg gradient-custom-4 text-body home-page"}><i className="fas fa-home"></i></Link>
                                    <Link to='/login'>Вече имате акаунт?</Link>
                                </p>
                            </Form>
                        )}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );

};
