import React from "react";
import * as Yup from 'yup';
import { Field, Form, Formik, FormikProvider, useFormik } from 'formik';
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function Register({onAddUser}) {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [sex, setSex] = useState('male');
    const [role, setRole] = useState('user');
    const [avatar, setAvatar] = useState('');
    const [summary, setSummary] = useState('');
    const [active, setActive] = useState('active');
    const [registrationDateTime, setRegistrationDateTime] = useState('');
    const [lastModificationDateTime, setLastModificationDateTime] = useState('');

    const RegisterSchema = Yup.object().shape({
        firstName: Yup.string()
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
         .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, 'Password must contain atleast 1 uppercase and 1 lowercase Latin letter, atleast 1 number and atleast 1 special symbol!')
         .required('Password is required!'),
        avatar: Yup.string().url('Should be a valid url!'),
        summary: Yup.string()
         .max(512, 'The summary must be maximum 512 characters long!')
         .required('Summary is required!')
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        setRegistrationDateTime(new Date());
        setLastModificationDateTime(new Date());
        setActive('active');

        onAddUser({firstName, username, password, sex, role, avatar, summary, active, registrationDateTime, lastModificationDateTime })
        setFirstName('');
        setUsername('');
        setPassword('');
        setSex('male');
        setRole('user');
        setSummary('');
        setActive('active');
        setRegistrationDateTime('');
        setLastModificationDateTime('');
    }

    return (
        <Formik
            initialValues={{
                firstName: '',
                username: '',
                password: '',
                sex: '',
                role: 'user',
                avatar: 'default-avatar',
                summary: '',
                active: 'active',
                registrationDateTime: new Date(),
                lastModificationDateTime: new Date()
            }}
            validationSchema={RegisterSchema}
            onSubmit={user => {
                onAddUser(user);
                navigate('/home')
            }}
        >
            <Form autoComplete="off" onSubmit={handleSubmit}>
                <h1>Registration Form</h1>
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                <label htmlFor="username">Username</label>
                <input id="username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label htmlFor="sex">Sex</label>
                <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                <label htmlFor="role">Role</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <label htmlFor="avatar">Avatar</label>
                <input id="avatar" type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
                <label htmlFor="summary">Summary</label>
                <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
                <button type="submit" name="action">Submit</button>
                
                <Link to='/login'>Already have an account?</Link>
            </Form>
        </Formik>
    );

};
