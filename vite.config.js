import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Include key static assets in the precache manifest.
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],

      // ── Web App Manifest ────────────────────────────────────────────────────
      manifest: {
        name:             'ميدلينك',
        short_name:       'ميدلينك',
        description:      'منصة التبرع الطبي الآمن — نربط المتبرعين بمن يحتاج الأدوية والأجهزة الطبية',
        theme_color:      '#0ea5e9',
        background_color: '#ffffff',
        display:          'standalone',
        orientation:      'portrait',
        scope:            '/',
        start_url:        '/',
        lang:             'ar',
        dir:              'rtl',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          {
            name:      'تصفح التبرعات',
            short_name:'التبرعات',
            url:       '/donations',
            icons:     [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name:      'خريطة التبرعات',
            short_name:'الخريطة',
            url:       '/map',
            icons:     [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },

      // ── Workbox caching strategies ──────────────────────────────────────────
      workbox: {
        // Precache the app shell (JS, CSS, HTML).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Navigation fallback — serve the app shell for any unmatched navigation,
        // allowing the React Router to handle client-side routing.
        navigateFallback: '/index.html',

        // Exclude API calls and admin paths from the navigation fallback.
        navigateFallbackDenylist: [/^\/api\//, /^\/admin/],

        runtimeCaching: [
          // ── App shell: CacheFirst ─────────────────────────────────────────
          // Static JS/CSS/fonts served from cache first — fast loads.
          {
            urlPattern: /\.(?:js|css|woff2?|ttf|otf|eot)$/i,
            handler:    'CacheFirst',
            options: {
              cacheName:        'static-assets',
              expiration:       { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse:{ statuses: [0, 200] },
            },
          },

          // ── Images: CacheFirst ────────────────────────────────────────────
          // Donation images from Cloudinary cached locally.
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/i,
            handler:    'CacheFirst',
            options: {
              cacheName:        'images',
              expiration:       { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse:{ statuses: [0, 200] },
            },
          },

          // ── Public API data: StaleWhileRevalidate ─────────────────────────
          // Public donation listings and categories are served from cache
          // while a fresh fetch happens in the background.
          // Sensitive endpoints (auth, submit, notifications) are excluded.
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/donations') ||
              url.pathname.startsWith('/api/categories') ||
              url.pathname.startsWith('/api/geo/nearby-donations'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName:        'api-public',
              expiration:       { maxEntries: 50, maxAgeSeconds: 5 * 60 },
              cacheableResponse:{ statuses: [200] },
            },
          },

          // ── OpenStreetMap tiles: CacheFirst ───────────────────────────────
          // Map tiles are large and change infrequently — cache aggressively.
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\//,
            handler:    'CacheFirst',
            options: {
              cacheName:        'map-tiles',
              expiration:       { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse:{ statuses: [0, 200] },
            },
          },

          // ── Google Fonts: StaleWhileRevalidate ────────────────────────────
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler:    'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler:    'CacheFirst',
            options: {
              cacheName:        'google-fonts-webfonts',
              expiration:       { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse:{ statuses: [0, 200] },
            },
          },
        ],
      },

      // Development: disable the Service Worker in dev mode.
      // Enabling it (enabled: true, type: 'module') causes the SW to load its
      // own copy of React independently from the main bundle, producing two
      // React instances in the same page — which breaks all hooks (Invalid hook
      // call) and crashes useContext. The SW is only needed in production builds.
      devOptions: {
        enabled: false,
      },
    }),
  ],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:       'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        // Split large vendor libraries into separate chunks so the app shell
        // stays small and loads fast on first visit.
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':  ['@tanstack/react-query'],
          'vendor-leaflet':['leaflet', 'react-leaflet'],
          'vendor-form':   ['react-hook-form', '@hookform/resolvers', 'yup'],
        },
      },
    },
    // Raise the warning threshold — we know Leaflet is large.
    chunkSizeWarningLimit: 800,
  },
});
