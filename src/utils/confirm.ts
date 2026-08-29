import { Alert, Platform } from 'react-native';

export function confirmAction(
  title: string,
  message: string,
  destructiveLabel: string,
  onConfirm: () => void
) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: destructiveLabel, style: 'destructive', onPress: onConfirm },
    ]);
  }
}
