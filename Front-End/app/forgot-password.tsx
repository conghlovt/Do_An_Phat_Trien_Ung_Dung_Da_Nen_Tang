import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPassword, resetPassword } from '../src/modules/auth/api/auth.api';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=3140&auto=format&fit=crop';

const platformShadow = (boxShadow: string, nativeShadow: object) =>
  Platform.OS === 'web' ? ({ boxShadow } as any) : nativeShadow;

const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(6, 'Code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Forgot, 2: Reset
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '', code: '', newPassword: '' },
  });

  const onForgotSubmit = async (data: ForgotFormData) => {
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      resetForm.setValue('email', data.email);
      setStep(2);
      Alert.alert('Success', 'Reset code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setError('');
    setIsLoading(true);
    try {
      await resetPassword(data);
      Alert.alert('Success', 'Password has been reset successfully.');
      router.replace('/login' as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.container} blurRadius={2}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.card}>
          <Text style={styles.title}>{step === 1 ? 'Forgot Password' : 'Reset Password'}</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your email to receive a reset code'
              : 'Enter the code sent to your email and your new password'}
          </Text>

          {error ? <Text style={styles.errorTextCenter}>{error}</Text> : null}

          {step === 1 ? (
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <Controller
                  control={forgotForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, forgotForm.formState.errors.email && styles.inputError]}
                      placeholder="Enter your email"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  )}
                />
                {forgotForm.formState.errors.email && (
                  <Text style={styles.errorText}>{forgotForm.formState.errors.email.message}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={forgotForm.handleSubmit(onForgotSubmit)}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Code</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <Controller
                  control={resetForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.inputDisabled]}
                      placeholder="Email"
                      value={value}
                      editable={false}
                    />
                  )}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Reset Code</Text>
                <Controller
                  control={resetForm.control}
                  name="code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, resetForm.formState.errors.code && styles.inputError]}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="number-pad"
                    />
                  )}
                />
                {resetForm.formState.errors.code && (
                  <Text style={styles.errorText}>{resetForm.formState.errors.code.message}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <Controller
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, resetForm.formState.errors.newPassword && styles.inputError]}
                      placeholder="Enter new password"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                    />
                  )}
                />
                {resetForm.formState.errors.newPassword && (
                  <Text style={styles.errorText}>{resetForm.formState.errors.newPassword.message}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={resetForm.handleSubmit(onResetSubmit)}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => router.replace('/login' as any)}>
            <Text style={{ color: '#008080', fontSize: 14, fontWeight: '600' }}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 30, 60, 0.65)' },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...platformShadow('0 8px 16px rgba(0, 0, 0, 0.12)', {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    }),
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#002B49', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  inputDisabled: { backgroundColor: '#E4E8F0', color: '#999' },
  inputError: { borderColor: '#E53E3E' },
  errorText: { color: '#E53E3E', fontSize: 11, marginTop: 3 },
  errorTextCenter: { color: '#E53E3E', fontSize: 13, textAlign: 'center', paddingBottom: 12 },
  button: {
    backgroundColor: '#008080',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});
