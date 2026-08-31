'use client';

import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export default function SEO({ 
  title = 'NextStep AI - Career Analysis Platform',
  description = 'AI-powered career profile analysis for GitHub, LinkedIn, and Resume with JD matching',
  keywords = 'career analysis, resume analysis, GitHub profile, LinkedIn profile, job matching, AI career tool',
  ogImage = '/og-image.png'
}: SEOProps) {
  const fullTitle = title.includes('NextStep AI') ? title : `${title} | NextStep AI`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://nextstepai.com" />
    </Head>
  );
}