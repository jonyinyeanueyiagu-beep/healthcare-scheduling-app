# Healthcare Scheduler Mobile App - Screens Documentation

This directory contains all the React Native screens for the healthcare scheduling mobile application.

## 📱 Screens Overview

### Authentication Screens

#### 1. LoginScreen.js
User authentication screen with form validation.

**Features:**
- Username and password inputs with validation
- Formik form handling
- Yup validation (min 3 chars username, min 6 chars password)
- Integration with AuthContext and authService
- Error handling with Snackbar notifications
- Navigation to RegisterScreen
- Responsive KeyboardAvoidingView

**Usage:**
```javascript
import LoginScreen from './src/screens/LoginScreen';
```

#### 2. RegisterScreen.js
New user registration with comprehensive form.

**Features:**
- Complete user registration form with fields:
  - Username, Email, Password, Confirm Password
  - First Name, Last Name, Phone Number
  - Role selector (Healthcare Worker / Scheduler)
- Email and phone number format validation
- Password matching validation
- Success message with auto-navigation to Login
- ScrollView for better UX on smaller screens

### Main Application Screens

#### 3. DashboardScreen.js
Home screen showing user info and quick navigation.

**Features:**
- Personalized welcome message
- User profile card with avatar
- Quick access cards to:
  - Clients management
  - Appointments scheduling
  - Users management (scheduler only)
- Role-based UI (different views for scheduler vs healthcare worker)
- Material Design with color-coded cards

#### 4. ClientsScreen.js
Client management interface.

**Features:**
- FlatList displaying all clients
- Each client card shows: name, phone, address, email
- Floating Action Button (FAB) to add new clients
- Modal form for adding/editing clients
- Form fields:
  - Name* (required)
  - Phone Number* (required, validated)
  - Address* (required)
  - Email (optional, validated)
  - Emergency Contact (optional)
  - Medical Info (optional)
- Edit and delete actions
- Empty state message
- Loading spinner
- Success/error notifications

**API Integration:**
- `clientService.getAll()`
- `clientService.create(data)`
- `clientService.update(id, data)`
- `clientService.delete(id)`

#### 5. AppointmentsScreen.js
Appointment scheduling and management.

**Features:**
- FlatList displaying all appointments
- Each appointment card shows:
  - Client name
  - Care worker name
  - Date and time
  - Duration
  - Status with color-coded chip
- FAB to create new appointments
- Comprehensive scheduling form with:
  - Client selector (dropdown menu)
  - Care worker selector (dropdown menu)
  - Date input (YYYY-MM-DD)
  - Time input (HH:MM)
  - Duration in minutes (15-480 min validation)
  - Status selector (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Notes (optional)
- Date formatting with date-fns
- Edit and delete actions
- Status color coding

**API Integration:**
- `appointmentService.getAll()`
- `appointmentService.create(data)`
- `appointmentService.update(id, data)`
- `appointmentService.delete(id)`
- `clientService.getAll()` (for dropdown)
- `userService.getHealthcareWorkers()` (for dropdown)

#### 6. UsersScreen.js
User management interface (Scheduler role only).

**Features:**
- Access control (scheduler role required)
- FlatList displaying all users
- Each user card shows:
  - Username
  - Full name
  - Email
  - Phone number
  - Role with color-coded chip
- Delete action (cannot delete self)
- Role-based color coding:
  - Scheduler: Orange
  - Healthcare Worker: Blue
- Access denied message for non-schedulers

**API Integration:**
- `userService.getAll()`
- `userService.delete(id)`

## 🧭 Navigation

### MainNavigator.js
Bottom tab navigation with authentication flow.

**Structure:**
```
App
├── MainNavigator
│   ├── AuthStack (when not authenticated)
│   │   ├── LoginScreen
│   │   └── RegisterScreen
│   └── MainTabs (when authenticated)
│       ├── Dashboard
│       ├── Clients
│       ├── Appointments
│       ├── Users (Scheduler only)
│       └── Profile
```

**Features:**
- Bottom tab navigation with Material Community Icons
- Role-based tab visibility (Users tab only for schedulers)
- Conditional rendering based on authentication state
- Profile screen with user details and logout
- Loading state during auth check
- Theme color: #6200EE (purple)

**Tab Icons:**
- Dashboard: view-dashboard
- Clients: account-group
- Appointments: calendar-clock
- Users: account-multiple
- Profile: account-circle

## 🛠️ Technical Stack

### UI Components
- **react-native-paper** - Material Design components
  - TextInput, Button, Card, FAB, Modal, Snackbar, Chip, Menu
  - ActivityIndicator, IconButton, Title, Paragraph, Avatar

### Form Handling
- **Formik** - Form state management
- **Yup** - Schema validation

### Navigation
- **@react-navigation/native** - Core navigation
- **@react-navigation/native-stack** - Stack navigator
- **@react-navigation/bottom-tabs** - Tab navigator

### Utilities
- **date-fns** - Date formatting
- **@react-native-async-storage/async-storage** - Local storage

## 📋 Common Patterns

### Form Validation
All forms use Formik + Yup for consistent validation:
```javascript
const schema = Yup.object().shape({
  field: Yup.string().required('Field is required'),
});

<Formik
  initialValues={{ field: '' }}
  validationSchema={schema}
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</Formik>
```

### Error Handling
Consistent error handling with Snackbar:
```javascript
const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

try {
  // API call
} catch (error) {
  setSnackbar({
    visible: true,
    message: error.response?.data?.message || 'Operation failed',
  });
}
```

### Loading States
All screens with data fetching include loading states:
```javascript
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}
```

### Role-Based Access
Screens check user role for conditional rendering:
```javascript
const { user } = useAuth();
const isScheduler = user?.role === 'SCHEDULER';

{isScheduler && <SchedulerOnlyComponent />}
```

## 🎨 Styling

All screens follow consistent styling patterns:
- Background color: `#f5f5f5` (light gray)
- Card elevation: `2`
- Primary color: `#6200EE` (purple)
- Padding: `16px` or `20px`
- Responsive with KeyboardAvoidingView and ScrollView

## 🚀 Getting Started

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on platform:
```bash
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## 📝 Notes

- All screens integrate with existing API services in `src/services/apiService.js`
- Authentication state is managed by `AuthContext`
- All forms include proper validation and error handling
- Screens are responsive and work on different device sizes
- Material Design guidelines are followed throughout
- Role-based access control is implemented where needed

## 🔒 Security

- Passwords are never displayed in plain text
- Authentication tokens are stored securely in AsyncStorage
- Role-based access control prevents unauthorized actions
- API errors are caught and displayed to users appropriately

## 📱 Supported Platforms

- iOS
- Android
- Web (via Expo)

All screens are tested and optimized for all three platforms.
