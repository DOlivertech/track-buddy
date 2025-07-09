import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Mic, Square, Play, Pause, Trash2, Save } from 'lucide-react-native';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string, duration: number) => void;
  onRecordingCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onRecordingCancel }: VoiceRecorderProps) {
  const { colors } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setRecordingUri(url);
          setDuration(recordingTime);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        // Store mediaRecorder reference for stopping
        (window as any).currentMediaRecorder = mediaRecorder;
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Could not start recording. Please check microphone permissions.');
      }
    } else {
      Alert.alert('Not Supported', 'Voice recording is currently only supported on web browsers.');
    }
  };

  const stopRecording = () => {
    if (Platform.OS === 'web' && (window as any).currentMediaRecorder) {
      (window as any).currentMediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    if (Platform.OS === 'web') {
      try {
        const audio = new Audio(recordingUri);
        audio.onended = () => setIsPlaying(false);
        
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          await audio.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing recording:', error);
        Alert.alert('Error', 'Could not play recording.');
      }
    }
  };

  const saveRecording = () => {
    if (recordingUri) {
      onRecordingComplete(recordingUri, duration);
    }
  };

  const deleteRecording = () => {
    setRecordingUri(null);
    setDuration(0);
    setRecordingTime(0);
    if (Platform.OS === 'web' && recordingUri) {
      URL.revokeObjectURL(recordingUri);
    }
  };

  const cancelRecording = () => {
    deleteRecording();
    onRecordingCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Mic size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Voice Note</Text>
        </View>
        <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!recordingUri ? (
          <View style={styles.recordingSection}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                { backgroundColor: isRecording ? colors.error : colors.primary },
                isRecording && styles.recordingActive
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={Platform.OS !== 'web'}
            >
              {isRecording ? (
                <Square size={32} color={colors.primaryText} fill={colors.primaryText} />
              ) : (
                <Mic size={32} color={colors.primaryText} />
              )}
            </TouchableOpacity>
            
            <Text style={[styles.recordingStatus, { color: colors.text }]}>
              {isRecording ? 'Recording...' : 'Tap to start recording'}
            </Text>
            
            {isRecording && (
              <Text style={[styles.timer, { color: colors.primary }]}>
                {formatTime(recordingTime)}
              </Text>
            )}
            
            {Platform.OS !== 'web' && (
              <Text style={[styles.webOnlyNote, { color: colors.textTertiary }]}>
                Voice recording is only available on web browsers
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.playbackSection}>
            <View style={styles.waveformContainer}>
              <View style={[styles.waveform, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.durationText, { color: colors.text }]}>
                  Voice note • {formatTime(duration)}
                </Text>
              </View>
            </View>

            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: colors.primary }]}
                onPress={playRecording}
              >
                {isPlaying ? (
                  <Pause size={24} color={colors.primaryText} />
                ) : (
                  <Play size={24} color={colors.primaryText} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={deleteRecording}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.success }]}
              onPress={saveRecording}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Voice Note</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
  },
  recordingSection: {
    alignItems: 'center',
    gap: 16,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingActive: {
    transform: [{ scale: 1.1 }],
  },
  recordingStatus: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  timer: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  webOnlyNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
  },
  playbackSection: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  waveformContainer: {
    width: '100%',
  },
  waveform: {
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
});