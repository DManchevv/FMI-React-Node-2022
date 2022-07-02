import React from "react";
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TextField } from "./TextField";

export default function EditUser({onEditUser}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(undefined);
    
    useEffect(() => {
        (async () => {
            const data = await fetch(`/api/users/${id}`);
            const response = await data.json();
            setUser(response);
        })();
    }, []);

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
         .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&])(?=.*[0-9])(?=.{8,})/, 'Password must contain atleast 1 uppercase and 1 lowercase Latin letter, atleast 1 number and atleast 1 special symbol!')
         .required('Password is required!'),
        avatar: Yup.string().url('Image should be a valid url!'),
        summary: Yup.string()
         .max(512, 'The summary must be maximum 512 characters long!')
         .required('Summary is required!')
    });

    return (
        <div>
        {(user === undefined) ?
            (<div>Loading...</div>) : (
                <Formik
                initialValues={{
                    firstName: user.firstName,
                    username: user.username,
                    password: "123456Mm!",
                    sex: user.sex,
                    role: user.role,
                    avatar: user.avatar,
                    summary: user.summary,
                    active: user.active,
                    registrationDateTime: user.registrationDateTime,
                    lastModificationDateTime: user.lastModificationDateTime
                }}
                validationSchema={RegisterSchema}
                onSubmit={values => {
                    values.lastModificationDateTime = new Date();
                    values.sex = user.sex;
                    values.role = user.role;
    
                    onEditUser(values, id);
                    navigate('/', { replace: true });
                }}
            >
    
                {formik => (
                    <Form>
                        <h1>Edit User Form</h1>
                        <TextField label="First Name" id="firstName" name="firstName" type="text" />
                        <TextField label="Username" id="username" name="username" type="text" />
                        <TextField id="password" name="password" type="password"/>
                        <label htmlFor="sex">Sex</label>
                        <select value={user.sex} id="sex" name="sex" onChange={(e) => user.sex = e.target.value}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <label htmlFor="role">Role</label>
                        <select value={user.role} id="role" name="role" onChange={(e) => user.role = e.target.value}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <TextField label="Avatar" id="avatar" type="text" name="avatar" />
                        <TextField label="Summary" id="summary" name="summary" />
                        <button type="submit" name="action">Submit</button>
                    </Form>
                )}
            </Formik>
            )
        }
       </div>
    );

};
