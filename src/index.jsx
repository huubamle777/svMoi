import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/css/bootstrap.min.css';
import '@/assets/css/style.css';
import { RouterProvider } from 'react-router';
import router from '@/router/router';
import { Analytics } from '@vercel/analytics/react';
import IntroLoading from '@/components/intro-loading';

const App = () => {
    const [introDone, setIntroDone] = useState(false);

    return (
        <>
            {!introDone && <IntroLoading onDone={() => setIntroDone(true)} />}
            <RouterProvider router={router} />
            <Analytics />
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

