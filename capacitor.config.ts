// import type { CapacitorConfig } from '@capacitor/cli';

// const config: CapacitorConfig = {
//   appId: 'com.hapaWeb.digitalvisitorlog',
//   appName: 'Digital Visitor Log',
//   webDir: 'public'
// };

// export default config;
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hapaWeb.digitalvisitorlog",
  appName: "Digital Visitor Log",

  server: {
    url: "https://digital-visitors-log.vercel.app",
    cleartext: false,
  }
};

export default config;