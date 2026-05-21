/** @type {import('next').NextConfig} */
// 当部署到 GitHub Project Pages (user.github.io/MyTreeHole) 时，
// 在 GitHub Actions 里设置环境变量 NEXT_PUBLIC_BASE_PATH=/MyTreeHole
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
