import react from "@vitejs/plugin-react";
import { UserConfig } from "vite";
import ssr from "vite-plugin-ssr/plugin";

const config: UserConfig = {
  plugins: [
    react(),
    ssr({
      prerender: {
        partial: true,
      },
    }),
  ],
  envPrefix: "PUBLIC_",
};

export default config;
