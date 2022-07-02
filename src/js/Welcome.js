import React, { useEffect } from 'react';
import '../css/styles.css'
import '../css/bootstrap5.css'
export const Welcome = () => {
    useEffect(() => {
        document.body.classList.remove('gradient-custom-4');
        document.body.classList.remove('gradient-custom-3');
        document.body.classList.add('dark');
    }, []);

    return (
        <div className={"container-fluid section1 d-flex justify-content-around"}>
		    <img src="/megaSale.png" alt="home"/>
	    </div>
    )
}