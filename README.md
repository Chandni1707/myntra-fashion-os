# Myntra FashionOS - HackerRamp WeForShe 2026

## 🎯 Theme & Problem Statement

### Themes Addressed

**Primary: Theme 3-** Fashion as Identity

**Secondary: Theme 2-** Speed & Trust

### Problem Statement

Fashion shopping today is often reactive, generic, and overwhelming. Users struggle to discover outfits that truly represent their identity while also needing recommendations that are personalized, context-aware, and instantly accessible.

Current fashion platforms primarily focus on keyword-based searches and purchase history, lacking deeper personalization and proactive assistance for different occasions.

### Core Problems Identified

#### Fashion Discovery Challenges

- Generic recommendations with limited personalization
- Difficulty expressing individual style and identity
- Lack of occasion-aware outfit planning
- Time-consuming fashion search process

#### Limited AI Personalization

- Minimal understanding of user preferences
- No intelligent event-based outfit generation
- Lack of wardrobe-aware recommendations
- Missing personalized styling assistance

#### Fragmented Shopping Experience

- Users switch between multiple platforms for inspiration
- Difficult to recreate outfits from creators and social media
- Limited fashion planning capabilities

---

# 💡 Our Solution

FashionOS is an AI-powered intelligent fashion assistant that transforms the shopping experience by combining personalization, computer vision, and event planning into a single platform.

Instead of simply searching for clothes, FashionOS understands the user's identity, preferences, occasions, and fashion goals to recommend complete outfits with intelligent reasoning.

The platform provides proactive recommendations while enabling users to discover fashion inspiration through images, videos, and AI-powered analysis.

---

# 🌟 Core Features

## 1. AI Fashion Capture

- Upload images
- Upload videos
- Paste image URLs
- Paste video URLs
- AI-powered fashion understanding
- Creator-inspired outfit discovery

---

## 2. Event Planner

Generate complete outfits for:

- Weddings
- Interviews
- College Events
- Parties
- Festivals
- Vacations
- Office Meetings

Features include:

- Budget-aware recommendations
- Dress code understanding
- AI-generated outfit combinations
- Alternative outfit suggestions

---

## 3. Personalized Fashion Profile

Each user has a personalized fashion profile including:

- Favorite Colors
- Favorite Styles
- Favorite Brands
- Budget Preference
- Preferred Fit
- Gender Preference
- AI Style Score
- Fashion Statistics

---

## 4. Smart Recommendation Engine

Provides recommendations using:

- User Preferences
- Event Context
- Budget
- Fashion Similarity
- Semantic Search
- AI Matching Score

---

## 5. Fashion History

Stores previous:

- Captures
- Recommendations
- Events
- Searches
- Generated Outfits

Users can revisit any previous recommendation instantly.

---

# 🎨 Technical Architecture

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- Axios
- Lucide React Icons
- ShadCN UI

---

## Backend

- FastAPI
- Python
- JWT Authentication
- Pydantic
- Uvicorn
- CORS Middleware

---

## Database

- MongoDB Atlas

Stores:

- User Accounts
- User Preferences
- Event Planner Data
- Recommendation History
- Fashion Profile

---

## Authentication

- JWT Access Tokens
- Secure Login
- Secure Registration
- Protected Routes

---

## AI & Recommendation Layer

FashionOS leverages AI-powered recommendation techniques including:

- Semantic Fashion Search
- Personalized Recommendation Logic
- Event-aware Outfit Generation
- Budget Optimization
- Fashion Similarity Matching

---

# 🛠️ Technical Stack

| Layer | Technologies |
|---------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas |
| Authentication | JWT |
| API Client | Axios |
| Routing | TanStack Router |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| UI Components | ShadCN UI |

---

# 🚀 System Workflow

```text
User Login
      │
      ▼
Dashboard
      │
      ▼
Fashion Capture / Event Planner
      │
      ▼
AI Recommendation Engine
      │
      ▼
Personalized Outfit Suggestions
      │
      ▼
History & Saved Recommendations
```

---

# 📂 Project Structure

```
FashionOS
│
├── frontend
│   ├── components
│   ├── routes
│   ├── lib
│   ├── assets
│   └── styles
│
├── backend
│   ├── api
│   ├── database
│   ├── schemas
│   ├── utils
│   └── main.py
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Python 3.11+
- Node.js
- npm
- MongoDB Atlas

---

## Backend Setup

```bash
cd backend

python -m venv fashion-os

source fashion-os/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 📡 API Endpoints

## Authentication

```
POST /api/auth/register

POST /api/auth/login
```

---

## Profile

```
GET /profile

PUT /profile
```

---

## Event Planner

```
POST /event-planner

GET /event-planner
```

---

## Fashion Capture

```
POST /capture

POST /visual-search
```

---

# 🎯 Impact

## Personalized Shopping

- AI understands user identity
- Personalized recommendations
- Context-aware fashion discovery

---

## Faster Decision Making

- Complete outfit generation
- Event-specific recommendations
- Budget optimization

---

## Better User Engagement

- Fashion history
- Saved outfits
- Personalized profiles
- AI styling assistance

---

## Smarter Fashion Experience

- Reduced search effort
- Intelligent recommendations
- Improved shopping confidence
- Enhanced fashion discovery

---

# 👩‍💻 Team

### Achanta Sravanthi

### Gunna Chandini

---

# 🙏 Acknowledgements

Developed as part of **Myntra HackerRamp WeForShe 2026**.

---

# 📄 License

This project was developed exclusively for **Myntra HackerRamp WeForShe 2026**.

© 2026 FashionOS. All Rights Reserved.
