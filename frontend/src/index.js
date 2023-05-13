import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Maps } from './Maps';
import { Artists } from './Artists';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Messages from './Messages';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/maps',
        element: <Maps />,
    },
    {
        path: '/artists',
        element: <Artists />,
    },
    {
        path: '/messages',
        element: <Messages />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
