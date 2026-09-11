/** @type {import('next').NextConfig} */
import { createRequire  } from 'module';
const require = createRequire(import.meta.url);

const withNextIntl = require('next-intl/plugin')();
 
export default withNextIntl({
    reactStrictMode: false,
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "health.ncu.edu.tw",
            },
            {
                protocol: "http",
                hostname: "localhost",
            }
        ]
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://health.ncu.edu.tw; font-src 'self' data:; connect-src 'self' https://health.ncu.edu.tw https://portal.ncu.edu.tw; object-src 'none'; base-uri 'self'; form-action 'self' https://portal.ncu.edu.tw; frame-ancestors 'none'; upgrade-insecure-requests"
                    },
                    { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
                ]
            },
            {
                source: '/:locale(zh|en)/:section(login|logout|admin)/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
                    { key: 'Pragma', value: 'no-cache' }
                ]
            }
        ];
    }
});
