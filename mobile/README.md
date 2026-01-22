# Healthcare Scheduler - Mobile App

React Native mobile application (Expo) for the Healthcare Scheduling Application.

## Features

- 📱 Native mobile experience (iOS & Android)
- 🔐 User authentication
- 📊 Dashboard with feature cards
- 👥 Client management
- 📅 Appointment scheduling
- 👤 User management (Scheduler role)
- 🎨 React Native Paper UI
- ⚡ Bottom tab navigation
- 💾 AsyncStorage for offline token

## Prerequisites

- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Backend API accessible from your device/emulator
- iOS Simulator (Mac) or Android Emulator

## Installation

```bash
cd mobile
npm install
```

## Configuration

Update `app.json` to point to your backend API:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:8080/api"
    }
  }
}
```

**Important:** Replace `YOUR_IP` with:
- Your computer's local IP (e.g., `192.168.1.100`) for physical devices
- `10.0.2.2` for Android Emulator
- `localhost` for iOS Simulator

## Running the Application

```bash
# Start Expo dev server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run in web browser
npm run web
```

Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

## Project Structure

```
mobile/
├── src/
│   ├── components/
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── navigation/
│   │   └── MainNavigator.js    # Tab navigation
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ClientsScreen.js
│   │   ├── AppointmentsScreen.js
│   │   └── UsersScreen.js
│   ├── services/
│   │   ├── api.js
│   │   └── apiService.js
│   └── utils/
├── App.js
├── app.json
└── package.json
```

## Screens

### Login/Register
- Secure authentication with validation
- Role selection during registration
- Error handling with Snackbar

### Dashboard
- Welcome message with user info
- Navigation cards to features
- Role-based UI (Scheduler vs Healthcare Worker)

### Clients
- Scrollable list of all clients
- Floating Action Button (FAB) to add new
- Modal dialogs for create/edit
- Swipeable actions for quick access

### Appointments
- List view with date/time formatting
- Status indicators with color chips
- Create/edit with dropdown pickers
- Client and care worker selection

### Users (Scheduler Only)
- View all registered users
- Display username, email, and role
- User management capabilities

## Navigation

Bottom tab navigation with icons:
- 🏠 Dashboard
- 👥 Clients
- 📅 Appointments
- 👤 Users (Scheduler only)
- ⚙️ Profile/Logout

## Authentication Flow

1. App loads → Check AsyncStorage for token
2. If token exists → Navigate to Main (authenticated)
3. If no token → Show Login screen
4. After login → Store token in AsyncStorage
5. All API calls include token in Authorization header

## API Configuration

The app uses the same REST API as the web frontend:
- Base URL configured in `app.json`
- Axios interceptors handle authentication
- Automatic token injection in requests
- 401 errors trigger logout

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### App Store/Play Store
Follow [Expo's publishing guide](https://docs.expo.dev/distribution/introduction/)

## Troubleshooting

**Cannot connect to API:**
- Check your device is on same network as backend
- Use your computer's local IP, not `localhost`
- Ensure backend CORS allows your mobile app origin
- Try `http://10.0.2.2:8080/api` for Android Emulator

**App crashes on startup:**
- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**AsyncStorage errors:**
- Make sure `@react-native-async-storage/async-storage` is installed
- For Expo, it should work out of the box

**Network request failed:**
- Check backend is running
- Verify API URL in `app.json`
- Check device network connectivity
- For iOS Simulator, `localhost` should work
- For Android Emulator, use `10.0.2.2` instead of `localhost`

## Development Tips

- Use React Native Debugger for debugging
- Enable hot reload for faster development
- Test on both iOS and Android simulators
- Use Expo Go app for testing on physical devices

## Platform-Specific Notes

### iOS
- Requires macOS with Xcode for building
- Simulator works with `localhost`
- Push notifications require Apple Developer account

### Android
- Works on Windows, Mac, Linux
- Emulator needs `10.0.2.2` for localhost
- Easier to test without developer account
