import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal,
  Linking
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomAlert } from '@/components/CustomAlert';
import { DatePicker } from '@/components/DatePicker';
import { userService } from '@/services/userService';
import { storageService } from '@/services/storageService';
import { TrackNote } from '@/types/user';
import { UserSettings } from '@/types/weather';
import { racingTracks } from '@/data/racingTracks';
import { Plus, BookOpen, RefreshCcw, ChevronDown, ChevronRight, MapPin, Calendar, Clock, Trash2, CreditCard as Edit3, ExternalLink, Youtube, X } from 'lucide-react-native';

export default function NotesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { newEntry } = useLocalSearchParams();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [notes, setNotes] = useState<TrackNote[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<TrackNote | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sortBySession, setSortBySession] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    type: 'general' as TrackNote['type'],
    session: {
      type: 'practice' as 'practice' | 'qualifying' | 'race',
      number: 1,
      date: ''
    },
    youtubeLinks: [] as string[],
    newYoutubeLink: ''
  });

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      
      // Handle newEntry parameter
      if (newEntry === 'true') {
        openNoteModal();
        // Clear the parameter to prevent reopening on subsequent focus
        router.replace('/notes');
      }
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('📝 [Notes] Starting loadData...');
      const userSettings = await storageService.getSettings();
      console.log('📝 [Notes] Loaded settings:', userSettings);
      setSettings(userSettings);
      
      const trackNotes = await userService.getNotes();
      console.log('📝 [Notes] Loaded notes count:', trackNotes.length);
      console.log('📝 [Notes] Notes data:', trackNotes);
      // Sort by date descending (most recent first)
      trackNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotes(trackNotes);
      console.log('📝 [Notes] Set notes in state:', trackNotes.length);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const openNoteModal = (note?: TrackNote) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        title: note.title,
        content: note.content,
        type: note.type,
        session: note.session || {
          type: 'practice',
          number: 1,
          date: new Date().toISOString().split('T')[0]
        },
        youtubeLinks: note.youtubeLinks || [],
        newYoutubeLink: ''
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        title: '',
        content: '',
        type: 'general',
        session: {
          type: 'practice',
          number: 1,
          date: new Date().toISOString().split('T')[0]
        },
        youtubeLinks: [],
        newYoutubeLink: ''
      });
    }
    setModalVisible(true);
  };

  const closeNoteModal = () => {
    setModalVisible(false);
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      type: 'general',
      session: {
        type: 'practice',
        number: 1,
        date: ''
      },
      youtubeLinks: [],
      newYoutubeLink: ''
    });
  };

  const addYoutubeLink = () => {
    if (noteForm.newYoutubeLink.trim()) {
      setNoteForm({
        ...noteForm,
        youtubeLinks: [...noteForm.youtubeLinks, noteForm.newYoutubeLink.trim()],
        newYoutubeLink: ''
      });
    }
  };

  const removeYoutubeLink = (index: number) => {
    setNoteForm({
      ...noteForm,
      youtubeLinks: noteForm.youtubeLinks.filter((_, i) => i !== index)
    });
  };

  const openYoutubeLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening YouTube link:', error);
      showAlert('Error', 'Could not open YouTube link.', [{ text: 'OK' }]);
    }
  };

  const saveNote = async () => {
    if (!noteForm.title.trim() || !settings?.selectedTrack) return;

    try {
      const noteData = {
        trackId: settings.selectedTrack,
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        type: noteForm.type,
        session: noteForm.session.date ? noteForm.session : undefined,
        youtubeLinks: noteForm.youtubeLinks.length > 0 ? noteForm.youtubeLinks : undefined
      };

      if (editingNote) {
        await userService.updateNote(editingNote.id, noteData);
      } else {
        await userService.saveNote(noteData);
      }
      
      closeNoteModal();
      loadData();
    } catch (error) {
      console.error('Error saving note:', error);
      showAlert('Error', 'Failed to save note. Please try again.', [{ text: 'OK' }]);
    }
  };

  const deleteNote = async (noteId: string) => {
    showAlert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await userService.deleteNote(noteId);
              if (success) {
                setTimeout(async () => {
                  await loadData();
                }, 100);
              } else {
                showAlert('Error', 'Note not found or could not be deleted.', [{ text: 'OK' }]);
              }
            } catch (error) {
              console.error('Error deleting note:', error);
              showAlert('Error', 'Failed to delete note. Please try again.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  };

  const toggleSessionExpansion = (sessionKey: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionKey)) {
        newSet.delete(sessionKey);
      } else {
        newSet.add(sessionKey);
      }
      return newSet;
    });
  };

  const groupNotesBySession = (notes: TrackNote[]) => {
    const grouped: { [key: string]: { session: any; notes: TrackNote[] } } = {};
    
    notes.forEach(note => {
      let sessionKey;
      let sessionInfo;
      
      if (note.session) {
        sessionKey = `${note.session.date}-${note.session.type}-${note.session.number || 1}`;
        sessionInfo = note.session;
      } else {
        sessionKey = 'uncategorized';
        sessionInfo = null;
      }
      
      if (!grouped[sessionKey]) {
        grouped[sessionKey] = {
          session: sessionInfo,
          notes: []
        };
      }
      grouped[sessionKey].notes.push(note);
    });
    
    // Sort sessions by date (most recent first)
    return Object.entries(grouped).sort(([keyA, groupA], [keyB, groupB]) => {
      if (keyA === 'uncategorized') return 1;
      if (keyB === 'uncategorized') return -1;
      
      const dateA = groupA.session?.date || '1970-01-01';
      const dateB = groupB.session?.date || '1970-01-01';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: TrackNote['type']) => {
    switch (type) {
      case 'condition':
        return '#3B82F6';
      case 'driver':
        return '#16A34A';
      case 'setup':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading notes...</Text>
      </View>
    );
  }

  const selectedTrack = racingTracks.find(t => t.id === settings?.selectedTrack) || racingTracks[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Racing Notes</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{selectedTrack.name}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => openNoteModal()}
            >
              <Plus size={20} color={colors.primaryText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={handleRefresh}
            >
              <RefreshCcw size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sort Toggle */}
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              sortBySession && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSortBySession(!sortBySession)}
          >
            <Text style={[
              styles.sortButtonText,
              { color: colors.textSecondary },
              sortBySession && { color: colors.primaryText }
            ]}>
              {sortBySession ? 'Sort by Date' : 'Sort by Session'}
            </Text>
          </TouchableOpacity>
        </View>

        {notes.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <BookOpen size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notes Yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Start documenting your racing observations, track conditions, and driver feedback.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => openNoteModal()}
            >
              <Plus size={20} color={colors.primaryText} />
              <Text style={[styles.emptyButtonText, { color: colors.primaryText }]}>Add First Note</Text>
            </TouchableOpacity>
          </View>
        ) : sortBySession ? (
          groupNotesBySession(notes).map(([sessionKey, { session, notes: sessionNotes }]) => {
            const isSessionExpanded = expandedSessions.has(sessionKey);
            const isUncategorized = sessionKey === 'uncategorized';
            
            return (
              <View key={sessionKey} style={[styles.sessionGroup, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.sessionHeader}
                  onPress={() => toggleSessionExpansion(sessionKey)}
                >
                  <View style={styles.sessionHeaderLeft}>
                    {isSessionExpanded ? (
                      <ChevronDown size={20} color={colors.textSecondary} />
                    ) : (
                      <ChevronRight size={20} color={colors.textSecondary} />
                    )}
                    <Calendar size={20} color={colors.textSecondary} />
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionName, { color: colors.text }]}>
                        {isUncategorized 
                          ? 'Uncategorized Notes' 
                          : `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} ${session.number || ''}`
                        }
                      </Text>
                      {!isUncategorized && session && (
                        <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                          {formatDate(session.date)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.sessionNoteCount, { color: colors.textTertiary }]}>
                    {sessionNotes.length} note{sessionNotes.length === 1 ? '' : 's'}
                  </Text>
                </TouchableOpacity>
                
                {isSessionExpanded && (
                  <View style={styles.sessionContent}>
                    {sessionNotes.map((note) => (
                      <View key={note.id} style={[styles.noteCard, { backgroundColor: colors.surfaceSecondary }]}>
                        <View style={styles.noteHeader}>
                          <View style={styles.noteTitle}>
                            <View style={[styles.noteTypeIndicator, { backgroundColor: getTypeColor(note.type) }]} />
                            <View style={styles.noteTitleText}>
                              <Text style={[styles.noteCardTitle, { color: colors.text }]}>{String(note.title || 'Untitled Note')}</Text>
                              <View style={styles.noteDate}>
                                <Clock size={14} color={colors.textSecondary} />
                                <Text style={[styles.noteDateText, { color: colors.textSecondary }]}>
                                  {new Date(note.createdAt).toLocaleDateString()}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.noteActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => openNoteModal(note)}
                            >
                              <Edit3 size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => deleteNote(note.id)}
                            >
                              <Trash2 size={16} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {note.content && (
                          <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>
                            {String(note.content)}
                          </Text>
                        )}
                        {note.youtubeLinks && note.youtubeLinks.length > 0 && (
                          <View style={styles.youtubeLinks}>
                            <Text style={[styles.youtubeLinkTitle, { color: colors.text }]}>Reference Videos:</Text>
                            {note.youtubeLinks.map((link, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.youtubeLink}
                                onPress={() => openYoutubeLink(link)}
                              >
                                <Youtube size={16} color={colors.error} />
                                <Text style={[styles.youtubeLinkText, { color: colors.primary }]} numberOfLines={1}>
                                  {link}
                                </Text>
                                <ExternalLink size={14} color={colors.textTertiary} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          notes.map((note) => (
            <View key={note.id} style={[styles.noteCard, { backgroundColor: colors.surface }]}>
              <View style={styles.noteHeader}>
                <View style={styles.noteTitle}>
                  <View style={[styles.noteTypeIndicator, { backgroundColor: getTypeColor(note.type) }]} />
                  <View style={styles.noteTitleText}>
                    <Text style={[styles.noteCardTitle, { color: colors.text }]}>{String(note.title || 'Untitled Note')}</Text>
                    <View style={styles.noteDate}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={[styles.noteDateText, { color: colors.textSecondary }]}>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openNoteModal(note)}
                  >
                    <Edit3 size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteNote(note.id)}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {note.content && (
                <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>
                  {String(note.content)}
                </Text>
              )}
              {note.session && (
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionLabel, { color: colors.textTertiary }]}>
                    {note.session.type.charAt(0).toUpperCase() + note.session.type.slice(1)} {note.session.number || ''} • {formatDate(note.session.date)}
                  </Text>
                </View>
              )}
              {note.youtubeLinks && note.youtubeLinks.length > 0 && (
                <View style={styles.youtubeLinks}>
                  <Text style={[styles.youtubeLinkTitle, { color: colors.text }]}>Reference Videos:</Text>
                  {note.youtubeLinks.map((link, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.youtubeLink}
                      onPress={() => openYoutubeLink(link)}
                    >
                      <Youtube size={16} color={colors.error} />
                      <Text style={[styles.youtubeLinkText, { color: colors.primary }]} numberOfLines={1}>
                        {link}
                      </Text>
                      <ExternalLink size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeNoteModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeNoteModal}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity onPress={saveNote}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Note Title</Text>
              <TextInput
                style={[styles.titleInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Track conditions, Driver feedback..."
                placeholderTextColor={colors.textTertiary}
                value={noteForm.title}
                onChangeText={(title) => setNoteForm({ ...noteForm, title })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Note Type</Text>
              <View style={styles.typeButtons}>
                {(['general', 'condition', 'driver', 'setup'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      noteForm.type === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setNoteForm({ ...noteForm, type })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: colors.textSecondary },
                      noteForm.type === type && { color: colors.primaryText }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Session Information</Text>
              <View style={styles.sessionForm}>
                <View style={styles.sessionRow}>
                  <View style={styles.sessionColumn}>
                    <Text style={[styles.sessionFieldLabel, { color: colors.textSecondary }]}>Type</Text>
                    <View style={styles.sessionTypeButtons}>
                      {(['practice', 'qualifying', 'race'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.sessionTypeButton,
                            { backgroundColor: colors.surfaceSecondary },
                            noteForm.session.type === type && { backgroundColor: colors.primary }
                          ]}
                          onPress={() => setNoteForm({
                            ...noteForm,
                            session: { ...noteForm.session, type }
                          })}
                        >
                          <Text style={[
                            styles.sessionTypeText,
                            { color: colors.text },
                            noteForm.session.type === type && { color: colors.primaryText }
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.sessionNumberColumn}>
                    <Text style={[styles.sessionFieldLabel, { color: colors.textSecondary }]}>Number</Text>
                    <TextInput
                      style={[styles.sessionNumberInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="1"
                      placeholderTextColor={colors.textTertiary}
                      value={noteForm.session.number?.toString() || ''}
                      onChangeText={(number) => setNoteForm({
                        ...noteForm,
                        session: { ...noteForm.session, number: parseInt(number) || 1 }
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.sessionDateContainer}>
                  <Text style={[styles.sessionFieldLabel, { color: colors.textSecondary }]}>Date</Text>
                  <DatePicker
                    value={noteForm.session.date}
                    onDateChange={(date) => setNoteForm({
                      ...noteForm,
                      session: { ...noteForm.session, date }
                    })}
                    placeholder="Select session date"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>YouTube Reference Videos</Text>
              <View style={styles.youtubeSection}>
                <View style={styles.youtubeInputRow}>
                  <TextInput
                    style={[styles.youtubeInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="https://youtube.com/watch?v=..."
                    placeholderTextColor={colors.textTertiary}
                    value={noteForm.newYoutubeLink}
                    onChangeText={(newYoutubeLink) => setNoteForm({ ...noteForm, newYoutubeLink })}
                  />
                  <TouchableOpacity
                    style={[styles.addLinkButton, { backgroundColor: colors.primary }]}
                    onPress={addYoutubeLink}
                    disabled={!noteForm.newYoutubeLink.trim()}
                  >
                    <Plus size={16} color={colors.primaryText} />
                  </TouchableOpacity>
                </View>
                
                {noteForm.youtubeLinks.length > 0 && (
                  <View style={styles.youtubeLinksList}>
                    {noteForm.youtubeLinks.map((link, index) => (
                      <View key={index} style={[styles.youtubeLinkItem, { backgroundColor: colors.surfaceSecondary }]}>
                        <Youtube size={16} color={colors.error} />
                        <Text style={[styles.youtubeLinkItemText, { color: colors.text }]} numberOfLines={1}>
                          {link}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeLinkButton}
                          onPress={() => removeYoutubeLink(index)}
                        >
                          <X size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Note Content</Text>
              <TextInput
                style={[styles.contentInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Add your observations, feedback, or notes..."
                placeholderTextColor={colors.textTertiary}
                value={noteForm.content}
                onChangeText={(content) => setNoteForm({ ...noteForm, content })}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  sessionGroup: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sessionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  sessionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginTop: 2,
  },
  sessionNoteCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  sessionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  noteCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  noteTypeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  noteTitleText: {
    flex: 1,
  },
  noteCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  noteDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  noteDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  noteContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 8,
  },
  sessionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  youtubeLinks: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  youtubeLinkTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  youtubeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  youtubeLinkText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    flex: 1,
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
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  sessionForm: {
    gap: 16,
  },
  sessionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionColumn: {
    flex: 1,
  },
  sessionNumberColumn: {
    width: 80,
  },
  sessionFieldLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  sessionTypeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  sessionTypeButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sessionTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  sessionNumberInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  sessionDateContainer: {
    // No additional styles needed
  },
  youtubeSection: {
    gap: 12,
  },
  youtubeInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  youtubeInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  addLinkButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeLinksList: {
    gap: 8,
  },
  youtubeLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  youtubeLinkItemText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
  },
  removeLinkButton: {
    padding: 4,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    minHeight: 200,
  },
});