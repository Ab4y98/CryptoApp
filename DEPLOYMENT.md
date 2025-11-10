# Deployment Guide

This guide will help you deploy the MoveoCrypto project to production.

## Project Structure

```
moveoCrypto/
├── client/          # React frontend (deploy to Vercel/Netlify)
│   ├── package.json
│   └── node_modules/
└── server/          # Express backend (deploy to Render/Railway)
    ├── server.js
    ├── package.json
    ├── node_modules/
    ├── routes/
    ├── models/
    ├── middleware/
    └── utils/
```

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **MongoDB Atlas Account** - Free MongoDB database (https://www.mongodb.com/cloud/atlas)
3. **Vercel Account** - For frontend deployment (https://vercel.com)
4. **Render Account** - For backend deployment (https://render.com)

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Create a new cluster (choose the free tier)
3. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password securely
4. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for simplicity
5. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/moveocrypto?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Render

1. **Sign up/Login to Render**: https://render.com

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure the Service**:
   - **Name**: `moveocrypto-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Root Directory**: `server` (important: set this to the server folder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
   **Note**: The `render.yaml` file is already configured with `rootDir: server`, so if you're using the YAML file, this will be set automatically.

4. **Set Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-strong-random-string-at-least-32-characters>
   CRYPTOPANIC_API_KEY=<your-cryptopanic-api-key-or-leave-empty>
   OPENROUTER_API_KEY=<your-openrouter-api-key-or-leave-empty>
   APP_URL=<your-frontend-url-will-be-set-after-deploying-frontend>
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://moveocrypto-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. **Sign up/Login to Vercel**: https://vercel.com

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `build` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

4. **Set Environment Variables**:
   Click "Environment Variables" and add:
   ```
   REACT_APP_API_URL=<your-backend-url-from-render>/api
   ```
   Example: `REACT_APP_API_URL=https://moveocrypto-backend.onrender.com/api`

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL (e.g., `https://moveocrypto-client.vercel.app`)

## Step 4: Update Backend Environment Variables

After deploying the frontend, update the backend's `APP_URL` environment variable:

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `APP_URL` to your Vercel frontend URL:
   ```
   APP_URL=https://moveocrypto-client.vercel.app
   ```
5. Save and redeploy (Render will auto-redeploy)

## Step 5: Update CORS Settings (if needed)

The backend already has CORS enabled, but if you encounter CORS issues:

1. Edit `server/server.js`
2. Update the CORS configuration:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```

## Alternative: Deploy to Netlify (Frontend)

If you prefer Netlify over Vercel:

1. **Sign up/Login to Netlify**: https://netlify.com
2. **Import Project**: Connect your GitHub repository
3. **Build Settings**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
4. **Environment Variables**: Add `REACT_APP_API_URL`
5. **Deploy**

## Alternative: Deploy to Railway (Backend)

If you prefer Railway over Render:

1. **Sign up/Login to Railway**: https://railway.app
2. **New Project**: Create from GitHub repo
3. **Add Service**: Select your repo
4. **Environment Variables**: Add all required variables
5. **Deploy**: Railway auto-detects Node.js and deploys

## Local Development

After these changes, you can test locally:

### Backend Setup
```bash
# Navigate to server folder
cd server

# Install dependencies (if not already installed)
npm install

# Create .env file in the root directory (not in server folder)
# Copy from env.example.txt and update with your local MongoDB URI

# Start the server
npm start
# or for development with auto-reload:
npm run dev
```

### Frontend Setup (in another terminal)
```bash
# Navigate to client folder
cd client

# Install dependencies (if not already installed)
npm install

# Start the development server
npm start
```

**Important Notes:**
- The backend `package.json` is now in the `server/` folder
- The frontend `package.json` is in the `client/` folder
- Create a `.env` file in the **root directory** (not in server folder) with your environment variables
- Backend will run on `http://localhost:5000` (or PORT from .env)
- Frontend will run on `http://localhost:3000`
- Make sure `REACT_APP_API_URL` is set in frontend or defaults to `http://localhost:5000/api`

## Environment Variables Summary

### Backend (Render/Railway)
- `NODE_ENV=production`
- `PORT=10000` (Render) or auto (Railway)
- `MONGODB_URI=<mongodb-atlas-connection-string>`
- `JWT_SECRET=<strong-random-string>`
- `CRYPTOPANIC_API_KEY=<optional>`
- `OPENROUTER_API_KEY=<optional>`
- `APP_URL=<frontend-url>`

### Frontend (Vercel/Netlify)
- `REACT_APP_API_URL=<backend-url>/api`

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed**:
   - Verify MongoDB Atlas IP whitelist includes Render/Railway IPs
   - Check connection string format
   - Ensure database user has correct permissions

2. **Port Issues**:
   - Render uses PORT environment variable automatically
   - Ensure your code uses `process.env.PORT`

3. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Frontend Issues

1. **API Connection Failed**:
   - Verify `REACT_APP_API_URL` is set correctly
   - Check backend is running and accessible
   - Verify CORS is configured correctly

2. **Build Failures**:
   - Check build logs in Vercel/Netlify dashboard
   - Ensure all dependencies are installed
   - Check for TypeScript/ESLint errors

### General Issues

1. **Environment Variables Not Working**:
   - Ensure variables are set in deployment platform
   - Restart/redeploy after adding variables
   - Check variable names match exactly (case-sensitive)

2. **Static Files Not Loading**:
   - Verify static file paths in `server/server.js`
   - Check file permissions
   - Ensure files are committed to repository

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB Atlas connected
- [ ] Environment variables set correctly
- [ ] Frontend can communicate with backend
- [ ] User registration/login works
- [ ] Dashboard loads data correctly
- [ ] Static images load correctly

## Security Notes

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong JWT_SECRET** - Generate using: `openssl rand -base64 32`
3. **Restrict MongoDB IP access** - Only allow Render/Railway IPs in production
4. **Use HTTPS** - Both Vercel and Render provide HTTPS by default
5. **Keep dependencies updated** - Regularly update npm packages

## Support

If you encounter issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection status

