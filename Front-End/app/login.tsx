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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/modules/auth/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getApiErrorMessage } from '../src/modules/core/api/api-error.util';

const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=3140&auto=format&fit=crop';

const platformShadow = (boxShadow: string, nativeShadow: object) =>
  Platform.OS === 'web' ? ({ boxShadow } as any) : nativeShadow;

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError('');
    try {
      await login(data.email, data.password);
      router.replace('/dashboard' as any);


    } catch (err) {
      setLoginError(getApiErrorMessage(err, 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.'));
    }
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.container} blurRadius={2}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {loginError ? <Text style={styles.errorTextCenter}>{loginError}</Text> : null}

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

          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/forgot-password' as any)}>
            <Text style={styles.forgotPasswordText}>Forget Password?</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#666', fontSize: 14 }}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text style={{ color: '#008080', fontSize: 14, fontWeight: '600' }}>Register</Text>
            </TouchableOpacity>
          </View>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E8F0',
    paddingRight: 12,
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 14, color: '#333' },
  showHideText: { color: '#008080', fontWeight: '600', fontSize: 12 },
  inputError: { borderColor: '#E53E3E' },
  errorText: { color: '#E53E3E', fontSize: 11, marginTop: 3 },
  errorTextCenter: { color: '#E53E3E', fontSize: 13, textAlign: 'center', paddingBottom: 12 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotPasswordText: { color: '#008080', fontSize: 12, fontWeight: '600' },
  loginButton: {
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
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 },
});
