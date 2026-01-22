import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Platform } from 'react-native';
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
  Chip,
  Menu,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { appointmentService, clientService, userService } from '../services/apiService';

const appointmentSchema = Yup.object().shape({
  clientId: Yup.number().required('Client is required'),
  careWorkerId: Yup.number().required('Care worker is required'),
  appointmentDate: Yup.date().required('Date is required'),
  appointmentTime: Yup.string().required('Time is required'),
  duration: Yup.number()
    .required('Duration is required')
    .min(15, 'Minimum 15 minutes')
    .max(480, 'Maximum 8 hours'),
  status: Yup.string().required('Status is required'),
  notes: Yup.string(),
});

const statuses = [
  { value: 'SCHEDULED', label: 'Scheduled', color: '#2196F3' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#FF9800' },
  { value: 'COMPLETED', label: 'Completed', color: '#4CAF50' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#F44336' },
];

const AppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [careWorkers, setCareWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [clientMenuVisible, setClientMenuVisible] = useState(false);
  const [workerMenuVisible, setWorkerMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, clientsRes, workersRes] = await Promise.all([
        appointmentService.getAll(),
        clientService.getAll(),
        userService.getHealthcareWorkers(),
      ]);
      setAppointments(appointmentsRes.data);
      setClients(clientsRes.data);
      setCareWorkers(workersRes.data);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to load data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setModalVisible(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.delete(appointmentId);
      setSnackbar({
        visible: true,
        message: 'Appointment deleted successfully',
      });
      loadData();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Failed to delete appointment',
      });
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate instanceof Date 
          ? values.appointmentDate.toISOString().split('T')[0]
          : values.appointmentDate,
      };

      if (selectedAppointment) {
        await appointmentService.update(selectedAppointment.id, appointmentData);
        setSnackbar({
          visible: true,
          message: 'Appointment updated successfully',
        });
      } else {
        await appointmentService.create(appointmentData);
        setSnackbar({
          visible: true,
          message: 'Appointment created successfully',
        });
      }
      resetForm();
      setModalVisible(false);
      loadData();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: error.response?.data?.message || 'Failed to save appointment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    return statuses.find(s => s.value === status)?.color || '#757575';
  };

  const getClientName = (clientId) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown';
  };

  const getWorkerName = (workerId) => {
    const worker = careWorkers.find(w => w.id === workerId);
    return worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown';
  };

  const renderAppointment = ({ item }) => {
    const statusInfo = statuses.find(s => s.value === item.status);
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardContent}>
              <Title>{getClientName(item.clientId)}</Title>
              <Paragraph>
                <IconButton icon="account" size={16} style={styles.inlineIcon} />
                {getWorkerName(item.careWorkerId)}
              </Paragraph>
              <Paragraph>
                <IconButton icon="calendar" size={16} style={styles.inlineIcon} />
                {format(new Date(item.appointmentDate), 'MMM dd, yyyy')} at {item.appointmentTime}
              </Paragraph>
              <Paragraph>
                <IconButton icon="clock-outline" size={16} style={styles.inlineIcon} />
                {item.duration} minutes
              </Paragraph>
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: statusInfo?.color }]}
                textStyle={{ color: statusInfo?.color }}
              >
                {statusInfo?.label}
              </Chip>
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEditAppointment(item)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteAppointment(item.id)}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

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
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph>No appointments found. Schedule your first appointment!</Paragraph>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddAppointment}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>
              {selectedAppointment ? 'Edit Appointment' : 'Create Appointment'}
            </Title>
            
            <Formik
              initialValues={{
                clientId: selectedAppointment?.clientId || '',
                careWorkerId: selectedAppointment?.careWorkerId || '',
                appointmentDate: selectedAppointment?.appointmentDate 
                  ? new Date(selectedAppointment.appointmentDate).toISOString().split('T')[0]
                  : '',
                appointmentTime: selectedAppointment?.appointmentTime || '',
                duration: selectedAppointment?.duration?.toString() || '60',
                status: selectedAppointment?.status || 'SCHEDULED',
                notes: selectedAppointment?.notes || '',
              }}
              validationSchema={appointmentSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
                <View>
                  <Menu
                    visible={clientMenuVisible}
                    onDismiss={() => setClientMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Client"
                        value={getClientName(values.clientId)}
                        mode="outlined"
                        style={styles.input}
                        editable={false}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setClientMenuVisible(true)} />}
                        onPressIn={() => setClientMenuVisible(true)}
                        error={touched.clientId && errors.clientId}
                      />
                    }
                  >
                    {clients.map(client => (
                      <Menu.Item
                        key={client.id}
                        onPress={() => {
                          setFieldValue('clientId', client.id);
                          setClientMenuVisible(false);
                        }}
                        title={client.name}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={touched.clientId && errors.clientId}>
                    {errors.clientId}
                  </HelperText>

                  <Menu
                    visible={workerMenuVisible}
                    onDismiss={() => setWorkerMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Care Worker"
                        value={getWorkerName(values.careWorkerId)}
                        mode="outlined"
                        style={styles.input}
                        editable={false}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setWorkerMenuVisible(true)} />}
                        onPressIn={() => setWorkerMenuVisible(true)}
                        error={touched.careWorkerId && errors.careWorkerId}
                      />
                    }
                  >
                    {careWorkers.map(worker => (
                      <Menu.Item
                        key={worker.id}
                        onPress={() => {
                          setFieldValue('careWorkerId', worker.id);
                          setWorkerMenuVisible(false);
                        }}
                        title={`${worker.firstName} ${worker.lastName}`}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={touched.careWorkerId && errors.careWorkerId}>
                    {errors.careWorkerId}
                  </HelperText>

                  <TextInput
                    label="Date (YYYY-MM-DD)"
                    value={values.appointmentDate}
                    onChangeText={handleChange('appointmentDate')}
                    onBlur={handleBlur('appointmentDate')}
                    error={touched.appointmentDate && errors.appointmentDate}
                    mode="outlined"
                    style={styles.input}
                    placeholder="2024-01-22"
                  />
                  <HelperText type="error" visible={touched.appointmentDate && errors.appointmentDate}>
                    {errors.appointmentDate}
                  </HelperText>

                  <TextInput
                    label="Time (HH:MM)"
                    value={values.appointmentTime}
                    onChangeText={handleChange('appointmentTime')}
                    onBlur={handleBlur('appointmentTime')}
                    error={touched.appointmentTime && errors.appointmentTime}
                    mode="outlined"
                    style={styles.input}
                    placeholder="14:30"
                  />
                  <HelperText type="error" visible={touched.appointmentTime && errors.appointmentTime}>
                    {errors.appointmentTime}
                  </HelperText>

                  <TextInput
                    label="Duration (minutes)"
                    value={values.duration}
                    onChangeText={handleChange('duration')}
                    onBlur={handleBlur('duration')}
                    error={touched.duration && errors.duration}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                  />
                  <HelperText type="error" visible={touched.duration && errors.duration}>
                    {errors.duration}
                  </HelperText>

                  <Menu
                    visible={statusMenuVisible}
                    onDismiss={() => setStatusMenuVisible(false)}
                    anchor={
                      <TextInput
                        label="Status"
                        value={statuses.find(s => s.value === values.status)?.label || ''}
                        mode="outlined"
                        style={styles.input}
                        editable={false}
                        right={<TextInput.Icon icon="chevron-down" onPress={() => setStatusMenuVisible(true)} />}
                        onPressIn={() => setStatusMenuVisible(true)}
                        error={touched.status && errors.status}
                      />
                    }
                  >
                    {statuses.map(status => (
                      <Menu.Item
                        key={status.value}
                        onPress={() => {
                          setFieldValue('status', status.value);
                          setStatusMenuVisible(false);
                        }}
                        title={status.label}
                      />
                    ))}
                  </Menu>
                  <HelperText type="error" visible={touched.status && errors.status}>
                    {errors.status}
                  </HelperText>

                  <TextInput
                    label="Notes (Optional)"
                    value={values.notes}
                    onChangeText={handleChange('notes')}
                    onBlur={handleBlur('notes')}
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
                      {selectedAppointment ? 'Update' : 'Create'}
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
          </ScrollView>
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
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
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
    maxHeight: '90%',
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

export default AppointmentsScreen;
