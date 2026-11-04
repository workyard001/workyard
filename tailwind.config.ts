import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { work: { green: "#0B7A42", yellow: "#FDBF3C", ink: "#173126" } } } },
  plugins: []
};
export default config;