#!/bin/bash

set -e

echo "🔧 Fixing frontend files..."

cd frontend

# Create directories if not exist
mkdir -p src/app/paste/[id]
mkdir -p public

# Create globals.css if not exists
if [ ! -f "src/app/globals.css" ]; then
    echo "📝 Creating globals.css..."
    cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF
fi

# Create tailwind config if not exists
if [ ! -f "tailwind.config.js" ]; then
    echo "📝 Creating tailwind.config.js..."
    cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
fi

# Create postcss config if not exists
if [ ! -f "postcss.config.js" ]; then
    echo "📝 Creating postcss.config.js..."
    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Create .gitkeep in public
touch public/.gitkeep

cd ..

echo "✅ Frontend files fixed!"
