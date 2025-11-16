# Render Deployment Guide

This guide will help you deploy your REST API application to Render quickly and easily.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your GitHub repository connected to Render
3. A PostgreSQL database (you can use Render's free PostgreSQL)

## Quick Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Create a New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Set up your PostgreSQL database**
   - In Render Dashboard, click "New +" → "PostgreSQL"
   - Choose a name for your database
   - Select the free tier (or paid if needed)
   - Click "Create Database"
   - Copy the "Internal Database URL"

4. **Configure Environment Variables**
   - In your Web Service settings, go to "Environment"
   - Add the following environment variable:
     - `DATABASE_URL`: Paste your PostgreSQL Internal Database URL
   - The `render.yaml` already sets:
     - `NODE_ENV=production`
     - `SESSION_SECRET` (auto-generated)
     - `PORT=10000`

5. **Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for the build to complete
   - Your API will be available at: `https://your-service-name.onrender.com`

### Option 2: Manual Configuration

If you prefer manual configuration or want more control:

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Build Settings**
   - **Name**: Choose a name for your service
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free (or paid tier)

3. **Set Environment Variables** (same as Option 1, step 4)

4. **Deploy** (same as Option 1, step 5)

## Post-Deployment

### Push Database Schema

After your first deployment, you need to push your database schema:

1. Install the Render CLI (optional but helpful):
   ```bash
   npm install -g render-cli
   ```

2. Push the schema using one of these methods:

   **Method A: Using Render Shell**
   - Go to your service in Render Dashboard
   - Click "Shell" tab
   - Run: `npm run db:push`

   **Method B: Locally with DATABASE_URL**
   - Copy your DATABASE_URL from Render
   - Run locally:
     ```bash
     DATABASE_URL="your_database_url" npm run db:push
     ```

### Verify Deployment

1. Check the health endpoint: `https://your-service-name.onrender.com/api/health`
2. Test your API endpoints using your API documentation

## Troubleshooting

### Build Fails with "Cannot find module"

This usually happens if dependencies are missing. Make sure:
- All required packages are in `dependencies`, not `devDependencies`
- The build command includes `npm install`
- The `build` script in package.json runs successfully

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Use the "Internal Database URL" from Render PostgreSQL (faster and free)
- Make sure your database is in the same region as your web service

### Port Issues

Render automatically sets the `PORT` environment variable. Our app reads from `process.env.PORT`, so it should work automatically.

### Application Crashes on Startup

Check the logs in Render Dashboard:
- Go to "Logs" tab in your service
- Look for error messages
- Common issues:
  - Missing environment variables
  - Database connection failures
  - Build artifacts not created properly

## Updating Your Application

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. Render will automatically deploy (if auto-deploy is enabled)
   - Or manually trigger deployment from the Dashboard

## Free Tier Limitations

Render's free tier includes:
- Your web service will spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds (cold start)
- 750 hours/month of runtime
- Limited compute resources

Consider upgrading to a paid tier for:
- Always-on services (no cold starts)
- Better performance
- More resources

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Deploy Guide](https://render.com/docs/deploy-node-express-app)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
