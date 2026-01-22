import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  Snackbar,
  HelperText,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { clientService } from '../services/apiService';

const clientSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9-+() ]+$/, 'Invalid phone number'),
  address: Yup.string().required('Address is required'),
  email: Yup.string().email('Invalid email'),
  emergencyContact: Yup.string(),
  medicalInfo: Yup.string(),
});

const ClientsScreen = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getAll();
      setClients(response.data);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to load clients',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setModalVisible(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await clientService.delete(clientId);
      setSnackbar({
        visible: true,
        message: 'Client deleted successfully',
      });
      loadClients();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to delete client',
      });
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, values);
        setSnackbar({
          visible: true,
          message: 'Client updated successfully',
        });
      } else {
        await clientService.create(values);
        setSnackbar({
          visible: true,
          message: 'Client created successfully',
        });
      }
      resetForm();
      setModalVisible(false);
      loadClients();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: error.response?.data?.message || 'Failed to save client',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderClient = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardContent}>
            <Title>{item.name}</Title>
            <Paragraph>
              <IconButton icon="phone" size={16} style={styles.inlineIcon} />
              {item.phoneNumber}
            </Paragraph>
            <Paragraph>
              <IconButton icon="map-marker" size={16} style={styles.inlineIcon} />
              {item.address}
            </Paragraph>
            {item.email && (
              <Paragraph>
                <IconButton icon="email" size={16} style={styles.inlineIcon} />
                {item.email}
              </Paragraph>
            )}
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditClient(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteClient(item.id)}
            />
          </View>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph>No clients found. Add your first client!</Paragraph>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddClient}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>
            {selectedClient ? 'Edit Client' : 'Add Client'}
          </Title>
          
          <Formik
            initialValues={{
              name: selectedClient?.name || '',
              phoneNumber: selectedClient?.phoneNumber || '',
              address: selectedClient?.address || '',
              email: selectedClient?.email || '',
              emergencyContact: selectedClient?.emergencyContact || '',
              medicalInfo: selectedClient?.medicalInfo || '',
            }}
            validationSchema={clientSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View>
                <TextInput
                  label="Name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.name && errors.name}>
                  {errors.name}
                </HelperText>

                <TextInput
                  label="Phone Number"
                  value={values.phoneNumber}
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  error={touched.phoneNumber && errors.phoneNumber}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                <HelperText type="error" visible={touched.phoneNumber && errors.phoneNumber}>
                  {errors.phoneNumber}
                </HelperText>

                <TextInput
                  label="Address"
                  value={values.address}
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  error={touched.address && errors.address}
                  mode="outlined"
                  style={styles.input}
                  multiline
                />
                <HelperText type="error" visible={touched.address && errors.address}>
                  {errors.address}
                </HelperText>

                <TextInput
                  label="Email (Optional)"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <HelperText type="error" visible={touched.email && errors.email}>
                  {errors.email}
                </HelperText>

                <TextInput
                  label="Emergency Contact (Optional)"
                  value={values.emergencyContact}
                  onChangeText={handleChange('emergencyContact')}
                  onBlur={handleBlur('emergencyContact')}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Medical Info (Optional)"
                  value={values.medicalInfo}
                  onChangeText={handleChange('medicalInfo')}
                  onBlur={handleBlur('medicalInfo')}
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.buttonContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.button}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={styles.button}
                  >
                    {selectedClient ? 'Update' : 'Create'}
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </Modal>
      </Portal>

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
});

export default ClientsScreen;
