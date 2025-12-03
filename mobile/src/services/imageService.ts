import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import api from './api';

export interface ImageUploadResult {
  success: boolean;
  key?: string;
  url?: string;
  publicUrl?: string;
  error?: string;
}

export type UploadFolder = 'checklists' | 'machines' | 'profiles' | 'issues' | 'documents';

class ImageService {
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  async pickImageFromCamera(options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    return ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
      ...options,
    });
  }

  async pickImageFromGallery(options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    return ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
      ...options,
    });
  }

  async pickMultipleImages(limit: number = 5): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    return ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: limit,
      quality: 0.8,
      base64: true,
    });
  }

  async uploadImage(
    uri: string,
    folder: UploadFolder,
    base64?: string
  ): Promise<ImageUploadResult> {
    try {
      // If base64 is provided, use base64 upload
      if (base64) {
        const response = await api.post('/uploads/base64', {
          folder,
          base64,
          mimeType: this.getMimeType(uri),
        });
        return {
          success: true,
          ...response.data,
        };
      }

      // Otherwise, read the file and convert to base64
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File not found');
      }

      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await api.post('/uploads/base64', {
        folder,
        base64: base64Data,
        mimeType: this.getMimeType(uri),
      });

      return {
        success: true,
        ...response.data,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  async uploadMultipleImages(
    images: Array<{ uri: string; base64?: string }>,
    folder: UploadFolder
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];

    for (const image of images) {
      const result = await this.uploadImage(image.uri, folder, image.base64);
      results.push(result);
    }

    return results;
  }

  async captureAndUploadIssuePhoto(folder: UploadFolder = 'issues'): Promise<ImageUploadResult | null> {
    try {
      const result = await this.pickImageFromCamera({
        allowsEditing: false, // Don't crop for issue photos
        quality: 0.9, // Higher quality for issue documentation
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const asset = result.assets[0];
      return this.uploadImage(asset.uri, folder, asset.base64);
    } catch (error: any) {
      console.error('Capture and upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to capture photo',
      };
    }
  }

  private getMimeType(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      heic: 'image/heic',
    };
    return mimeTypes[extension || ''] || 'image/jpeg';
  }

  getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      // Use Image component to get dimensions
      const Image = require('react-native').Image;
      Image.getSize(
        uri,
        (width: number, height: number) => resolve({ width, height }),
        (error: Error) => reject(error)
      );
    });
  }

  async compressImage(uri: string, quality: number = 0.7): Promise<string> {
    // For now, return the same URI - compression is handled by ImagePicker
    // In future, could use image-manipulator for more control
    return uri;
  }
}

export const imageService = new ImageService();

// React hook for image operations
export function useImagePicker() {
  const takePhoto = async (folder: UploadFolder = 'issues'): Promise<ImageUploadResult | null> => {
    return imageService.captureAndUploadIssuePhoto(folder);
  };

  const pickFromGallery = async (folder: UploadFolder = 'issues'): Promise<ImageUploadResult | null> => {
    try {
      const result = await imageService.pickImageFromGallery();
      if (result.canceled || !result.assets?.[0]) {
        return null;
      }
      const asset = result.assets[0];
      return imageService.uploadImage(asset.uri, folder, asset.base64);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const pickMultiple = async (folder: UploadFolder = 'issues', limit: number = 5): Promise<ImageUploadResult[]> => {
    try {
      const result = await imageService.pickMultipleImages(limit);
      if (result.canceled || !result.assets) {
        return [];
      }
      return imageService.uploadMultipleImages(
        result.assets.map((a) => ({ uri: a.uri, base64: a.base64 })),
        folder
      );
    } catch (error) {
      console.error('Pick multiple error:', error);
      return [];
    }
  };

  return {
    takePhoto,
    pickFromGallery,
    pickMultiple,
  };
}
