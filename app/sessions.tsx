import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { sessionService } from '@/services/sessionService';
import { storageService } from '@/services/storageService';
import { SessionMetadata } from '@/types/user';
import { Plus, Play, Trash2, Calendar, Clock, FileText, Users, Zap, CreditCard as Edit3, Upload, Eye, EyeOff } from 'lucide-react-native';

export default function SessionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [hiddenDemoSessionId, setHiddenDemoSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionMetadata | null>(null);
  const [newSessionForm, setNewSessionForm] = useState({
    name: '',
    description: '',
    emoji: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const [allSessions, hiddenDemoId] = await Promise.all([
        sessionService.getAllSessions(),
        storageService.getHiddenDemoSessionId()
      ]);
      
      // Sort by last accessed (most recent first)
      allSessions.sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
      setSessions(allSessions);
      setHiddenDemoSessionId(hiddenDemoId);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSession(null);
    setNewSessionForm({ name: '', description: '', emoji: '' });
    setModalVisible(true);
  };

  const openEditModal = (session: SessionMetadata) => {
    setEditingSession(session);
    setNewSessionForm({
      name: session.name,
      description: session.description || '',
      emoji: session.emoji || ''
    });
    setModalVisible(true);
  };

  const closeCreateModal = () => {
    setModalVisible(false);
    setEditingSession(null);
    setNewSessionForm({ name: '', description: '', emoji: '' });
  };

  const saveSession = async () => {
    if (!newSessionForm.name.trim()) {
      showAlert('Error', 'Please enter a session name.', [{ text: 'OK' }]);
      return;
    }

    try {
      if (editingSession) {
        // Update existing session
        const success = await sessionService.updateSession(editingSession.id, {
          name: newSessionForm.name,
          description: newSessionForm.description,
          emoji: newSessionForm.emoji
        });
        
        if (success) {
          closeCreateModal();
          await loadSessions();
        } else {
          showAlert('Error', 'Failed to update session.', [{ text: 'OK' }]);
        }
      } else {
        // Create new session
        const newSession = await sessionService.createSession(
          newSessionForm.name,
          newSessionForm.description,
          newSessionForm.emoji
        );
        
        closeCreateModal();
        
        // Load the new session
        const success = await sessionService.loadSession(newSession.id);
        if (success) {
          router.replace('/(tabs)/');
        } else {
          showAlert('Error', 'Failed to load the new session.', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
      showAlert('Error', 'Failed to save session. Please try again.', [{ text: 'OK' }]);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const success = await sessionService.loadSession(sessionId);
      if (success) {
        router.replace('/(tabs)/');
      } else {
        showAlert('Error', 'Failed to load session. It may be corrupted.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      showAlert('Error', 'Failed to load session.', [{ text: 'OK' }]);
    }
  };

  const deleteSession = async (session: SessionMetadata) => {
    if (sessionService.isDemoSession(session.id)) {
      showAlert('Cannot Delete', 'The demo session cannot be deleted. You can hide it instead.', [{ text: 'OK' }]);
      return;
    }

    showAlert(
      'Delete Session',
      `Are you sure you want to delete "${session.name}"? This will permanently delete all notes, setups, and settings in this session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await sessionService.deleteSession(session.id);
              if (success) {
                await loadSessions();
              } else {
                showAlert('Error', 'Failed to delete session.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting session:', error);
              showAlert('Error', 'Failed to delete session.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const toggleDemoSessionVisibility = async (session: SessionMetadata) => {
    try {
      if (hiddenDemoSessionId === session.id) {
        // Show demo session
        await storageService.setHiddenDemoSessionId(null);
        setHiddenDemoSessionId(null);
      } else {
        // Hide demo session
        await storageService.setHiddenDemoSessionId(session.id);
        setHiddenDemoSessionId(session.id);
      }
    } catch (error) {
      console.error('Error toggling demo session visibility:', error);
      showAlert('Error', 'Failed to update demo session visibility.', [{ text: 'OK' }]);
    }
  };

  const handleImportSession = () => {
    if (typeof document === 'undefined') {
      showAlert('Not Supported', 'File import is only available on web browsers.', [{ text: 'OK' }]);
      return;
    }

    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        
        // Validate the data structure
        if (!importedData.version || !importedData.exportedAt) {
          showAlert(
            'Invalid File',
            'The selected file does not appear to be a valid Track Buddy export.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Create session from imported data
        const newSession = await sessionService.createSessionFromImport(importedData);
        
        showAlert(
          'Import Successful',
          `Session "${newSession.name}" has been created from the imported data.`,
          [
            {
              text: 'Load Session',
              onPress: () => loadSession(newSession.id)
            },
            {
              text: 'Stay Here',
              style: 'cancel',
              onPress: () => loadSessions()
            }
          ]
        );
      } catch (error) {
        console.error('Error importing session:', error);
        showAlert(
          'Import Failed',
          'Failed to import the selected file. Please ensure it\'s a valid Track Buddy export file.',
          [{ text: 'OK' }]
        );
      }
    };

    // Trigger file selection
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Filter sessions based on demo session visibility
  const visibleSessions = sessions.filter(session => {
    if (sessionService.isDemoSession(session.id)) {
      return hiddenDemoSessionId !== session.id;
    }
    return true;
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.primaryText }]}>🏁</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Track Buddy</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your racing data contexts
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {visibleSessions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Users size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Sessions Available</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Create your first racing session to start tracking weather data, notes, and car setups.
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
                onPress={openCreateModal}
              >
                <Plus size={20} color={colors.primaryText} />
                <Text style={[styles.createFirstButtonText, { color: colors.primaryText }]}>
                  Create First Session
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.importFirstButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={handleImportSession}
              >
                <Upload size={20} color={colors.text} />
                <Text style={[styles.importFirstButtonText, { color: colors.text }]}>
                  Import Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={openCreateModal}
              >
                <Plus size={20} color={colors.primaryText} />
                <Text style={[styles.createButtonText, { color: colors.primaryText }]}>
                  New Session
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.importButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={handleImportSession}
              >
                <Upload size={20} color={colors.text} />
                <Text style={[styles.importButtonText, { color: colors.text }]}>
                  Import Session
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sessionsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Sessions ({visibleSessions.length})
              </Text>
              
              {visibleSessions.map((session) => (
                <View key={session.id} style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionTitleRow}>
                        {session.emoji && (
                          <Text style={styles.sessionEmoji}>{session.emoji}</Text>
                        )}
                        <Text style={[styles.sessionName, { color: colors.text }]}>{session.name}</Text>
                        {session.isDemo && (
                          <View style={[styles.demoBadge, { backgroundColor: colors.warning }]}>
                            <Text style={styles.demoBadgeText}>DEMO</Text>
                          </View>
                        )}
                      </View>
                      {session.description && (
                        <Text style={[styles.sessionDescription, { color: colors.textSecondary }]}>
                          {session.description}
                        </Text>
                      )}
                      <View style={styles.sessionMeta}>
                        <View style={styles.metaItem}>
                          <Calendar size={14} color={colors.textTertiary} />
                          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                            Created {formatDate(session.createdAt)}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Clock size={14} color={colors.textTertiary} />
                          <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                            Last used {formatDate(session.lastAccessedAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.sessionActions}>
                      {session.isDemo ? (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.hideButton, { backgroundColor: colors.surfaceSecondary }]}
                          onPress={() => toggleDemoSessionVisibility(session)}
                        >
                          <EyeOff size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton, { backgroundColor: colors.surfaceSecondary }]}
                          onPress={() => openEditModal(session)}
                        >
                          <Edit3 size={16} color={colors.text} />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.loadButton, { backgroundColor: colors.primary }]}
                        onPress={() => loadSession(session.id)}
                      >
                        <Play size={16} color={colors.primaryText} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton, { 
                          backgroundColor: session.isDemo ? colors.surfaceSecondary : colors.error,
                          opacity: session.isDemo ? 0.5 : 1
                        }]}
                        onPress={() => deleteSession(session)}
                        disabled={session.isDemo}
                      >
                        <Trash2 size={16} color={session.isDemo ? colors.textTertiary : "#FFFFFF"} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Show hidden demo session indicator */}
            {hiddenDemoSessionId && (
              <View style={styles.hiddenDemoContainer}>
                <TouchableOpacity
                  style={[styles.showDemoButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                  onPress={() => toggleDemoSessionVisibility({ id: hiddenDemoSessionId } as SessionMetadata)}
                >
                  <Eye size={16} color={colors.primary} />
                  <Text style={[styles.showDemoText, { color: colors.primary }]}>
                    Show Demo Session
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCreateModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeCreateModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingSession ? 'Edit Session' : 'New Session'}
            </Text>
            <TouchableOpacity onPress={saveSession}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>
                {editingSession ? 'Save' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalIntro}>
              <Zap size={32} color={colors.primary} />
              <Text style={[styles.modalIntroTitle, { color: colors.text }]}>
                {editingSession ? 'Edit Racing Session' : 'Create Racing Session'}
              </Text>
              <Text style={[styles.modalIntroText, { color: colors.textSecondary }]}>
                {editingSession 
                  ? 'Update your session details and visual identifier.'
                  : 'Sessions help you organize your racing data by context - different tracks, seasons, or racing series.'
                }
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Emoji (Optional)</Text>
              <TextInput
                style={[styles.emojiInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="🏁 Choose an emoji..."
                placeholderTextColor={colors.textTertiary}
                value={newSessionForm.emoji}
                onChangeText={(emoji) => setNewSessionForm({ ...newSessionForm, emoji })}
                maxLength={2}
              />
              <Text style={[styles.emojiHint, { color: colors.textTertiary }]}>
                Add an emoji to easily identify this session
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Session Name</Text>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., 2024 F1 Season, Silverstone Practice..."
                placeholderTextColor={colors.textTertiary}
                value={newSessionForm.name}
                onChangeText={(name) => setNewSessionForm({ ...newSessionForm, name })}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.descriptionInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Add details about this racing session..."
                placeholderTextColor={colors.textTertiary}
                value={newSessionForm.description}
                onChangeText={(description) => setNewSessionForm({ ...newSessionForm, description })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <FileText size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Each session maintains its own notes, car setups, settings, and favorite tracks independently.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
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
  },
  content: {
    flex: 1,
  },
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyActions: {
    gap: 12,
    width: '100%',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  importFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  importFirstButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  importButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  sessionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 16,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
    marginRight: 16,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sessionEmoji: {
    fontSize: 18,
  },
  sessionName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    flex: 1,
  },
  demoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sessionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 12,
  },
  sessionMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    // backgroundColor set dynamically
  },
  hideButton: {
    // backgroundColor set dynamically
  },
  loadButton: {
    // backgroundColor set dynamically
  },
  deleteButton: {
    // backgroundColor set dynamically
  },
  hiddenDemoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  showDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  showDemoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  modalSave: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalIntro: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIntroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  modalIntroText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  emojiInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  emojiHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    minHeight: 80,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    flex: 1,
  },
});