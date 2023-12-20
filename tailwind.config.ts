import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "hero-pattern": "url('/background_1.jpg')",
      },
      fontFamily: {
        body: ["Nunito Sans"],
      },
      screens: {
        xs: "465px",
      },
      boxShadow: {
        "inner-sym": "inset 0px 0px 5px 0px #FF6B10",
      },
      dropShadow: {
        text: "2px 2px 2px #FF6B10",
      },
      colors: {
        dark: "rgb(180 83 9)",
        primary: "#FF6B10",
        accent: "rgb(234 179 8)",
        highlight: "rgb(253 224 71)",
        hover: "rgb(154 52 18)",
        button: "#fff",
        buttonHover: "#FF6B10",
        buttonInactive: "rgb(100 116 139)",
        buttonInactiveText: "rgb(203 213 225)",
        inputBackground: "rgb(31 41 55)",
      },
    },
  },
  plugins: [],
};
export default config;
