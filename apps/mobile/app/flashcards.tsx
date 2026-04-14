import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import type { Flashcard } from "@ai-lang/shared";
import { SafeAreaView } from "react-native-safe-area-context";

function FlashCard({ card, onDelete }: { card: Flashcard; onDelete: (id: string) => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <TouchableOpacity onPress={() => setFlipped(!flipped)} style={[styles.card, flipped && styles.cardFlipped]}>
      <TouchableOpacity onPress={() => onDelete(card.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={14} color="#f87171" />
      </TouchableOpacity>
      {!flipped ? (
        <>
          <Text style={styles.cardWord}>{card.word}</Text>
          <Text style={styles.cardHint}>tap to reveal</Text>
        </>
      ) : (
        <>
          <Text style={styles.cardTranslation}>{card.translation}</Text>
          <Text style={styles.cardExample}>{card.example}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function FlashcardsScreen() {
  const { flashcards, removeFlashcard } = useAppStore();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={flashcards}
        keyExtractor={(c) => c.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => <FlashCard card={item} onDelete={removeFlashcard} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color="#374151" />
            <Text style={styles.emptyText}>No flashcards yet</Text>
            <Text style={styles.emptySubText}>Save words from your conversations</Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={styles.count}>{flashcards.length} cards</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  list: { padding: 16, gap: 12 },
  count: { color: "#6b7280", fontSize: 13, marginBottom: 4 },
  card: { flex: 1, backgroundColor: "#1f2937", borderWidth: 1, borderColor: "#374151", borderRadius: 16, padding: 16, minHeight: 140, justifyContent: "space-between" },
  cardFlipped: { backgroundColor: "#1e1b4b", borderColor: "#4c1d95" },
  cardWord: { color: "white", fontSize: 22, fontWeight: "700" },
  cardHint: { color: "#6b7280", fontSize: 12 },
  cardTranslation: { color: "#a78bfa", fontSize: 18, fontWeight: "600" },
  cardExample: { color: "#9ca3af", fontSize: 12, fontStyle: "italic" },
  deleteBtn: { position: "absolute", top: 10, right: 10, padding: 4 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyText: { color: "#6b7280", fontSize: 16, fontWeight: "600" },
  emptySubText: { color: "#4b5563", fontSize: 13 },
});
