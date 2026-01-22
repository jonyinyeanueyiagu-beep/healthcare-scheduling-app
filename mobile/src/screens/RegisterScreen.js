import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Title, Snackbar, HelperText, Menu } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9-+() ]+$/, 'Invalid phone number'),
  role: Yup.string()
    .required('Role is required'),
});

const roles = [
  { value: 'HEALTHCARE_WORKER', label: 'Healthcare Worker' },
  { value: 'SCHEDULER', label: 'Scheduler' },
];

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' });
  const [roleMenuVisible, setRoleMenuVisible] = useState(false);

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const { confirmPassword, ...userData } = values;
      await register(userData);
      setSnackbar({
        visible: true,
        message: 'Registration successful! Please login.',
        type: 'success',
      });
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Title style={styles.title}>Create Account</Title>
          
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              firstName: '',
              lastName: '',
              phoneNumber: '',
              role: '',
            }}
            validationSchema={registerSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
              <View style={styles.form}>
                <TextInput
                  label="Username"
                  value={values.username}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  error={touched.username && errors.username}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                />
                <HelperText type="error" visible={touched.username && errors.username}>
                  {errors.username}
                </HelperText>

                <TextInput
                  label="Email"
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
                  label="First Name"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={touched.firstName && errors.firstName}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.firstName && errors.firstName}>
                  {errors.firstName}
                </HelperText>

                <TextInput
                  label="Last Name"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={touched.lastName && errors.lastName}
                  mode="outlined"
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.lastName && errors.lastName}>
                  {errors.lastName}
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

                <Menu
                  visible={roleMenuVisible}
                  onDismiss={() => setRoleMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Role"
                      value={roles.find(r => r.value === values.role)?.label || ''}
                      mode="outlined"
                      style={styles.input}
                      editable={false}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setRoleMenuVisible(true)} />}
                      onPressIn={() => setRoleMenuVisible(true)}
                      error={touched.role && errors.role}
                    />
                  }
                >
                  {roles.map(role => (
                    <Menu.Item
                      key={role.value}
                      onPress={() => {
                        setFieldValue('role', role.value);
                        setRoleMenuVisible(false);
                      }}
                      title={role.label}
                    />
                  ))}
                </Menu>
                <HelperText type="error" visible={touched.role && errors.role}>
                  {errors.role}
                </HelperText>

                <TextInput
                  label="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.password && errors.password}>
                  {errors.password}
                </HelperText>

                <TextInput
                  label="Confirm Password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && errors.confirmPassword}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                />
                <HelperText type="error" visible={touched.confirmPassword && errors.confirmPassword}>
                  {errors.confirmPassword}
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.button}
                >
                  Register
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.linkButton}
                >
                  Already have an account? Login
                </Button>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={snackbar.type === 'success' ? styles.successSnackbar : null}
      >
        {snackbar.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
});

export default RegisterScreen;
