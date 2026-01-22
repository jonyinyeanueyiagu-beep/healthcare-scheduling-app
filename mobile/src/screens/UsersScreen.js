import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Snackbar,
  IconButton,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { userService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const UsersScreen = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    if (currentUser?.role === 'SCHEDULER') {
      loadUsers();
    } else {
      setSnackbar({
        visible: true,
        message: 'Access denied. Scheduler role required.',
      });
      setLoading(false);
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userService.delete(userId);
      setSnackbar({
        visible: true,
        message: 'User deleted successfully',
      });
      loadUsers();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to delete user',
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SCHEDULER':
        return '#FF9800';
      case 'HEALTHCARE_WORKER':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SCHEDULER':
        return 'Scheduler';
      case 'HEALTHCARE_WORKER':
        return 'Healthcare Worker';
      default:
        return role;
    }
  };

  const renderUser = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Title>{item.username}</Title>
            <Paragraph>
              <IconButton icon="account" size={16} style={styles.inlineIcon} />
              {item.firstName} {item.lastName}
            </Paragraph>
            <Paragraph>
              <IconButton icon="email" size={16} style={styles.inlineIcon} />
              {item.email}
            </Paragraph>
            {item.phoneNumber && (
              <Paragraph>
                <IconButton icon="phone" size={16} style={styles.inlineIcon} />
                {item.phoneNumber}
              </Paragraph>
            )}
            <Chip
              mode="outlined"
              style={[styles.roleChip, { borderColor: getRoleColor(item.role) }]}
              textStyle={{ color: getRoleColor(item.role) }}
            >
              {getRoleLabel(item.role)}
            </Chip>
          </View>
          {currentUser?.id !== item.id && (
            <View style={styles.actions}>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteUser(item.id)}
              />
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (currentUser?.role !== 'SCHEDULER') {
    return (
      <View style={styles.emptyContainer}>
        <Paragraph>Access denied. Scheduler role required.</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph>No users found.</Paragraph>
          </View>
        }
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  inlineIcon: {
    margin: 0,
    padding: 0,
  },
  roleChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default UsersScreen;
