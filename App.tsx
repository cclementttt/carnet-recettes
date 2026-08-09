import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';

// TEMPORAIRE: efface les anciennes recettes (format obsolète) au démarrage. À retirer après usage.
AsyncStorage.removeItem('recipes');

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}
