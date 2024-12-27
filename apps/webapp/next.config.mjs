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
};

export default nextConfig;
