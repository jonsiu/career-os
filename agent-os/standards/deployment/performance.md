## Production performance optimization

- **Core Web Vitals**: Monitor and optimize LCP, FID/INP, and CLS to meet Google's thresholds
- **Code Splitting**: Split JavaScript bundles by route to reduce initial load time
- **Image Optimization**: Use modern image formats (WebP, AVIF); serve responsive images with appropriate sizes
- **Font Loading**: Optimize web font loading with font-display: swap and subsetting
- **Caching Strategy**: Implement aggressive caching for static assets; use stale-while-revalidate for data
- **CDN Usage**: Serve static assets and images through CDN for faster global delivery
- **Compression**: Enable gzip/brotli compression for text-based assets
- **Critical CSS**: Inline critical CSS for above-the-fold content to reduce render blocking
- **Lazy Loading**: Lazy load images and components below the fold to improve initial page load
- **Database Optimization**: Optimize queries, add indexes, and use connection pooling
- **API Response Time**: Monitor and optimize API response times; cache when appropriate
- **Bundle Analysis**: Regularly analyze bundle size; remove unused dependencies and code
- **Server-Side Rendering**: Leverage SSR for faster first contentful paint and better SEO
