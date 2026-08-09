import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import {
  addManualItem,
  clearCheckedItems,
  clearShoppingList,
  getShoppingList,
  removeShoppingItem,
  toggleShoppingItem,
} from '../storage/shoppingListStorage';
import { colors, radius, shadow, spacing } from '../theme';
import { ShoppingListItem } from '../types/shoppingList';
import { exportShoppingListAsPdf } from '../utils/exportShoppingList';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingList'>;

export default function ShoppingListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  const load = useCallback(async () => {
    setItems(await getShoppingList());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAddItem = async () => {
    const text = newItemText.trim();
    if (!text) return;
    await addManualItem(text);
    setNewItemText('');
    load();
  };

  const handleExport = async () => {
    if (items.length === 0) return;
    try {
      await exportShoppingListAsPdf(items);
    } catch (error) {
      console.error('[export] shopping list failed', error);
      Alert.alert('Export impossible', 'Une erreur est survenue lors de la génération du PDF.');
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.headerButton} onPress={handleExport} hitSlop={8}>
          <Text style={styles.headerButtonText}>📤</Text>
        </Pressable>
      ),
    });
  }, [navigation, items]);

  const sections = useMemo(() => {
    const groups = new Map<string, ShoppingListItem[]>();
    for (const item of items) {
      const group = groups.get(item.recipeName) ?? [];
      group.push(item);
      groups.set(item.recipeName, group);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [items]);

  const handleToggle = async (id: string) => {
    await toggleShoppingItem(id);
    load();
  };

  const handleRemove = async (id: string) => {
    await removeShoppingItem(id);
    load();
  };

  const handleClearChecked = () => {
    Alert.alert('Vider les cases cochées ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Vider', style: 'destructive', onPress: async () => { await clearCheckedItems(); load(); } },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Vider toute la liste ?', undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Vider', style: 'destructive', onPress: async () => { await clearShoppingList(); load(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addBar}>
        <TextInput
          style={styles.addInput}
          value={newItemText}
          onChangeText={setNewItemText}
          placeholder="Ajouter un article..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, !newItemText.trim() && styles.addButtonDisabled]}
          onPress={handleAddItem}
          disabled={!newItemText.trim()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => handleToggle(item.id)}
          >
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
              {[item.quantity, item.unit].filter(Boolean).join(' ')} {item.name}
            </Text>
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleRemove(item.id)}
              hitSlop={8}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Ta liste de courses est vide. Ajoute un article ci-dessus ou depuis une recette.
            </Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: spacing.lg + insets.bottom }]}>
          <Pressable style={styles.footerButton} onPress={handleClearChecked}>
            <Text style={styles.footerButtonText}>Vider les cases cochées</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.footerButtonDanger]} onPress={handleClearAll}>
            <Text style={[styles.footerButtonText, styles.footerButtonTextDanger]}>Vider tout</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  itemTextChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
  },
  footerButtonDanger: {
    backgroundColor: colors.dangerMuted,
  },
  footerButtonText: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
  },
  footerButtonTextDanger: {
    color: colors.danger,
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    fontSize: 18,
  },
});
