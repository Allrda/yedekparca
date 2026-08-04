nodejs.org LTS önerilen ile kurulacak
Visüal Studio Code

Remove-Item -Recurse -Force node_modules, package-lock.json

npm install

npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer

postcss.config.js

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}


tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


src/index.css

@import "tailwindcss";

