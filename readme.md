# Instagram Influencer Profile Dashboard

This full-stack application provides a comprehensive, data-rich dashboard for any public Instagram influencer. It scrapes real-time data by leveraging Instagram's internal JSON API, enriches it with multi-modal AI analysis via the Google Gemini API, and presents the insights in a clean, modern, and responsive user interface.

![Output_of_profile](./thumbnail.png)

[**Demo Video**](https://drive.google.com/drive/folders/1yZWPFLbig8taRdXZhSFBruDkbG6OgexP?usp=sharing)
---

## Features

* **Real-Time Profile Scraping**: Fetch any public Instagram profile by username using an authenticated API approach that mimics a real browser.
* **Comprehensive Data Points**: Gathers all key metrics, including follower/following counts, post counts, and bio.
* **Content Analysis (Posts & Reels)**: Displays the latest posts and Reels with their respective engagement numbers (likes, comments, and views).
* **AI-Powered Content Tagging**: Each post is analyzed by the **Google Gemini Vision** model to generate relevant tags, a "vibe" classification (e.g., 'luxury', 'casual'), and a quality assessment.
* **In-Depth Analytics**:
    * Calculates average likes, comments, and a detailed **engagement rate**.
    * Visualizes content strategy with charts showing post category distribution.
* **AI-Inferred Audience Demographics**: Utilizes AI to infer and visualize the influencer's likely audience demographics, including gender split, age groups, and top geographical locations.
* **Secure User Authentication**: Implements a robust **JWT (JSON Web Token)** authentication system for user registration and login.
* **Efficient State Management**: Uses **Zustand** for a minimal, fast, and scalable state management solution on the frontend.
* **Smart Caching**: Caches fetched profiles in MongoDB for 24 hours to improve performance and avoid rate-limiting, with a "Force Refresh" option for on-demand updates.

---

## System Architecture

The application is built on a sophisticated pipeline that transforms raw public data into actionable insights, secured by a robust authentication layer and managed by an efficient state management system.

![Flow chart](./flow_chart.png)

### 1. Data Scraping & Caching

The scraper's success lies in its ability to bypass standard protections by directly targeting Instagram's internal JSON API.

* **Authenticated API Mimicry**: The backend uses session cookies (`sessionid`, `csrftoken`) from a logged-in browser session, combined with headers that precisely mimic a real browser. This grants access to Instagram's internal API endpoints as a legitimate user.
* **Two-Step Data Fetch**:
    1.  First, it hits the `web_profile_info` endpoint to get the user's core data and unique `userId`.
    2.  Second, it uses this `userId` to call the `feed/user/` endpoint, which returns a rich JSON array of the user's recent media.
* **Data Processing**: The feed is parsed to segregate posts and Reels based on their `media_type`. Key metrics like `like_count`, `comment_count`, and `play_count` are extracted.
* **Database Caching**: The final, enriched profile object is saved to MongoDB. This serves as a 24-hour cache, with a "Force Refresh" option to provide on-demand updates.

### 2. AI-Powered Data Enrichment

* **Content Analysis (Gemini Vision)**: For each post, the thumbnail image and caption are sent to the multi-modal Gemini Vision model. Through carefully engineered prompts that enforce a strict JSON output, the model returns structured data: `tags`, `vibe`, and `quality`.
* **Audience Demographics (Gemini Text)**: The influencer's profile data and content themes are sent to a Gemini text model. The AI **infers** the most likely audience demographics by correlating the content with known demographic patterns, returning chart-ready JSON data.

### 3. JWT Authentication

The application is secured with a token-based authentication flow.

1.  **User Registration/Login**: When a user registers or logs in, the Express server validates their credentials.
2.  **Token Generation**: Upon successful validation, the server generates a **JSON Web Token (JWT)**. This token contains a payload with the user's ID and is signed with a secret key stored on the server.
3.  **Token Storage**: The token is sent to the client, where it's stored in `localStorage`.
4.  **Authenticated Requests**: For all subsequent protected API requests (like scraping a profile), the client sends this JWT in the `Authorization` header (`Bearer <token>`).
5.  **Server-Side Verification**: A custom middleware on the server intercepts each request, verifies the JWT's signature, and extracts the user's ID, granting access to the protected route.

### 4. Frontend State Management with Zustand

The React frontend uses **Zustand**, a small, fast, and scalable state management solution.

* **Simplicity**: Zustand provides a minimal API that's easy to understand, avoiding the boilerplate often associated with other state management libraries.
* **Modular Stores**: The state is organized into logical, modular stores (e.g., `authStore`, `scrapeStore`, `searchStore`). This makes the state easy to manage and debug.
* **Direct State Access**: Zustand allows components to subscribe to only the state they need, preventing unnecessary re-renders and optimizing performance. State and actions are accessed via simple hooks (e.g., `useAuthStore`).

---

## Tech Stack

| Category          | Technology                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend** | [**React**](https://reactjs.org/) (with Vite), [**Tailwind CSS**](https://tailwindcss.com/)                     |
| **State Mngmt** | [**Zustand**](https://zustand-demo.pmnd.rs/)                                                                  |
| **Data Viz** | [**Recharts**](https://recharts.org/)                                                                         |
| **Backend** | [**Node.js**](https://nodejs.org/), [**Express**](https://expressjs.com/)                                     |
| **Authentication**| [**JWT**](https://jwt.io/), [**bcryptjs**](https://www.npmjs.com/package/bcryptjs)                             |
| **Database** | [**MongoDB**](https://www.mongodb.com/) (with Mongoose)                                                       |
| **Data Scraping** | Direct Authenticated API Calls with `axios`                                                                 |
| **AI/ML** | [**Google Gemini API**](https://ai.google.dev/)                                                               |

---

## Setup and Installation

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* MongoDB Atlas account (or a local MongoDB instance)
* Google Gemini API Key

### Backend Setup (`/server`)

1.  **Navigate to the server directory**:
    ```bash
    cd server
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Create an environment file**:
    * Rename `.env.example` to `.env`.
    * Add your MongoDB connection string, your Google Gemini API key, and a secret for JWT signing:
        ```env
        MONGO_URI=your_mongodb_connection_string
        GEMINI_API_KEY=your_gemini_api_key
        JWT_SECRET=your_super_secret_key_for_jwt
        ```
4.  **Add Instagram Cookies**:
    * Log in to Instagram in your browser.
    * Using developer tools, export your cookies for the `instagram.com` domain as a JSON file.
    * Save this file as `cookies.json` in the `/server` directory. **This file is gitignored and must never be committed.**
5.  **Start the server**:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:3000`.

### Frontend Setup (`/client`)

1.  **Navigate to the client directory**:
    ```bash
    cd client
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Create an environment file**:
    * Create a file named `.env` in the `/client` directory.
    * Point it to your local backend server:
        ```env
        VITE_API_URL=http://localhost:3000
        ```
4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.