import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import MetaVerifiedPanel from '@/components/meta-verified-modal';
import CreatorMonetizePanel from '@/components/creator-monetize-panel';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object} props.metaCopy
 * @param {object} props.monetizeCopy
 */
const HomeStartModals = ( { isOpen, onClose, metaCopy, monetizeCopy } ) =>
{
    useEffect( () =>
    {
        if ( !isOpen ) return undefined;
        const onKey = ( e ) =>
        {
            if ( e.key === 'Escape' ) onClose();
        };
        document.addEventListener( 'keydown', onKey );
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () =>
        {
            document.removeEventListener( 'keydown', onKey );
            document.body.style.overflow = prevOverflow;
        };
    }, [ isOpen, onClose ] );

    if ( !isOpen ) return null;

    return createPortal(
        (
            <div
                role="presentation"
                style={ {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '56px 16px 24px',
                    background: 'rgba(8, 14, 20, 0.55)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxSizing: 'border-box',
                } }
                onMouseDown={ ( e ) =>
                {
                    if ( e.target === e.currentTarget ) onClose();
                } }
            >
                <button
                    type="button"
                    aria-label={ metaCopy.ariaClose }
                    onClick={ onClose }
                    style={ {
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: 10001,
                        width: '44px',
                        height: '44px',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#1C2B33',
                        fontSize: '24px',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    } }
                >
                    ×
                </button>

                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="meta-verified-modal-title creator-monetize-modal-title"
                    style={ {
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        gap: '18px',
                        width: '100%',
                        maxWidth: '1220px',
                        maxHeight: 'calc(100vh - 72px)',
                        overflow: 'auto',
                        boxSizing: 'border-box',
                    } }
                    onMouseDown={ ( e ) => e.stopPropagation() }
                >
                    <div
                        style={ {
                            flex: '1 1 340px',
                            maxWidth: '600px',
                            display: 'flex',
                            minWidth: 'min(100%, 280px)',
                        } }
                    >
                        <MetaVerifiedPanel copy={ metaCopy } />
                    </div>
                    <div
                        style={ {
                            flex: '1 1 340px',
                            maxWidth: '600px',
                            display: 'flex',
                            minWidth: 'min(100%, 280px)',
                        } }
                    >
                        <CreatorMonetizePanel copy={ monetizeCopy } onBack={ onClose } />
                    </div>
                </div>
            </div>
        ),
        document.body
    );
};

export default HomeStartModals;
