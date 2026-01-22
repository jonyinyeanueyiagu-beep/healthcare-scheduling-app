import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isScheduler = user?.role === 'SCHEDULER';

  const cards = [
    {
      title: 'Clients',
      description: 'View and manage client information',
      icon: 'account-group',
      color: '#2196F3',
      screen: 'Clients',
    },
    {
      title: 'Appointments',
      description: 'Schedule and manage appointments',
      icon: 'calendar-clock',
      color: '#4CAF50',
      screen: 'Appointments',
    },
  ];

  if (isScheduler) {
    cards.push({
      title: 'Users',
      description: 'Manage healthcare workers and staff',
      icon: 'account-multiple',
      color: '#FF9800',
      screen: 'Users',
    });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.welcomeText}>Welcome, {user?.firstName || user?.username}!</Title>
        <Paragraph style={styles.subtitle}>
          {isScheduler ? 'Scheduler Dashboard' : 'Healthcare Worker Dashboard'}
        </Paragraph>
      </View>

      <View style={styles.userInfo}>
        <Card style={styles.userCard}>
          <Card.Content style={styles.userCardContent}>
            <Avatar.Text size={60} label={user?.firstName?.[0] || 'U'} style={styles.avatar} />
            <View style={styles.userDetails}>
              <Title>{user?.firstName} {user?.lastName}</Title>
              <Paragraph>{user?.email}</Paragraph>
              <Paragraph>{user?.phoneNumber}</Paragraph>
              <Paragraph style={styles.role}>
                {user?.role === 'SCHEDULER' ? 'Scheduler' : 'Healthcare Worker'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Avatar.Icon
                  size={48}
                  icon={card.icon}
                  style={[styles.cardIcon, { backgroundColor: card.color }]}
                />
                <View style={styles.cardTextContainer}>
                  <Title style={styles.cardTitle}>{card.title}</Title>
                  <Paragraph style={styles.cardDescription}>{card.description}</Paragraph>
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate(card.screen)}
                style={[styles.cardButton, { backgroundColor: card.color }]}
              >
                Open
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  userInfo: {
    padding: 16,
  },
  userCard: {
    elevation: 2,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6200EE',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  role: {
    marginTop: 4,
    fontWeight: '600',
    color: '#6200EE',
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardButton: {
    marginLeft: 'auto',
  },
});

export default DashboardScreen;
