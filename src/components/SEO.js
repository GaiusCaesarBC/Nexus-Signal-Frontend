// client/src/components/SEO.js - SEO Optimization Component

import { Helmet } from 'react-helmet-async';

const SEO = ({ 
    title = 'Nexus Signal AI - AI-Powered Stock Predictions & Portfolio Management',
    description = 'Get AI-powered stock predictions, real-time market insights, and intelligent portfolio management. Nexus Signal AI uses advanced machine learning to help you make smarter trading decisions.',
    keywords = 'stock predictions, AI trading, portfolio management, stock market analysis, machine learning, trading platform, investment tools',
    image = '/og-image.png',
    url = window.location.href,
    type = 'website'
}) => {
    const siteUrl = 'https://nexussignal.ai';
    const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
    
    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:site_name" content="Nexus Signal AI" />
            
            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={fullImageUrl} />
            
            {/* Additional Meta Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English" />
            <meta name="revisit-after" content="7 days" />
            <meta name="author" content="Nexus Signal AI" />
            
            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
};

export default SEO;

// ============================================
// USAGE EXAMPLES FOR DIFFERENT PAGES
// ============================================

/*

// Landing Page
<SEO 
    title="Nexus Signal AI - AI-Powered Stock Predictions"
    description="Transform your trading with AI-powered predictions. Get real-time insights, portfolio analysis, and market intelligence."
/>

// Dashboard
<SEO 
    title="Dashboard | Nexus Signal AI"
    description="View your portfolio performance, AI predictions, and real-time market data in your personalized dashboard."
/>

// Predictions Page
<SEO 
    title="AI Stock Predictions | Nexus Signal AI"
    description="Get AI-powered stock price predictions with confidence scores. Our machine learning models analyze thousands of data points."
/>

// Portfolio Page
<SEO 
    title="Portfolio Management | Nexus Signal AI"
    description="Track and optimize your stock portfolio with AI-powered insights and real-time performance analytics."
/>

// Pricing Page
<SEO 
    title="Pricing Plans | Nexus Signal AI"
    description="Choose the perfect plan for your trading needs. From free starter to elite professional plans."
/>

// About Page
<SEO 
    title="About Us | Nexus Signal AI"
    description="Learn about Nexus Signal AI's mission to democratize AI-powered trading insights for everyone."
/>

*/