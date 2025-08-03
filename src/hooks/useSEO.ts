import { useEffect } from 'react';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  structuredData?: object;
}

export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    // Update title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update basic meta tags
    if (seoData.description) {
      updateMetaTag('description', seoData.description);
    }
    
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }

    // Update Open Graph tags
    if (seoData.ogTitle) {
      updateMetaTag('og:title', seoData.ogTitle, true);
    }
    
    if (seoData.ogDescription) {
      updateMetaTag('og:description', seoData.ogDescription, true);
    }
    
    if (seoData.ogImage) {
      updateMetaTag('og:image', seoData.ogImage, true);
    }
    
    if (seoData.ogUrl) {
      updateMetaTag('og:url', seoData.ogUrl, true);
    }

    // Update Twitter tags
    if (seoData.twitterTitle) {
      updateMetaTag('twitter:title', seoData.twitterTitle, true);
    }
    
    if (seoData.twitterDescription) {
      updateMetaTag('twitter:description', seoData.twitterDescription, true);
    }
    
    if (seoData.twitterImage) {
      updateMetaTag('twitter:image', seoData.twitterImage, true);
    }

    // Update canonical URL
    if (seoData.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', seoData.canonical);
    }

    // Update structured data
    if (seoData.structuredData) {
      const existingScript = document.querySelector('script[data-seo="dynamic"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'dynamic');
      script.textContent = JSON.stringify(seoData.structuredData);
      document.head.appendChild(script);
    }
  }, [seoData]);
};

// Predefined SEO configurations for different page types
export const seoConfigs = {
  home: {
    title: 'InSeats - Premium Event Tickets & Concert Tickets Online',
    description: 'Find and buy premium event tickets, concert tickets, sports tickets, and theater tickets at InSeats. Secure checkout, instant delivery, and authentic tickets guaranteed.',
    keywords: 'event tickets, concert tickets, sports tickets, theater tickets, buy tickets online, premium tickets, ticket marketplace, live events',
    canonical: 'https://inseats.com/',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "InSeats",
      "url": "https://inseats.com",
      "description": "Premium event ticket marketplace",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://inseats.com/events?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },
  events: {
    title: 'Browse Events - Find Concert, Sports & Theater Tickets | InSeats',
    description: 'Browse thousands of live events including concerts, sports games, theater shows, and more. Find the perfect tickets for your next experience at InSeats.',
    keywords: 'browse events, concert listings, sports events, theater shows, live entertainment, event calendar',
    canonical: 'https://inseats.com/events'
  },
  sell: {
    title: 'Sell Your Tickets - Safe & Secure Ticket Resale | InSeats',
    description: 'Sell your event tickets safely and securely on InSeats. Get fair market value for your tickets with our trusted resale platform.',
    keywords: 'sell tickets, ticket resale, resell event tickets, ticket marketplace, sell concert tickets',
    canonical: 'https://inseats.com/sell'
  },
  about: {
    title: 'About InSeats - Your Trusted Event Ticket Marketplace',
    description: 'Learn about InSeats, the premier destination for authentic event tickets. Discover our mission to connect fans with unforgettable live experiences.',
    keywords: 'about inseats, ticket marketplace, authentic tickets, live events, company information',
    canonical: 'https://inseats.com/about'
  },
  howItWorks: {
    title: 'How It Works - Easy Ticket Buying & Selling | InSeats',
    description: 'Learn how to buy and sell tickets on InSeats. Simple steps to secure authentic tickets or sell your extras safely and securely.',
    keywords: 'how to buy tickets, how to sell tickets, ticket buying guide, secure ticket transactions',
    canonical: 'https://inseats.com/how-it-works'
  },
  terms: {
    title: 'Terms of Service - InSeats Ticket Marketplace',
    description: 'Read the terms of service for InSeats ticket marketplace. Understand your rights and responsibilities when buying or selling tickets.',
    keywords: 'terms of service, user agreement, ticket marketplace terms',
    canonical: 'https://inseats.com/terms'
  },
  privacy: {
    title: 'Privacy Policy - How InSeats Protects Your Information',
    description: 'Learn how InSeats protects your personal information and privacy. Our commitment to keeping your data safe and secure.',
    keywords: 'privacy policy, data protection, personal information, privacy rights',
    canonical: 'https://inseats.com/privacy'
  }
};

// Helper function to generate event-specific SEO data
export const generateEventSEO = (event: any): SEOData => {
  const eventName = event?.name || 'Event';
  const eventDate = event?.date ? new Date(event.date).toLocaleDateString() : '';
  const venue = event?.venue || '';
  const city = event?.city || '';
  
  return {
    title: `${eventName} Tickets${venue ? ` at ${venue}` : ''}${city ? ` in ${city}` : ''} | InSeats`,
    description: `Buy ${eventName} tickets${eventDate ? ` for ${eventDate}` : ''}${venue ? ` at ${venue}` : ''}${city ? ` in ${city}` : ''}. Secure checkout, instant delivery, and authentic tickets guaranteed.`,
    keywords: `${eventName} tickets, ${venue} tickets, ${city} events, buy tickets online, live events`,
    canonical: `https://inseats.com/events/${event?.id || ''}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": eventName,
      "startDate": event?.date,
      "location": {
        "@type": "Place",
        "name": venue,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city
        }
      },
      "offers": {
        "@type": "Offer",
        "url": `https://inseats.com/events/${event?.id || ''}`,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }
  };
};
