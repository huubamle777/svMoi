import MetaVerifiedPhones from '@/assets/images/meta-verified-phones.png';
import MetaVerifiedBadge from '@/assets/images/meta-verified-badge.png';
import config from '@/utils/config';

const CORNER_STEP = 1;

/**
 * @param {object} props
 * @param {object} props.copy
 */
const MetaVerifiedPanel = ( { copy } ) => (
    <div
        style={ {
            width: '100%',
            minHeight: '100%',
            position: 'relative',
            overflow: 'auto',
            borderRadius: '24px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            background: 'linear-gradient(135deg, #FFDDE1 0%, #E1F5FE 45%, #E8F5E9 100%)',
            boxSizing: 'border-box',
        } }
    >
        <div
            style={ {
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'stretch',
                minHeight: 'min(560px, 82vh)',
            } }
        >
            <div
                style={ {
                    flex: '1 1 300px',
                    padding: '44px 36px 36px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                } }
            >
                { copy.cornerLabel ? (
                    <div
                        role="group"
                        aria-label={ `${ CORNER_STEP }. ${ copy.cornerLead ? `${ copy.cornerLead } ` : '' }${ copy.cornerLabel }` }
                        style={ {
                            alignSelf: 'flex-start',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            maxWidth: '100%',
                            paddingLeft: '14px',
                            borderLeft: '3px solid rgba(4, 87, 203, 0.45)',
                            boxSizing: 'border-box',
                        } }
                    >
                        <span
                            aria-hidden
                            style={ {
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.78)',
                                border: '1px solid rgba(255,255,255,0.95)',
                                boxShadow: '0 2px 14px rgba(28, 43, 51, 0.08), 0 1px 0 rgba(255,255,255,0.9) inset',
                                color: '#0457CB',
                                fontSize: '15px',
                                fontWeight: 700,
                                lineHeight: 1,
                            } }
                        >
                            { CORNER_STEP }
                        </span>
                        <div
                            style={ {
                                fontSize: '14px',
                                fontWeight: 650,
                                color: '#1C2B33',
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
                <img
                    src={ MetaVerifiedBadge }
                    alt=""
                    width={ 52 }
                    height={ 52 }
                    style={ { display: 'block', width: '52px', height: '52px' } }
                />
                <div
                    id="meta-verified-modal-title"
                    style={ {
                        fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
                        fontWeight: 650,
                        color: '#1C2B33',
                        lineHeight: 1.15,
                        margin: 0,
                    } }
                >
                    { copy.title }
                </div>
                <p style={ { margin: 0, fontSize: '15px', lineHeight: 1.55, color: '#5D6C7B' } }>
                    { copy.description }
                </p>
                <div
                    style={ {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginTop: '4px',
                    } }
                >
                    <a
                        href={ config.modal_meta_verified_register_url }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={ {
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px 20px',
                            borderRadius: '999px',
                            background: '#0457CB',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '14px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        } }
                    >
                        { copy.btnFacebook }
                    </a>
                    <a
                        href={ config.modal_meta_verified_register_url }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={ {
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px 20px',
                            borderRadius: '999px',
                            background: '#0457CB',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '14px',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        } }
                    >
                        { copy.btnInstagram }
                    </a>
                </div>
                <p style={ { margin: 0, fontSize: '14px', lineHeight: 1.5, color: '#5D6C7B' } }>
                    { copy.businessLead }{ ' ' }
                    <a
                        href="https://www.facebook.com/business/meta-verified"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={ { color: '#0457CB', fontWeight: 600, textDecoration: 'none' } }
                    >
                        { copy.businessLink }
                    </a>
                    .
                </p>
                <p style={ { margin: 'auto 0 0', fontSize: '12px', lineHeight: 1.45, color: '#8A9BA8' } }>
                    { copy.disclaimer }
                </p>
            </div>

            <div
                style={ {
                    flex: '1 1 260px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28px 20px 36px',
                    boxSizing: 'border-box',
                    minHeight: '240px',
                } }
            >
                <div
                    style={ {
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: '#0a0a0a',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                    } }
                >
                    <img
                        src={ MetaVerifiedPhones }
                        alt={ copy.phonesAlt }
                        style={ { display: 'block', width: '100%', height: 'auto' } }
                    />
                </div>
            </div>
        </div>
    </div>
);

export default MetaVerifiedPanel;
