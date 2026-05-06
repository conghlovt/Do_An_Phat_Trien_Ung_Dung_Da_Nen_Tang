import { Alert, Platform } from 'react-native';

export const confirmAction = (title: string, message: string): Promise<boolean> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Xóa', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
};
