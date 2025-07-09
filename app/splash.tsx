import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { sessionService } from '@/services/sessionService';
import { storageService } from '@/services/storageService';

export default function SplashScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setStatus('Checking for existing sessions...');
      
      // Check if there's an active session
      const activeSessionId = await sessionService.getActiveSessionId();
      
      if (activeSessionId) {
        setStatus('Loading active session...');
        console.log('🔄 Found active session:', activeSessionId);
        
        // Try to load the active session
        const success = await sessionService.loadSession(activeSessionId);
        if (success) {
          console.log('✅ Active session loaded, navigating to main app');
          router.replace('/(tabs)/');
          return;
        } else {
          console.log('❌ Failed to load active session, clearing it');
          // Clear the invalid active session ID
          await sessionService.setActiveSessionId('');
        }
      }

      setStatus('Checking for existing data...');
      
      // Check if there's existing data to migrate
      const migratedSessionId = await sessionService.migrateExistingData();
      
      if (migratedSessionId) {
        setStatus('Migrating existing data...');
        console.log('📦 Migrated data to session, loading it');
        
        // Load the migrated session
        await sessionService.loadSession(migratedSessionId);
        router.replace('/(tabs)/');
        return;
      }

      setStatus('Checking for demo session...');
      
      // Check if demo session is hidden
      const hiddenDemoSessionId = await storageService.getHiddenDemoSessionId();
      const demoSessionId = sessionService.getDemoSessionId();
      
      if (!hiddenDemoSessionId || hiddenDemoSessionId !== demoSessionId) {
        setStatus('Loading demo session...');
        console.log('📚 Loading demo session');
        
        // Load the demo session
        await sessionService.loadSession(demoSessionId);
        router.replace('/(tabs)/');
        return;
      }
      
      setStatus('No active sessions found...');
      
      // No active session and no data to migrate, go to sessions screen
      console.log('ℹ️ No sessions found, navigating to sessions screen');
      router.replace('/sessions');
      
    } catch (error) {
      console.error('Error initializing app:', error);
      setStatus('Error occurred, redirecting...');
      
      // On error, go to sessions screen
      setTimeout(() => {
        router.replace('/sessions');
      }, 2000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logoText, { color: colors.primaryText }]}>🏁</Text>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Track Buddy</Text>
        <Text style={[styles.title, { color: colors.text }]}>Track Buddy</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Professional Weather Intelligence</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.status, { color: colors.textSecondary }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  status: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
  },
});