import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AiProvider } from '../services/geminiRecipeSearch';

type Props = {
  provider: AiProvider;
  onChange: (provider: AiProvider) => void;
};

export default function AiProviderSelector({ provider, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>IA :</Text>
      <Pressable
        style={[styles.chip, provider === 'gemini' && styles.chipActive]}
        onPress={() => onChange('gemini')}
      >
        <Text style={[styles.chipText, provider === 'gemini' && styles.chipTextActive]}>Gemini</Text>
      </Pressable>
      <Pressable
        style={[styles.chip, provider === 'groq' && styles.chipActive]}
        onPress={() => onChange('groq')}
      >
        <Text style={[styles.chipText, provider === 'groq' && styles.chipTextActive]}>Groq</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: '#fff',
  },
});
