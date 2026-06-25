import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, StatusBar,
  ScrollView, SafeAreaView
} from 'react-native';
import * as Location from 'expo-location';
const API = 'https://emp-management-api-4icz.onrender.com';
export default function App() {
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [token, setToken] = useState('');
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/employee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setEmployee(data.employee);
        setToken(data.token);
        setScreen('dashboard');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };
  const handleCheckIn = async () => {
    setCheckLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required for attendance');
        setCheckLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const res = await fetch(`${API}/api/attendance/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          employeeId: employee._id,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success ✅', 'Check-in successful! Attendance recorded.');
      } else {
        Alert.alert('Failed ❌', data.message || 'Check-in failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setCheckLoading(false);
    }
  };
  const handleCheckOut = async () => {
    setCheckLoading(true);
    try {
      const res = await fetch(`${API}/api/attendance/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ employeeId: employee._id })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success ✅', 'Check-out successful!');
      } else {
        Alert.alert('Failed ❌', data.message || 'Check-out failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setCheckLoading(false);
    }
  };
  const handleLogout = () => {
    setEmployee(null);
    setToken('');
    setEmail('');
    setPassword('');
    setScreen('login');
  };
  if (screen === 'login') return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <View style={styles.header}>
        <Text style={styles.logo}>AICT</Text>
        <Text style={styles.subtitle}>Employee Management System</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.title}>Employee Login</Text>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <View style={styles.header}>
        <Text style={styles.logo}>AICT</Text>
        <Text style={styles.subtitle}>Employee Dashboard</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.form}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {employee?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.empName}>{employee?.name}</Text>
              <Text style={styles.empDesig}>{employee?.designation}</Text>
            </View>
          </View>
          {/* Attendance Buttons */}
          <View style={styles.attendanceSection}>
            <Text style={styles.sectionTitle}>📅 Today's Attendance</Text>
            <View style={styles.attendanceButtons}>
              <TouchableOpacity
                style={[styles.checkInBtn, checkLoading && styles.buttonDisabled]}
                onPress={handleCheckIn}
                disabled={checkLoading}
              >
                {checkLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.checkBtnText}>✅ Check In</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkOutBtn, checkLoading && styles.buttonDisabled]}
                onPress={handleCheckOut}
                disabled={checkLoading}
              >
                {checkLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.checkBtnText}>🚪 Check Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {/* Profile Info */}
          <Text style={styles.sectionTitle}>👤 My Profile</Text>
          <View style={styles.infoGrid}>
            {[
              { label: 'Employee ID', value: employee?.employeeId },
              { label: 'Department', value: employee?.department },
              { label: 'Email', value: employee?.email },
              { label: 'Phone', value: employee?.phone },
              { label: 'Basic Salary', value: '₹' + Number(employee?.basicSalary).toLocaleString('en-IN') },
              { label: 'Joining Date', value: new Date(employee?.joiningDate).toLocaleDateString('en-IN') },
            ].map(({ label, value }) => (
              <View key={label} style={styles.infoCard}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 40,
    alignItems: 'center',
    paddingBottom: 30,
  },
  logo: { fontSize: 36, fontWeight: '800', color: 'white', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  form: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#93c5fd' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: '#1d4ed8' },
  empName: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  empDesig: { fontSize: 14, color: '#64748b', marginTop: 2 },
  attendanceSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  attendanceButtons: { flexDirection: 'row', gap: 12 },
  checkInBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  checkOutBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  checkBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  infoCard: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  logoutBtn: {
    backgroundColor: '#fff1f2',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  logoutText: { color: '#e11d48', fontWeight: '700', fontSize: 15 },
});
