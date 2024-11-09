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
};

export default nextConfig;
