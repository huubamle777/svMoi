import { createBrowserRouter } from 'react-router';
import Index from '@/pages/index';
import NotFound from '@/pages/not-found';

export const PATHS = {
    INDEX: '/'
};

const router = createBrowserRouter([
    {
        path: PATHS.INDEX,
        element: <Index />
    },
    {
        path: '*',
        element: <NotFound />
    }
]);

export default router;
