import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Message } from "@ai-lang/shared";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { messages, addMessage, clearMessages, settings, isLoading, setLoading, addFlashcard, apiUrl } =
    useAppStore();
  const [input, setInput] = useState("");
  const [newWords, setNewWords] = useState<string[]>([]);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Sorry, I couldn't respond.",
        correction: data.correction || undefined,
        timestamp: new Date(),
      });
      if (data.newWords?.length) setNewWords(data.newWords);
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Connection error. Please check your API URL in Settings.",
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcard = async (word: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/flashcard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      const data = await res.json();
      addFlashcard({
        id: Date.now().toString(),
        word: data.word,
        translation: data.translation,
        example: data.example,
        language: settings.targetLanguage.code,
      });
      setNewWords((prev) => prev.filter((w) => w !== word));
    } catch {}
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}>
        <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAI]}>
          <Text style={styles.avatarText}>{isUser ? "U" : "AI"}</Text>
        </View>
        <View style={{ maxWidth: "75%", gap: 6 }}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
          {item.correction && (
            <View style={styles.correction}>
              <Ionicons name="alert-circle-outline" size={14} color="#fbbf24" />
              <Text style={styles.correctionText}>{item.correction}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyFlag}>{settings.targetLanguage.flag}</Text>
              <Text style={styles.emptyText}>
                Start a conversation in {settings.targetLanguage.name}
              </Text>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View style={[styles.msgRow, styles.msgRowAI]}>
                <View style={[styles.avatar, styles.avatarAI]}>
                  <Text style={styles.avatarText}>AI</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAI]}>
                  <ActivityIndicator size="small" color="#6b7280" />
                </View>
              </View>
            ) : null
          }
        />

        {newWords.length > 0 && (
          <View style={styles.newWords}>
            <Text style={styles.newWordsLabel}>Save:</Text>
            {newWords.map((w) => (
              <TouchableOpacity key={w} onPress={() => saveFlashcard(w)} style={styles.wordChip}>
                <Ionicons name="add" size={12} color="#a78bfa" />
                <Text style={styles.wordChipText}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={`Type in ${settings.targetLanguage.name}...`}
            placeholderTextColor="#6b7280"
            style={styles.input}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={isLoading || !input.trim()}
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  list: { padding: 16, gap: 4 },
  msgRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgRowAI: { flexDirection: "row" },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarUser: { backgroundColor: "#0284c7" },
  avatarAI: { backgroundColor: "#7c3aed" },
  avatarText: { color: "white", fontSize: 11, fontWeight: "700" },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser: { backgroundColor: "#0284c7", borderTopRightRadius: 4 },
  bubbleAI: { backgroundColor: "#1f2937", borderTopLeftRadius: 4 },
  bubbleText: { color: "white", fontSize: 14, lineHeight: 20 },
  correction: { flexDirection: "row", gap: 6, backgroundColor: "#451a03", borderWidth: 1, borderColor: "#92400e", borderRadius: 12, padding: 8 },
  correctionText: { color: "#fcd34d", fontSize: 12, flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100, gap: 12 },
  emptyFlag: { fontSize: 48 },
  emptyText: { color: "#6b7280", fontSize: 14, textAlign: "center" },
  newWords: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#1f2937", alignItems: "center" },
  newWordsLabel: { color: "#6b7280", fontSize: 12 },
  wordChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#2e1065", borderWidth: 1, borderColor: "#5b21b6", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  wordChipText: { color: "#a78bfa", fontSize: 12 },
  inputRow: { flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: "#1f2937" },
  input: { flex: 1, backgroundColor: "#1f2937", borderWidth: 1, borderColor: "#374151", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: "white", fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#0284c7", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#1f2937" },
});
