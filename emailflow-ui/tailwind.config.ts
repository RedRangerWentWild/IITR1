import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#121212',
                foreground: '#E6EDF3',
                card: {
                    DEFAULT: '#1E1E1E',
                    foreground: '#E6EDF3'
                },
                popover: {
                    DEFAULT: '#1E1E1E',
                    foreground: '#E6EDF3'
                },
                primary: {
                    DEFAULT: '#007AFF',
                    foreground: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: '#161B22',
                    foreground: '#8B949E'
                },
                muted: {
                    DEFAULT: '#161B22',
                    foreground: '#8B949E'
                },
                accent: {
                    DEFAULT: '#007AFF',
                    foreground: '#FFFFFF'
                },
                border: '#30363D',
                input: '#30363D',
                ring: '#007AFF',
                bubbleIn: '#1E1E1E',
                bubbleOut: '#007AFF',
                composer: '#0D1117',
                textSecondary: '#8B949E'
            },
            borderRadius: {
                lg: '0.5rem',
                md: 'calc(0.5rem - 2px)',
                sm: 'calc(0.5rem - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
