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
# 🧠 AI Pipeline

Our Fashion Intelligence system follows a multi-stage AI pipeline that combines computer vision, natural language understanding, semantic search, and intelligent ranking to provide personalized fashion recommendations.

```text
                 User Uploads Outfit Image
                           │
                           ▼
                  Florence-2 Vision Model
                           │
                           ▼
          Generates Detailed Outfit Description
                           │
                           ▼
                     Intent Parser
                           │
                           ▼
         Extracts Structured Fashion Attributes
      (Category, Color, Style, Pattern, Occasion,
             Season, Fabric, Accessories)
                           │
                           ▼
                  CLIP Embedding Model
                           │
                           ▼
        Converts Text & Products into Embeddings
                           │
                           ▼
                 Semantic Retrieval Engine
                           │
                           ▼
        Fuzzy Matching & Query Refinement
                           │
                           ▼
          Recommendation & Ranking Engine
                           │
                           ▼
        Personalized Fashion Recommendations
```

---

## 👁️ Florence-2 Vision Model

The first stage of our pipeline uses **Florence-2**, Microsoft's Vision-Language Foundation Model, to understand the uploaded outfit image. Instead of simply detecting objects, Florence-2 analyzes the complete fashion context and generates a rich natural language description of the outfit.

### Florence-2 extracts:
- Clothing categories (Shirt, Dress, Jeans, Jacket, etc.)
- Colors
- Patterns and textures
- Fabric appearance
- Style (Casual, Formal, Streetwear, Ethnic, etc.)
- Accessories
- Layering information
- Overall fashion context

**Example**

**Input Image**

> Blue oversized denim jacket, white t-shirt, black cargo pants, and white sneakers.

**Florence-2 Output**

> "A casual streetwear outfit consisting of a blue oversized denim jacket layered over a white t-shirt, paired with black cargo pants and white sneakers."

This description serves as the input for the downstream recommendation pipeline.

---

## 📝 Intent Parser

The natural language description generated by Florence-2 is processed by our **Intent Parser**, which converts unstructured text into structured fashion attributes.

### Example

**Input**

```
Blue oversized denim jacket with black cargo pants
```

**Extracted Attributes**

| Attribute | Value |
|-----------|--------|
| Category | Jacket, Cargo Pants |
| Color | Blue, Black |
| Style | Streetwear |
| Fit | Oversized |
| Occasion | Casual |
| Season | Winter |

This structured representation makes the recommendation process more accurate than traditional keyword-based searches.

---

## 🔍 CLIP Embeddings

To understand the semantic relationship between user outfits and products, we use **CLIP (Contrastive Language–Image Pretraining)**.

CLIP maps both text descriptions and product information into the same embedding space, allowing the system to compare them based on meaning rather than exact words.

For example, CLIP understands that:

- Denim Jacket ≈ Jean Jacket
- Sneakers ≈ Trainers
- Hoodie ≈ Hooded Sweatshirt

This enables intelligent recommendations even when the wording differs.

---

## 🔎 Semantic Retrieval

After generating embeddings, the system performs **Semantic Retrieval** over the fashion catalog.

Instead of relying on exact keyword matching, semantic retrieval searches for products with similar meaning, style, and visual characteristics.

This improves recommendation quality by retrieving products that are contextually relevant rather than only textually similar.

---

## 🔤 Fuzzy Matching

To improve robustness, the retrieval pipeline applies **Fuzzy Matching**, allowing the system to handle spelling mistakes, abbreviations, and naming inconsistencies.

### Examples

| User Input | Matched Product |
|------------|-----------------|
| blu jaket | Blue Jacket |
| denm jeans | Denim Jeans |
| hoodie | Hooded Sweatshirt |

Fuzzy matching ensures that users still receive relevant recommendations even if the query contains typing errors or alternate terminology.

---

## 🎯 Recommendation Engine

The final recommendation engine combines information from every stage of the pipeline and ranks products using multiple signals, including:

- Visual similarity
- Semantic similarity
- Clothing category
- Color compatibility
- Fashion style
- Occasion suitability
- Seasonal relevance
- Fuzzy matching confidence

The highest-ranked products are presented to the user as personalized outfit recommendations.

---

## ✅ Why This AI Pipeline?

Our hybrid AI architecture combines the strengths of multiple intelligent models and retrieval techniques:

- **Florence-2** understands outfit images and generates rich natural language descriptions.
- **Intent Parser** converts descriptions into structured fashion attributes.
- **CLIP** enables semantic understanding between text and fashion products.
- **Semantic Retrieval** searches products based on contextual meaning instead of exact keywords.
- **Fuzzy Matching** handles spelling mistakes and naming variations for robust search.
- **Recommendation Engine** intelligently ranks products using multiple relevance signals.

Together, these components create a scalable, context-aware, and highly personalized fashion recommendation system capable of understanding both visual appearance and user intent.
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
http://localhost:8080
```

---

# 📡 API Endpoints

## Authentication

```http
POST /api/auth/register
```

Registers a new user.

```http
POST /api/auth/login
```

Authenticates an existing user and returns a JWT access token.

---

## User Profile

```http
GET /profile
```

Fetches the authenticated user's profile and fashion preferences.

```http
PUT /profile
```

Updates user preferences, favorite brands, colors, styles, budget, fit, and gender.

---

## Fashion Capture

```http
POST /capture
```

Uploads fashion images/videos for AI analysis.

```http
POST /visual-search
```

Performs AI-powered fashion similarity search.

---

## Recommendations

```http
GET /recommendations
```

Returns personalized outfit recommendations based on user preferences.

```http
POST /recommendations/generate
```

Generates AI-powered outfit recommendations.

---

## Event Planner

```http
GET /event-planner
```

Retrieves all saved fashion events.

```http
POST /event-planner
```

Creates a new event and generates personalized outfit suggestions.

```http
PUT /event-planner/{event_id}
```

Updates an existing event.

```http
DELETE /event-planner/{event_id}
```

Deletes an event.

---

## History

```http
GET /history
```

Returns previously generated recommendations, captures, and outfit history.

```http
DELETE /history/{history_id}
```

Deletes a history record.

---

## Health Check

```http
GET /health
```

Checks if the API server is running.

```http
GET /health/database
```

Checks MongoDB database connectivity.

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
