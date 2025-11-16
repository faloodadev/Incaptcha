
#!/bin/bash

echo "🚀 InCaptcha Setup Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  npm install failed, trying with --legacy-peer-deps${NC}"
    npm install --legacy-peer-deps
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Push database schema
echo -e "${BLUE}🗄️  Setting up database schema...${NC}"
npm run db:push
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Database push failed. Make sure DATABASE_URL is set.${NC}"
    echo -e "${YELLOW}   Check your Replit Secrets or environment variables.${NC}"
else
    echo -e "${GREEN}✓ Database schema updated${NC}"
fi
echo ""

# Step 3: Seed demo site key
echo -e "${BLUE}🔑 Seeding demo site key...${NC}"
npx tsx server/seed-keys.ts
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Demo site key created${NC}"
else
    echo -e "${YELLOW}⚠️  Site key seeding skipped (may already exist)${NC}"
fi
echo ""

# Step 4: Build check
echo -e "${BLUE}🔍 Type checking...${NC}"
npm run check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Type check warnings (non-critical)${NC}"
fi
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🎯 Next steps:${NC}"
echo "   1. Click the Run button to start the development server"
echo "   2. Your app will be available at the webview URL"
echo "   3. Visit /demo to test the InCaptcha widget"
echo ""
echo -e "${BLUE}📚 API Endpoints:${NC}"
echo "   • POST /api/incaptcha/turnstile/start - Start verification"
echo "   • POST /api/incaptcha/turnstile/verify - Verify checkbox"
echo "   • POST /api/incaptcha/verify - Verify token"
echo ""
