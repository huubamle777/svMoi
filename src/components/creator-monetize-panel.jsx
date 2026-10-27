import CreatorMonetizeHero from '@/assets/images/creator-monetize-hero.png';
import config from '@/utils/config';

const CORNER_STEP = 2;

const MonetizeIcon = () => (
    <span
        aria-hidden
        style={ {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#E8F0F7',
            fontSize: '16px',
            fontWeight: 700,
        } }
    >
        $
    </span>
);

/**
 * @param {object} props
 * @param {object} props.copy
 * @param {() => void} props.onBack
 */
const CreatorMonetizePanel = ( { copy, onBack } ) => (
    <div
        style={ {
            width: '100%',
            minHeight: 'min(560px, 82vh)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            background: '#18222d',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            boxSizing: 'border-box',
        } }
    >
        <div
            style={ {
                flex: '1 1 300px',
                padding: '36px 32px 32px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                minWidth: 0,
            } }
        >
            { copy.cornerLabel ? (
                <div
                    role="group"
                    aria-label={ `${ CORNER_STEP }. ${ copy.cornerLead ? `${ copy.cornerLead } ` : '' }${ copy.cornerLabel }` }
                    style={ {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                    } }
                >
                    <span
                        aria-hidden
                        style={ {
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                            color: '#E8F0F7',
                            fontSize: '15px',
                            fontWeight: 700,
                            lineHeight: 1,
                        } }
                    >
                        { CORNER_STEP }
                    </span>
                    <div
                        style={ {
                            color: 'rgba(232, 240, 247, 0.95)',
                            fontSize: '14px',
                            fontWeight: 600,
                            letterSpacing: '0.01em',
                            lineHeight: 1.4,
                        } }
                    >
                        { copy.cornerLead ? (
                            <span style={ { fontWeight: 700 } }>{ copy.cornerLead }</span>
                        ) : null }
                        { copy.cornerLead && copy.cornerLabel ? ' ' : null }
                        { copy.cornerLabel }
                    </div>
                </div>
            ) : null }
            <button
                type="button"
                onClick={ onBack }
                style={ {
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: 0,
                    padding: '4px 0',
                    border: 'none',
                    background: 'none',
                    color: 'rgba(232, 240, 247, 0.92)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                } }
            >
                <span style={ { fontSize: '18px', lineHeight: 1 } } aria-hidden>←</span>
                { copy.back }
            </button>

            <div style={ { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' } }>
                <MonetizeIcon />
                <span
                    style={ {
                        color: 'rgba(232, 240, 247, 0.95)',
                        fontSize: '14px',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                    } }
                >
                    { copy.eyebrow }
                </span>
            </div>

            <div
                id="creator-monetize-modal-title"
                style={ {
                    fontSize: 'clamp(1.35rem, 3.5vw, 1.9rem)',
                    fontWeight: 650,
                    color: '#fff',
                    lineHeight: 1.2,
                    margin: 0,
                } }
            >
                { copy.title }
            </div>

            <div
                style={ {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(232, 240, 247, 0.9)',
                    fontSize: '14px',
                    fontWeight: 500,
                } }
            >
                { copy.creatorLabel }
                <span aria-hidden style={ { fontSize: '10px', opacity: 0.85 } }>▼</span>
            </div>

            <p
                style={ {
                    margin: 'auto 0 0',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    color: 'rgba(232, 240, 247, 0.82)',
                } }
            >
                { copy.description }
            </p>
        </div>

        <div
            style={ {
                flex: '1 1 280px',
                position: 'relative',
                minHeight: '280px',
                minWidth: 0,
            } }
        >
            <img
                src={ CreatorMonetizeHero }
                alt={ copy.heroAlt }
                style={ {
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                } }
            />
            <div
                style={ {
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, rgba(24,34,45,0.5) 0%, rgba(24,34,45,0.05) 45%, transparent 70%)',
                    pointerEvents: 'none',
                } }
            />

            <div
                style={ {
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                } }
            >
                <span
                    style={ {
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.5)',
                        flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    } }
                >
                    <img
                        src={ CreatorMonetizeHero }
                        alt=""
                        style={ { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' } }
                    />
                </span>
                <span
                    style={ {
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: 600,
                        textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                    } }
                >
                    { copy.brandName }
                </span>
            </div>

            <div
                style={ {
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                } }
            >
                <a
                    href={ config.modal_creator_monetize_register_url }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={ {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 22px',
                        borderRadius: '10px',
                        background: '#1877F2',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '14px',
                        textDecoration: 'none',
                        boxShadow: '0 8px 28px rgba(24, 119, 242, 0.35)',
                        whiteSpace: 'nowrap',
                    } }
                >
                    { copy.subscribe }
                </a>
            </div>
        </div>
    </div>
);

export default CreatorMonetizePanel;
