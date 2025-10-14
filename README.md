# 💸 Daily Spend App

[▶️ Watch Demo on YouTube](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
[⬇️ Download APK](https://your-domain.com/path/to/your-app.apk)

A cross-platform expense tracking app built with Expo, React Native, and Firebase. Track your daily expenses, register securely with email authentication, and enjoy seamless navigation with deep linking support.

---

## ✨ Features

- 📊 **Dashboard**: Visualize and manage your daily spending.
- 🔒 **Email Authentication**: Register and sign in securely using your email.
- ✉️ **Email Verification**: Secure your account with email verification. Clicking the verification link in your email will automatically verify and log you in.
- 🔗 **Deep Linking**: Open the app directly from email links (e.g., `amdday01://verify?oobCode=...`).
- 🎨 **Modern UI**: Built with React Native, Expo Router, and Tailwind CSS for a beautiful and responsive design.

---

## 🚀 Getting Started

### 1. 🧑‍💻 Clone the Repository
```bash
git clone <your-repo-url>
cd Daily-Spend
```

### 2. 📦 Install Dependencies
```bash
npm install
```

### 3. 🔥 Set Up Firebase
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable Email/Password authentication.
- Download your `google-services.json` (Android) and/or `GoogleService-Info.plist` (iOS) and place them in the appropriate folders.
- Update your Firebase config in `firebase.ts`.

### 4. 🔗 Configure Deep Linking
- Make sure your Firebase email verification template uses links like:
  - `amdday01://verify?oobCode=...`
  - or `https://daily-spend.firebaseapp.com/verify?oobCode=...`
- The app will auto-navigate to the dashboard after verifying the email.

### 5. ▶️ Run the App
```bash
npx expo start
```
- Open in Expo Go, an emulator, or a device.

---

## 📂 Folder Structure
```
app/
  (auth)/
    EmailCodeVerificationScreen.tsx  # Handles email verification via deep link
    login.tsx
    register.tsx
    _layout.tsx
  (dashboard)/
    dashboard.tsx
    ...
components/
context/
services/
firebase.ts
linking.ts
```

---

## 🛠️ Tech Stack
- ⚛️ [Expo](https://expo.dev/)
- 📱 [React Native](https://reactnative.dev/)
- 🗺️ [Expo Router](https://expo.github.io/router/docs)
- 🔥 [Firebase Auth](https://firebase.google.com/docs/auth)
- 💨 [Tailwind CSS (NativeWind)](https://www.nativewind.dev/)

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE)
