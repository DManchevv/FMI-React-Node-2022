import React from "react";
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TextField } from "../components/TextField";
import '../css/register.css'
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'

export default function NotVerified({sendVerificationEmail}) {
    const [searchParams, setSearchParams] = useSearchParams();
    console.log("<%=uid%>");
    return(
        <p>
            Акаунтът Ви все още не е верифициран. Моля проверете електронната поща, с която сте се регистрирали,<br/>
            за да верифицирате акаунта си. Ако не сте получили такъв мейл, може да получите нов като натиснете <button onClick={() => sendVerificationEmail(searchParams.get("uid"))}>Тук</button>
        </p>
    );
}