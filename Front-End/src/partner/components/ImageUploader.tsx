import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploaderProps {
  onUpload: (files: any[]) => Promise<void>;
  isUploading?: boolean;
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isUploading = false, multiple = true }) => {
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Cần quyền truy cập thư viện ảnh để upload!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'] as any, // Allow both for partner media
      allowsMultipleSelection: multiple,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      // Prepare files for multipart/form-data
      const filesToUpload = result.assets.map((asset) => {
        if (Platform.OS === 'web') {
          // On web, Expo ImagePicker provides a File object in asset.file or we can fetch the blob from the uri
          // Need to fetch Blob from uri for standard form-data
          return asset.uri; 
        } else {
          return {
            uri: asset.uri,
            name: asset.fileName || asset.uri.split('/').pop() || 'media.jpg',
            type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
          };
        }
      });
      
      if (Platform.OS === 'web') {
         // Convert URIs to Blobs/Files
         const fetchPromises = filesToUpload.map(async (uri) => {
            const response = await fetch(uri as string);
            const blob = await response.blob();
            // Determine type from blob
            const ext = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `media-${Date.now()}.${ext}`, { type: blob.type });
            return file;
         });
         const files = await Promise.all(fetchPromises);
         await onUpload(files);
      } else {
         await onUpload(filesToUpload);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.uploadArea} 
        onPress={handlePickImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#008080" />
            <Text style={styles.uploadText}>Đang tải lên...</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadTitle}>Nhấn để chọn hình ảnh / video</Text>
            <Text style={styles.uploadSubtitle}>Hỗ trợ JPG, PNG, MP4</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  center: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  uploadText: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '600',
    marginTop: 8,
  },
});
