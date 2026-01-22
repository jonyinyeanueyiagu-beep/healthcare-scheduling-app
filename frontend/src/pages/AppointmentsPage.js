import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { appointmentService, clientService, userService } from '../services/apiService';
import Layout from '../components/Layout';

const AppointmentSchema = Yup.object().shape({
  clientId: Yup.number().required('Client is required'),
  careWorkerId: Yup.number().required('Care worker is required'),
  appointmentTime: Yup.string().required('Appointment time is required'),
  duration: Yup.number().min(1, 'Duration must be at least 1 minute').required('Duration is required'),
  notes: Yup.string(),
});

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [careWorkers, setCareWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchData = useCallback(async () => {
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
      showSnackbar('Error fetching data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (appointment = null) => {
    setEditingAppointment(appointment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = {
        ...values,
        status: values.status || 'SCHEDULED',
      };
      
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, data);
        showSnackbar('Appointment updated successfully', 'success');
      } else {
        await appointmentService.create(data);
        showSnackbar('Appointment created successfully', 'success');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      showSnackbar('Error saving appointment: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.delete(id);
        showSnackbar('Appointment deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showSnackbar('Error deleting appointment: ' + error.message, 'error');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      showSnackbar('Status updated successfully', 'success');
      fetchData();
    } catch (error) {
      showSnackbar('Error updating status: ' + error.message, 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  };

  const getCareWorkerName = (workerId) => {
    const worker = careWorkers.find((w) => w.id === workerId);
    return worker ? worker.username : 'Unknown';
  };

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Appointments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Appointment
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Care Worker</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{getClientName(appointment.clientId)}</TableCell>
                    <TableCell>{getCareWorkerName(appointment.careWorkerId)}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.appointmentTime), 'PPp')}
                    </TableCell>
                    <TableCell>{appointment.duration}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>{appointment.notes || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(appointment)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
          </DialogTitle>
          <Formik
            initialValues={{
              clientId: editingAppointment?.clientId || '',
              careWorkerId: editingAppointment?.careWorkerId || '',
              appointmentTime: editingAppointment?.appointmentTime
                ? new Date(editingAppointment.appointmentTime).toISOString().slice(0, 16)
                : '',
              duration: editingAppointment?.duration || 60,
              status: editingAppointment?.status || 'SCHEDULED',
              notes: editingAppointment?.notes || '',
            }}
            validationSchema={AppointmentSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Field
                      as={TextField}
                      select
                      name="clientId"
                      label="Client"
                      fullWidth
                      error={touched.clientId && Boolean(errors.clientId)}
                      helperText={touched.clientId && errors.clientId}
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </MenuItem>
                      ))}
                    </Field>
                    <Field
                      as={TextField}
                      select
                      name="careWorkerId"
                      label="Care Worker"
                      fullWidth
                      error={touched.careWorkerId && Boolean(errors.careWorkerId)}
                      helperText={touched.careWorkerId && errors.careWorkerId}
                    >
                      {careWorkers.map((worker) => (
                        <MenuItem key={worker.id} value={worker.id}>
                          {worker.username}
                        </MenuItem>
                      ))}
                    </Field>
                    <Field
                      as={TextField}
                      name="appointmentTime"
                      label="Appointment Time"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={touched.appointmentTime && Boolean(errors.appointmentTime)}
                      helperText={touched.appointmentTime && errors.appointmentTime}
                    />
                    <Field
                      as={TextField}
                      name="duration"
                      label="Duration (minutes)"
                      type="number"
                      fullWidth
                      error={touched.duration && Boolean(errors.duration)}
                      helperText={touched.duration && errors.duration}
                    />
                    <Field
                      as={TextField}
                      select
                      name="status"
                      label="Status"
                      fullWidth
                      error={touched.status && Boolean(errors.status)}
                      helperText={touched.status && errors.status}
                    >
                      <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                      <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Field>
                    <Field
                      as={TextField}
                      name="notes"
                      label="Notes"
                      multiline
                      rows={3}
                      fullWidth
                      error={touched.notes && Boolean(errors.notes)}
                      helperText={touched.notes && errors.notes}
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {editingAppointment ? 'Update' : 'Create'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default AppointmentsPage;
