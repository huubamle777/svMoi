import { useEffect, useState } from 'react';
import LoadingGif from '@/assets/images/loading-logo.gif';

const INTRO_DURATION = 3000;

const IntroLoading = ({ onDone }) => {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFadeOut(true), INTRO_DURATION - 500);
        const doneTimer = setTimeout(() => {
            setVisible(false);
            onDone?.();
        }, INTRO_DURATION);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(doneTimer);
        };
    }, [onDone]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: '#fff',
                colorScheme: 'light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.5s ease',
                opacity: fadeOut ? 0 : 1,
                pointerEvents: fadeOut ? 'none' : 'all',
            }}
        >
            <img
                src={LoadingGif}
                alt="Loading"
                style={{ maxWidth: '480px', width: '80%' }}
            />
        </div>
    );
};

export default IntroLoading;
