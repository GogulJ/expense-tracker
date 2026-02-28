# 📊 Personal Tracker

A comprehensive personal management application combining **Finance Tracking** and **Habit Tracking** in one seamless experience. Built with React and Firebase, Personal Tracker helps you manage your money and build better habits all in one place.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.7.0-FFCA28?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 💰 Finance Tracker
- **Dashboard Analytics**
  - Real-time overview of income and expenses
  - Visual charts for spending patterns (pie charts, bar charts)
  - Monthly and weekly expense analysis
  - Category-wise expense breakdown
  - Summary cards for total income, expenses, and savings

- **Expense Management**
  - Add, edit, and delete expenses
  - Categorize expenses (Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other)
  - Quick-add preset amounts for faster data entry
  - Date-based expense tracking
  - Custom categories support

- **Income Tracking**
  - Track multiple income sources
  - Categorized income types (Salary, Freelance, Business, Investment, Gift, Other)
  - Monthly income overview
  - Quick-add functionality

### 🎯 Habit Tracker
- **Habit Management**
  - Create and track daily habits
  - Predefined habit templates (Workout, Reading, Coding, Meditation, etc.)
  - Custom habit creation
  - Daily check-ins with visual indicators
  - Streak tracking with fire indicators 🔥

- **Analytics Dashboard**
  - Completion rate visualization
  - Weekly progress charts
  - Habit performance trends
  - Heatmap calendar view

- **Event Calendar**
  - Visual calendar interface
  - Track habit completions by date
  - Event management integration
  - Month and week views

- **Goals & Notes**
  - Set and track personal goals with target durations
  - Progress tracking for each goal
  - Note-taking functionality
  - Integrated with habit tracking

- **Notifications & Reminders**
  - Browser notifications for habit reminders
  - Customizable reminder times
  - Permission-based notification system

### 🎨 UI/UX Features
- **Dark/Light Theme** - Toggle between dark and light modes
- **App Switcher** - Seamlessly switch between Finance and Habit tracking modes
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Modern UI** - Clean, intuitive interface with smooth animations
- **User Authentication** - Secure login with Firebase Authentication
- **Data Persistence** - All data synced with Firebase Firestore in real-time

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19.2** | Frontend framework |
| **Vite 7.2** | Build tool and dev server |
| **Firebase 12.7** | Authentication & Database (Firestore) |
| **Chart.js 4.5** | Data visualization and charts |
| **React Router 7.11** | Navigation and routing |
| **React Icons 5.5** | Icon library |
| **date-fns 4.1** | Date manipulation and formatting |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- A **Firebase account** with a project set up

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/gogulj/expense-tracker.git
cd expense-tracker
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Firebase Configuration

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** (Email/Password provider)
4. Create a **Firestore Database** (in production mode or test mode)

#### Get Firebase Credentials
1. In your Firebase project, go to **Project Settings** (⚙️ icon)
2. Scroll down to **Your apps** section
3. Click on **Web app** icon (`</>`)
4. Copy your Firebase configuration

#### Configure Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

> **⚠️ Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

#### Firestore Database Structure
The app automatically creates the following collections:
- `transactions` - Stores income and expense records
- `habits` - Stores habit data and completion records
- `goals` - Stores user goals
- `notes` - Stores user notes
- `events` - Stores calendar events
- `userPreferences` - Stores custom categories and sources

### 4️⃣ Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5️⃣ Build for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

### 6️⃣ Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
expense-tracker/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and static files
│   ├── components/        # Reusable React components
│   │   ├── layout/        # Layout components (FinanceLayout, HabitLayout)
│   │   ├── AppSwitcher.jsx
│   │   ├── EventCalendar.jsx
│   │   ├── Goals.jsx
│   │   └── Notes.jsx
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx           # Authentication state
│   │   ├── TransactionContext.jsx    # Finance data management
│   │   ├── HabitContext.jsx          # Habit tracking state
│   │   ├── EventContext.jsx          # Calendar events
│   │   ├── ThemeContext.jsx          # Dark/Light mode
│   │   ├── AppModeContext.jsx        # App mode switching
│   │   └── NotesContext.jsx          # Notes management
│   ├── pages/             # Page components
│   │   ├── DashboardPage.jsx         # Finance dashboard
│   │   ├── ExpensesPage.jsx          # Expense management
│   │   ├── IncomePage.jsx            # Income tracking
│   │   ├── HabitsPage.jsx            # Habit tracking
│   │   ├── HabitAnalyticsPage.jsx    # Habit analytics
│   │   ├── HabitCalendarPage.jsx     # Calendar view
│   │   └── LoginPage.jsx             # Authentication
│   ├── services/          # External services
│   │   └── firebase.js                # Firebase configuration
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables (not in repo)
├── .gitignore            # Git ignore rules
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
└── vite.config.js        # Vite configuration
```

---

## 🎯 Usage Guide

### First Time Setup
1. **Sign Up**: Create an account using email and password
2. **Choose Your Mode**: Switch between Finance and Habit tracking using the app switcher
3. **Customize**: Add your own expense categories and income sources

### Finance Tracking
1. Navigate to **Dashboard** to view your financial overview
2. Click **Add Expense** to record new expenses
3. Use **Quick Add** buttons for common amounts
4. Track **Income** from the Income page
5. View visual analytics on the dashboard

### Habit Tracking
1. Go to **Habits** page to create new habits
2. Check off habits daily to build streaks
3. View **Analytics** for progress insights
4. Use **Calendar** view to see completion history
5. Set **Goals** with target durations
6. Enable **Notifications** for reminders

### Theme Customization
- Click the theme toggle icon to switch between dark and light modes
- Theme preference is saved automatically

---

## 🌐 Deployment

### Deploy to GitHub Pages

The project is configured for GitHub Pages deployment:

```bash
npm run deploy
```

This will:
1. Build the production version
2. Deploy to the `gh-pages` branch
3. Make your app available at `https://gogulj.github.io/expense-tracker`

> **Note:** Update the `homepage` field in `package.json` with your GitHub username if you fork this repo.

### Deploy to Other Platforms

#### Vercel
```bash
npx vercel --prod
```

#### Netlify
```bash
npm run build
# Then drag the dist folder to Netlify
```

---

## 🔐 Security Notes

- **Never commit** your `.env` file or Firebase credentials
- Enable **Firebase Security Rules** for your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /transactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /habits/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /goals/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /notes/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /events/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Firebase](https://firebase.google.com/)
- Charts by [Chart.js](https://www.chartjs.org/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ by GogulJ**
