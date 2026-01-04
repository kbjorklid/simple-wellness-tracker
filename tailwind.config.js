/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#fbbf24", // Gold Yellow
                "primary-hover": "#f59e0b",
                "background-light": "#e5e5e5",
                "background-dark": "#121212", // Very dark grey
                "card-dark": "#1e1e1e", // Dark grey
                "card-light": "#ffffff",
                "border-dark": "#333333",
                "input-bg-dark": "#2a2a2a",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
    plugins: [],
}
