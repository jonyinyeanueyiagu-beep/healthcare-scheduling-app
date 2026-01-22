import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isScheduler = user?.role === 'SCHEDULER';

  const cards = [
    {
      title: 'Clients',
      description: 'Manage client information and care requirements',
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      action: () => navigate('/clients'),
      color: '#1976d2',
    },
    {
      title: 'Appointments',
      description: 'Schedule and manage healthcare visits',
      icon: <EventIcon sx={{ fontSize: 60 }} />,
      action: () => navigate('/appointments'),
      color: '#2e7d32',
    },
  ];

  if (isScheduler) {
    cards.push(
      {
        title: 'Users',
        description: 'Manage healthcare workers and schedulers',
        icon: <PersonAddIcon sx={{ fontSize: 60 }} />,
        action: () => navigate('/users'),
        color: '#ed6c02',
      },
      {
        title: 'Notifications',
        description: 'Send voice call reminders to clients',
        icon: <PhoneIcon sx={{ fontSize: 60 }} />,
        action: () => navigate('/appointments'),
        color: '#9c27b0',
      }
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName || user?.username}!
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Role: {user?.role === 'SCHEDULER' ? 'Scheduler' : 'Healthcare Worker'}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h5" component="h2" align="center" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography align="center" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={card.action}
                    sx={{ backgroundColor: card.color }}
                  >
                    Go to {card.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}

export default DashboardPage;
