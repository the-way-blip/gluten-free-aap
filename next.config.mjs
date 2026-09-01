/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Canonical public domain is eatsift.app (no www).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.eatsift.app" }],
        destination: "https://eatsift.app/:path*",
        permanent: true,
      },
      // NOTE: sift-self.vercel.app is deliberately NOT redirected — the iOS app
      // loads that origin and users' local data (profile, saved recipes) lives
      // there. Public/SEO traffic uses eatsift.app; canonical tags point there.
    ];
  },
};

export default nextConfig;
