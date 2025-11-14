 Flex Living Reviews Dashboard - Frontend

## Overview
This frontend is part of the **Flex Living Reviews Dashboard** project. It allows property managers and the public to interact with guest reviews:

- **Manager Dashboard**: Filter, approve, and reject reviews.
- **Property Page**: Displays approved reviews for each property.
- **Google Reviews (Exploration)**: Placeholder integration for Google Places API.

---

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Charts:** Chart.js for performance visualizations
- **HTTP Requests:** Fetch API
- **Environment Variables:** `.env` used in backend for API base URLs

---

## Features

### Manager Dashboard
- View reviews grouped by listing, type, channel, or date
- Approve or reject reviews
- Filter by rating, category, or date
- Visual charts to analyze trends

### Public Property Page
- Displays only approved reviews
- Shows property info: type, rating, submission date
- Placeholder Google Reviews integration
- Click on Published Reviews ON the dashboard page to see the approved reviews.

---

## Project Structure

frontend/
├─ index.html # Main dashboard page
├─ property.html # Property details page
├─ css/
│ └─ style.css # Styles for all index
| └─ property.css # Styles for property
├─ js/
│ ├─ script.js # Dashboard logic
│ └─ property.js # Property page logic
└─ assets/ # Images, logos, placeholders


 Clone the repository

git clone https://github.com/yourusername/flex-living-dashboard-frontend.git
cd flex-living-dashboard