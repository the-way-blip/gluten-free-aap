import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config for the Sift iOS app.
 *
 * v1 strategy: the native shell loads the live web app (server.url) so the AI
 * API routes keep working without a static-export refactor. `webDir` holds a
 * tiny offline fallback that shows if there's no connection. Before App Store
 * submission, add native camera + push so the app clears Apple's "minimum
 * functionality" review (Guideline 4.2).
 *
 * Change `appId` to your own reverse-DNS identifier before building, and keep
 * it identical in App Store Connect.
 */
const config: CapacitorConfig = {
  appId: "com.branddesignco.sift",
  appName: "Sift",
  webDir: "ios-www",
  server: {
    url: "https://sift-self.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
