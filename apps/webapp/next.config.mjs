/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "chainid.network",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback.fs = false;
            config.resolve.fallback.dns = false;
            config.resolve.fallback.net = false;
            config.resolve.fallback.tls = false;
        }

        return config;
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
