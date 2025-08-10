import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Camera, Upload, X, User } from 'lucide-react-native';

interface ImageUploaderProps {
  value?: string; // Current image URI
  onImageChange: (imageUri: string | undefined) => void;
  placeholder?: string;
  maxSizeBytes?: number;
}

export function ImageUploader({ 
  value, 
  onImageChange, 
  placeholder = "Add profile picture",
  maxSizeBytes = 5 * 1024 * 1024 // 5MB default
}: ImageUploaderProps) {
  const { colors } = useTheme();
  const [uploading, setUploading] = useState(false);

  const selectImage = async () => {
    if (Platform.OS === 'web') {
      // Web implementation using file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size
        if (file.size > maxSizeBytes) {
          const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
          Alert.alert(
            'File Too Large',
            `Please select an image smaller than ${maxSizeMB}MB. Selected file is ${Math.round(file.size / (1024 * 1024))}MB.`
          );
          return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          Alert.alert('Invalid File', 'Please select a valid image file.');
          return;
        }

        try {
          setUploading(true);
          
          // Convert to data URL for display
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onImageChange(dataUrl);
            setUploading(false);
          };
          reader.onerror = () => {
            Alert.alert('Error', 'Failed to read the selected image.');
            setUploading(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing image:', error);
          Alert.alert('Error', 'Failed to process the selected image.');
          setUploading(false);
        }
      };

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    } else {
      // Mobile implementation would use expo-image-picker
      Alert.alert(
        'Image Upload',
        'Image upload is currently only supported on web browsers. On mobile, you can use a web URL for your profile picture.',
        [{ text: 'OK' }]
      );
    }
  };

  const removeImage = () => {
    onImageChange(undefined);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {value ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: value }}
              style={[styles.profileImage, { borderColor: colors.border }]}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colors.error }]}
              onPress={removeImage}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.placeholderContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <User size={40} color={colors.textTertiary} />
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.primary }]}
          onPress={selectImage}
          disabled={uploading}
        >
          <Upload size={20} color={colors.primaryText} />
          <Text style={[styles.uploadButtonText, { color: colors.primaryText }]}>
            {uploading ? 'Processing...' : value ? 'Change Photo' : 'Upload Photo'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          {Platform.OS === 'web' 
            ? `Max size: ${formatFileSize(maxSizeBytes)}. Supports JPG, PNG, GIF.`
            : 'Image upload available on web browsers only.'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  placeholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controls: {
    alignItems: 'center',
    gap: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 250,
  },
});