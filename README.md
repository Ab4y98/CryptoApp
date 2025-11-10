# MoveoCrypto - Personalized Crypto Investor Dashboard

A MERN stack web application that serves as a personalized crypto investor dashboard. Users complete an onboarding quiz, and the app displays daily AI-curated content tailored to their interests.

## Features

- **Authentication**: Sign up and login with JWT-based authentication
- **Onboarding**: Personalized quiz to understand user preferences
- **Daily Dashboard**: 
  - Market News (CryptoPanic API)
  - Coin Prices (CoinGecko API)
  - AI Insight of the Day (OpenRouter/Hugging Face)
  - Fun Crypto Meme
- **Feedback System**: Thumbs up/down voting on all content
- **Profile Management**: Edit preferences and interests

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, React Router
- **Authentication**: JWT (JSON Web Tokens)
- **APIs**: CoinGecko, CryptoPanic, OpenRouter

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the root directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/moveocrypto
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   CRYPTOPANIC_API_KEY=your-cryptopanic-api-key-optional
   OPENROUTER_API_KEY=your-openrouter-api-key-optional
   ```

4. Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory (optional):
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Onboarding
- `POST /api/onboarding` - Save user preferences (requires auth)

### Dashboard
- `GET /api/dashboard` - Get daily dashboard content (requires auth)

### Feedback
- `POST /api/feedback` - Submit feedback/vote (requires auth)

### Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update user preferences (requires auth)

## Project Structure

```
moveoCrypto/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   └── Feedback.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── onboarding.js
│   ├── dashboard.js
│   ├── feedback.js
│   └── profile.js
├── middleware/             # Express middleware
│   └── auth.js
├── server.js              # Express server
└── package.json
```

## Notes

- The app uses fallback data if API keys are not provided
- Memes are currently using placeholder data (can be replaced with Reddit API)
- AI insights use OpenRouter API with fallback to static content
- All API endpoints require authentication except signup/login

## License

ISC

