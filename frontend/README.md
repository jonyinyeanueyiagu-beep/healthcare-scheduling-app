# Healthcare Scheduler - Web Frontend

React-based web frontend for the Healthcare Scheduling Application.

## Features

- 🔐 User authentication (Login/Register)
- 📊 Dashboard with navigation cards
- 👥 Client management (CRUD operations)
- 📅 Appointment scheduling
- 👤 User management (Scheduler role only)
- 🎨 Material-UI responsive design
- ✅ Form validation with Formik & Yup
- 🔄 React Query for data fetching

## Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:8080`

## Installation

```bash
cd frontend
npm install
```

## Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Running the Application

```bash
npm start
```

The app will open at http://localhost:3000

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout.js          # App layout with navigation
│   ├── contexts/
│   │   └── AuthContext.js     # Authentication context
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── DashboardPage.js
│   │   ├── ClientsPage.js
│   │   ├── AppointmentsPage.js
│   │   └── UsersPage.js
│   ├── services/
│   │   ├── api.js             # Axios instance
│   │   └── apiService.js      # API methods
│   ├── App.js
│   └── index.js
└── package.json
```

## Key Pages

### Dashboard
- Overview of available features
- Quick navigation to all sections
- Role-based card display

### Clients
- View all clients in a table
- Add new clients with validated forms
- Edit existing client information
- Delete clients with confirmation
- Filter active clients

### Appointments
- Schedule appointments with date/time picker
- Assign healthcare workers to clients
- Update appointment status
- View appointments by client or worker

### Users (Scheduler Only)
- View all registered users
- See user roles and information
- Delete users (except self)

## Authentication

The app uses JWT tokens stored in localStorage. All API requests include the token in the Authorization header.

### User Roles
- **SCHEDULER**: Full access to all features including user management
- **HEALTHCARE_WORKER**: Can view and manage appointments assigned to them

## API Integration

All API calls go through the centralized `apiService.js`:
- `authService` - Login, register, logout
- `clientService` - Client CRUD operations
- `appointmentService` - Appointment management
- `userService` - User management

## Troubleshooting

**CORS errors:**
- Ensure backend CORS is configured for `http://localhost:3000`
- Check `application.properties`: `cors.allowed-origins=http://localhost:3000`

**Connection refused:**
- Verify backend is running on port 8080
- Check API URL in environment variables

**Authentication issues:**
- Clear localStorage and login again
- Check JWT token hasn't expired (24h default)
