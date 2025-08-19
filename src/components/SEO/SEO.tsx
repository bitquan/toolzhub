import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'ToolzHub - Free Online QR Code Generator & Digital Tools',
  description = 'Generate QR codes instantly for free. Create QR codes for URLs, text, email, phone, SMS, WiFi, and more. Professional QR code generator with customization options.',
  keywords = 'QR code generator, free QR codes, online tools, digital tools, barcode generator, URL shortener, business tools',
  image = 'https://toolzhub-5014-31157.web.app/og-image.jpg',
  url = 'https://toolzhub-5014-31157.web.app',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  structuredData
}) => {
  const siteName = 'ToolzHub';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": siteName,
    "url": url,
    "description": description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": siteName
    }
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content={author || siteName} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};
