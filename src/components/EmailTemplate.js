import React, { useEffect, useState } from "react";
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'
import '../css/emailTemplate.css'

export default function EmailTemplate() {
    function saveConfigurations(isTrue) {

    }

    const [senderName, setSenderName] = useState('');
    const [senderEmail, setSenderEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [header, setHeader] = useState('');
    const [footer, setFooter] = useState('');
    const [borderWidth, setBorderWidth] = useState('');
    const [borderColor, setBorderColor] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('');
    const [fontColor, setFontColor] = useState('');
    const [firstCol, setFirstCol] = useState('');
    const [secondCol, setSecondCol] = useState('');
    const [thirdCol, setThirdCol] = useState('');
    const [fourthCol, setFourthCol] = useState('');

    useEffect(() => {
        getConfigurations();
    }, []);

    async function getConfigurations() {
        await fetch('/config-email',{
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            setSubject(data.subject);
            setHeader(data.header);
            setFooter(data.footer);
            setSenderEmail(data.senderMail);
            setSenderName(data.senderName);
            setBorderWidth(data.borderWidth);
            setBorderColor(data.borderColor);
            setFontColor(data.fontColor);
            setBackgroundColor(data.backgroundColor);
            setFirstCol(data.firstCol);
            setSecondCol(data.secondCol);
            setThirdCol(data.thirdCol);
            setFourthCol(data.fourthCol);
        })
    }

    return(
        <div className="email-main-content container-fluid text-light">
            <div className="sub-sections-wrapper d-flex flex-row justify-content-between mx-5">
                <div className="template">
                    <p className="text-center h2 mb-5">
                        Шаблон за създадена поръчка
                    </p>
                    <form id="form" encType="application/json" method="post" action="/config-email/create-order/save-global-configurations" className="d-flex flex-column mx-auto align-items-center p-3 template-form" style={{gap: '1rem'}}>
                        <label htmlFor="senderMail">Имейл на подател</label>
                        <input value={senderEmail} onChange={e => setSenderEmail(e.target.value)} name="senderMail" id="senderMail" type="text" className="form-control" readOnly/>
                        <label htmlFor="senderName">Име на подател</label>
                        <input value={senderName} onChange={e => setSenderName(e.target.value)} name="senderName" id="senderName" type="text" className="form-control"/>
                        <label htmlFor="subject">Тема на имейла</label>
                        <input value={subject} onChange={e => setSubject(e.target.value)} name="subject" id="subject" type="text" className="form-control"/>
                        <label htmlFor="header">Съдържание (над продуктите)</label>
                        <textarea name="header" id="header" className="form-control rounded-0" rows="4" value={header} onChange={e => setHeader(e.target.value)}></textarea>
                        <label htmlFor="table">Поръчани продукти (в табличен вид)</label>
                        <table id="table" className="table table-bordered table-hover table-dark mb-0">
                            <tbody>
                                <tr>
                                    <td>
                                        <select name="firstCol" id="select-1" value={firstCol} onChange={e => setFirstCol(e.target.value)}>
                                            <option value="">-</option>
                                            <option value="name">Име</option>
                                            <option value="quantity">Количество</option>
                                            <option value="singlePrice">Единична цена</option>
                                            <option value="totalPrice">Общо за продукта</option>
                                        </select>    
                                    </td>
                                    <td>
                                        <select name="secondCol" id="select-2" value={secondCol} onChange={e => setSecondCol(e.target.value)}>
                                            <option value="">-</option>
                                            <option value="name">Име</option>
                                            <option value="quantity">Количество</option>
                                            <option value="singlePrice">Единична цена</option>
                                            <option value="totalPrice">Общо за продукта</option>
                                        </select>    
                                    </td>
                                    <td>
                                        <select name="thirdCol" id="select-3" value={thirdCol} onChange={e => setThirdCol(e.target.value)}>
                                            <option value="">-</option>
                                            <option value="name">Име</option>
                                            <option value="quantity">Количество</option>
                                            <option value="singlePrice">Единична цена</option>
                                            <option value="totalPrice">Общо за продукта</option>
                                        </select>    
                                    </td>
                                    <td>
                                        <select name="fourthCol" id="select-4" value={fourthCol} onChange={e => setFourthCol(e.target.value)}>
                                            <option value="">-</option>
                                            <option value="name">Име</option>
                                            <option value="quantity">Количество</option>
                                            <option value="singlePrice">Единична цена</option>
                                            <option value="totalPrice">Общо за продукта</option>
                                        </select>    
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-end" colSpan="3">
                                        Цена на поръчката без ДДС:
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td className="text-end" colSpan="3">
                                        ДДС:
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td className="text-end" colSpan="3">
                                        Цена на поръчката с ДДС:
                                    </td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                        <label htmlFor="footer">Съдържание (под продуктите)</label>
                        <textarea name="footer" className="form-control rounded-1" rows="4" id="footer" value={footer} onChange={e => setFooter(e.target.value)}></textarea>
                        <button type="submit" className="submit-btn">Запази</button>
                    </form>
                </div>
                <div className="legend d-flex flex-column align-items-center">
                    <p className="text-center h2 mb-5">
                        Легенда
                    </p>
                    <div className="legend-body w-75 p-3 d-flex flex-column" style={{gap: '1rem'}}>
                        <p className="text-center">По-долу са означени всички налични кодови изрази, които могат да се използват в текстовите полета.</p>
                        <table className="mx-auto table table-bordered table-hover table-dark mb-5">
                            <tbody>
                                <tr>
                                    <td>$user</td>
                                    <td>Име на клиента, създал поръчката.</td>
                                </tr>
                                <tr>
                                    <td>$orderID</td>
                                    <td>Номер на създадената поръчка.</td>
                                </tr>
                                <tr>
                                    <td>$time</td>
                                    <td>Време на създаване на поръчката.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center h2 mt-5 mb-5">
                        Конфигурации
                    </p>
                    <div className="legend-body w-75 p-3 d-flex flex-column" style={{gap: '1rem'}}>
                        <table className="mx-auto table table-bordered table-hover table-dark mt-5 mb-5">
                            <tbody>
                                <tr>
                                    <td>Цвят на очертанията на таблицата</td>
                                    <td><input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} id="mail-border-color"/></td>
                                </tr>
                                <tr>
                                    <td>Цвят на фона</td>
                                    <td><input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} id="mail-background-color"/></td>
                                </tr>
                                <tr>
                                    <td>Цвят на шрифта</td>
                                    <td><input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} id="mail-font-color"/></td>
                                </tr><tr>
                                    <td>Големина на очертанията на таблицата</td>
                                    <td>
                                        <select id="mail-border-width" value={borderWidth} onChange={e => setBorderWidth(e.target.value)}>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                            <option value="6">6</option>
                                            <option value="7">7</option>
                                            <option value="8">8</option>
                                            <option value="9">9</option>
                                            <option value="10">10</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button onClick={() => saveConfigurations(true)} id="configuration-button-submit" className="submit-btn mb-2">Запази</button>
                    </div>
                </div>
            </div>
            
        </div>
    );
}