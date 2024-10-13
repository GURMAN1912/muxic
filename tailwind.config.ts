import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Gradient
        dark: {
          DEFAULT: '#1a1a2e', // Dark Navy for main background
          gradient: {
            from: '#1a1a2e', // Starting point of gradient
            via: '#0f0f17', // Middle color for gradient
            to: '#3c096c',  // End point of gradient, purple hue
          },
        },
        // Accent Colors
        indigo: {
          light: '#6366f1', // Lighter indigo for hover
          DEFAULT: '#4f46e5', // Indigo as primary accent
          dark: '#4338ca', // Darker indigo shade
        },
        purple: {
          light: '#a78bfa', // Soft Purple for text highlights
          DEFAULT: '#7c3aed', // Electric purple for secondary accents
        },
        teal: {
          DEFAULT: '#14b8a6', // Teal for alternative accent
        },
        gray: {
          light: '#f8fafc', // Light gray for text
          DEFAULT: '#d1d5db', // Cool gray for text
          dark: '#3b3b4f', // Dark gray for borders/dividers
        },
      },
      // Custom gradient
      backgroundImage: {
        'gradient-to-br': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      // Font Sizes & Spacing Adjustments (Optional)
      fontSize: {
        '4xl': '2.5rem', // Custom size for headings
      },
      spacing: {
        '128': '32rem', // Larger spacers for layout
      },
    },
  },
  plugins: [],
};
export default config;
