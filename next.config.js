/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: [
      "bafybeiaf6ppnztlf3k5edqrgq3zae5ih2y6vhf255hekkqn6vjwazhq36q.ipfs.nftstorage.link",
      "https://flame.buyholdearn.com",
    ],
  },
};

module.exports = nextConfig;
