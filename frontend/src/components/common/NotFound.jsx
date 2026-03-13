import React from 'react'
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-light-gray">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-6xl font-extrabold text-dark-gray">404</h1>
        <p className="text-2xl text-gray mt-4">Page Not Found</p>
        <Link to="/home" className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
            Go to Home
        </Link>
        </div>
    </div>
);


export default NotFound