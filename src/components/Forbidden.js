import React from "react";
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TextField } from "../components/TextField";
import '../css/register.css'
import '../css/bootstrap5.css'
import 'https://use.fontawesome.com/releases/v5.15.4/js/all.js'

export default function Forbidden() {
    
    return(
        <div>
            <h1>
                Forbidden 403
            </h1>
            <p>
                Access denied!
            </p>
        </div>
    );
}