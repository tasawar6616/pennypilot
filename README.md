# 💰 PennyPilot

**Track smart · Stay on budget**

A beautiful, modern expense tracking app built with React Native (Expo) and Firebase. Track your daily expenses, set budgets, and visualize your spending with interactive charts. Each user has their own secure, isolated data with Firebase Authentication.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## ✨ Features

### 🔐 Authentication
- **Email/Password authentication** with Firebase Auth
- **Secure user registration** with password validation (min 6 characters)
- **Beautiful login/register screens** with gradient UI
- **Auto-redirect** based on authentication state
- **User data isolation** - Each user's data is completely separate
- **Logout functionality** with confirmation dialog

### 🏠 Dashboard
- **Real-time spending overview** - See today's spending at a glance
- **Quick stats** - Track transactions, daily budget, and budget usage
- **Quick category buttons** - Fast expense entry with one tap
- **Recent transactions** - View your last 5 transactions with category icons
- **User-specific data** - All data scoped to authenticated user

### 📝 Transaction Management
- **Quick add** with amount presets (100, 500, 1000, 5000)
- **9 default categories** with beautiful icons and colors
  - 🍽️ Food | 🚗 Transport | 🛍️ Shopping | 💳 Bills
  - ⚕️ Health | 🎬 Entertainment | ✈️ Travel | 📚 Education | 📦 Misc
- **5 payment methods** - Cash, Bank, Card, UPI/EasyPaisa, Wallet
- **Optional notes** for each transaction
- **Delete transactions** with confirmation

### 📊 Reports & Analytics
- **Interactive pie chart** - Visualize top 5 spending categories
- **Time range filters** - View Day, Week, or Month data
- **Category breakdown** - Detailed spending by category with percentages
- **Budget progress tracking** - Visual progress bars for each category
- **Color-coded alerts**:
  - 🟢 Green: Safe (under 80%)
  - 🟡 Orange: Warning (80-100%)
  - 🔴 Red: Over budget!

### 💰 Budget Management
- **Monthly income** setup
- **Overall monthly budget** tracking
- **Category-specific budgets** - Set individual limits for each category
- **Real-time budget monitoring** with progress visualization

### ⚙️ Settings
- Configure monthly income and budget
- Set individual category budgets
- Customize reminder time (default: 2:00 AM)
- **User email display** and logout functionality
- All data synced with Firebase Firestore

---

## 🎨 Design

- **Modern gradient UI** - Beautiful purple-pink gradients throughout
- **Glass-morphism effects** - Frosted glass cards and buttons
- **Clean, minimalist design** - No clutter, just what you need
- **Smooth animations** - Delightful user experience
- **Category-based colors** - Visual distinction for spending categories
- **Responsive layout** - Works on all screen sizes

---

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Language**: TypeScript
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Firebase Firestore (offline-first, user-scoped)
- **Charts**: react-native-chart-kit
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API + AsyncStorage
- **Styling**: React Native StyleSheet with LinearGradient
- **Currency**: Pakistani Rupees (PKR)

---

## 📦 Installation & Setup

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

Quick start:
\`\`\`bash
git clone https://github.com/yourusername/pennypilot.git
cd pennypilot
npm install
# Configure Firebase in env/firebase.ts
npx expo start
\`\`\`

---

## 📚 Documentation

- [INSTALLATION.md](INSTALLATION.md) - Complete setup guide
- [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) - Authentication implementation
- [FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md) - Security rules
- [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.MD) - Product requirements
- [DESIGN_SUMMARY.md](DESIGN_SUMMARY.md) - Design system

---

## 🚀 Roadmap

- [x] User authentication (Email/Password)
- [x] User data isolation
- [x] Logout functionality
- [ ] Password reset
- [ ] Phone OTP/Google Sign-In
- [ ] Edit transactions
- [ ] Recurring expenses
- [ ] CSV export
- [ ] Dark mode
- [ ] Push notifications

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React Native, Expo & Firebase**

Track smart · Stay on budget 💰
