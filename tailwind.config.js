/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "glacier-100": "#E0F2FF",
        "glacier-200": "#C1E5FF",
        "glacier-400": "#83CBFF",
        "glacier-500": "#64BEFF",
        "glacier-600": "#509FD8",
        mist: "#F0F5FB",
        "grey-100": "#EBEFF5",
        "grey-200": "#D3D7DE",
        "grey-300": "#B5BAC4",
        "grey-400": "#DCDCDC",
        "grey-500": "#727C8C",
        "grey-600": "#545C69",
        snow: "#fff",
        obsidian: "#000C1E",
        "high-emphasis": "#1E1E1E",
        "med-emphasis": "#5A5A5A",
        "midnight-ocean-100": "#D3E5FF",
        "midnight-ocean-500": "#002760",
        "midnight-ocean-400": "#436EAE",

        "success-500": "#24BD6E",
        "success-600": "#1D9959",
        "pumpkin-flipper": "#FF7040",
        "purple-200": "#ECE3FB",
        "purple-500": "#805AD5",
        "purple-800": "#43335F",
        "warning-500": "#FF7040",
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
      height: {
        31: "31px",
        30: "30px",
      },
      fontSize: {
        10: "10px",
        8: "8px",
        12: "12px",
        11: "11px",
      },
      lineHeight: {
        13: "13px",
        100: "100%",
        125: "125%",
        150: "150%",
      },
    },
  },
  plugins: [],
};
