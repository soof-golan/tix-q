import react from "@vitejs/plugin-react";
import ssr from "vite-plugin-ssr/plugin";
import { partytownVite } from "@builder.io/partytown/utils";
import { UserConfig } from "vite";
import path from "path";

const config: UserConfig = {
  plugins: [
    react(),
    ssr({
      prerender: {
        partial: true,
      },
    }),
    partytownVite({
      dest: path.join(__dirname, "dist", "client", "~partytown"),
    }),
  ],
  envPrefix: "PUBLIC_",
};

export default config;
