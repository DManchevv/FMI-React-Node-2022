import React from "react";
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { useNavigate } from "react-router-dom";
import { TextField } from "./components/TextField";

export default function RecipeForm({onAddRecipe}) {
    const navigate = useNavigate();

    const RegisterSchema = Yup.object().shape({
        name: Yup.string()
         .min(2, 'Recipe name should be atleast 2 characters long!')
         .max(80, 'Recipe name should be maximum 80 characters long!')
         .required('Name is required!'),
        summary: Yup.string()
         .max(256, 'Summary should be maximum 256 characters long!')
         .required('Summary is required!'),
        cookingTime: Yup.number()
         .required('Cooking time is required!'),
        products: Yup.string()
         .required('Products field is required!'),
        image: Yup.string()
         .url('Image should be a valid URL!')
         .required('Image is required!'),
        description: Yup.string()
         .max(2048, 'Description should be maximum 2048 characters long!')
         .required('Description is required!'),
        tags: Yup.string()
    });

    return (
        <Formik
            initialValues={{
                name: '',
                summary: '',
                cookingTime: '',
                products: '',
                image: '',
                description: '',
                tags: '',
                creationDateTime: new Date().toISOString(),
                lastModificationDateTime: new Date().toISOString()
            }}
            validationSchema={RegisterSchema}
            onSubmit={values => {
                values.creationDateTime = new Date().toISOString();
                values.lastModificationDateTime = new Date().toISOString();

                onAddRecipe(values);
                navigate('/', { replace: true });
            }}
        >
            {formik => (
                <Form>
                    <h1>Create Recipe Form</h1>
                    <TextField label="Recipe name" id="name" name="name" type="text"/>
                    <TextField label="Summary" id="summary" name="summary" type="text"/>
                    <TextField label="Cooking Time" id="cookingTime" name="cookingTime" type="text"/>
                    <TextField label="Products" id="products" type="text" name="products"/>
                    <TextField label="Image" id="image" name="image"/>
                    <TextField label="Long Description" id="description" name="description"/>
                    <TextField label="Tags" id="tags" name="tags"/>
                    <button type="submit" name="action">Submit</button>
                </Form>
            )}
        </Formik>
    );

};
