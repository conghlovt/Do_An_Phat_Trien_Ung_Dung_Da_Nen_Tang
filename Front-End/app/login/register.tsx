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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/login/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getApiErrorMessage } from '../../src/login/shared/api/api-error.util';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=3140&auto=format&fit=crop';

const platformShadow = (boxShadow: string, nativeShadow: object) =>
  Platform.OS === 'web' ? ({ boxShadow } as any) : nativeShadow;

const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.enum(['customer', 'partner']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '', role: 'customer' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError('');
    try {
      await register(data.email, data.password, data.username, data.role);
      router.replace('/login' as any);

    } catch (err) {
      setRegisterError(getApiErrorMessage(err, 'Không thể đăng ký. Vui lòng thử lại.'));
    }
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.container} blurRadius={2}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us today</Text>

            {registerError ? <Text style={styles.errorTextCenter}>{registerError}</Text> : null}

            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.username && styles.inputError]}
                    placeholder="Enter your username"
                    placeholderTextColor="#999"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
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
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                  />
                )}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
            </View>

            {/* Role */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Account Type</Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[styles.roleButton, value === 'customer' && styles.roleButtonActive]}
                      onPress={() => onChange('customer')}
                    >
                      <Text style={[styles.roleButtonText, value === 'customer' && styles.roleButtonTextActive]}>
                        Customer
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, value === 'partner' && styles.roleButtonActive]}
                      onPress={() => onChange('partner')}
                    >
                      <Text style={[styles.roleButtonText, value === 'partner' && styles.roleButtonTextActive]}>
                        Partner
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ color: '#666', fontSize: 14 }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login' as any)}>
                <Text style={{ color: '#008080', fontSize: 14, fontWeight: '600' }}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 30, 60, 0.65)' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  subtitle: { fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center' },
  inputContainer: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 5 },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E4E8F0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E8F0',
    paddingRight: 12,
  },
  passwordInput: { flex: 1, padding: 11, fontSize: 14, color: '#333' },
  showHideText: { color: '#008080', fontWeight: '600', fontSize: 12 },
  inputError: { borderColor: '#E53E3E' },
  errorText: { color: '#E53E3E', fontSize: 11, marginTop: 3 },
  errorTextCenter: { color: '#E53E3E', fontSize: 13, textAlign: 'center', paddingBottom: 10 },
  roleContainer: { flexDirection: 'row', gap: 10 },
  roleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E4E8F0',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  roleButtonActive: { borderColor: '#008080', backgroundColor: '#E6F7F7' },
  roleButtonText: { fontSize: 13, fontWeight: '600', color: '#999' },
  roleButtonTextActive: { color: '#008080' },
  registerButton: {
    backgroundColor: '#008080',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    ...platformShadow('0 3px 6px rgba(0, 128, 128, 0.25)', {
      shadowColor: '#008080',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
});
