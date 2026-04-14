import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES, LEVELS } from "@ai-lang/shared";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { settings, setSettings, apiUrl, setApiUrl } = useAppStore();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Language I want to learn</Text>
        <View style={styles.grid}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setSettings({ targetLanguage: lang })}
              style={[styles.chip, settings.targetLanguage.code === lang.code && styles.chipActive]}
            >
              <Text>{lang.flag}</Text>
              <Text style={[styles.chipText, settings.targetLanguage.code === lang.code && styles.chipTextActive]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>My native language</Text>
        <View style={styles.grid}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setSettings({ nativeLanguage: lang })}
              style={[styles.chip, settings.nativeLanguage.code === lang.code && styles.chipAccent]}
            >
              <Text>{lang.flag}</Text>
              <Text style={[styles.chipText, settings.nativeLanguage.code === lang.code && styles.chipTextActive]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>My level</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              onPress={() => setSettings({ level: lvl })}
              style={[styles.levelChip, settings.level === lvl && styles.levelChipActive]}
            >
              <Text style={[styles.levelText, settings.level === lvl && styles.levelTextActive]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>API URL (web app URL)</Text>
        <TextInput
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://localhost:3000"
          placeholderTextColor="#6b7280"
          style={styles.apiInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Current setup</Text>
          <Text style={styles.summaryText}>
            Learning {settings.targetLanguage.flag} {settings.targetLanguage.name} at {settings.level}
          </Text>
          <Text style={styles.summaryText}>
            Native: {settings.nativeLanguage.flag} {settings.nativeLanguage.name}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  scroll: { padding: 16, gap: 12 },
  sectionLabel: { color: "#9ca3af", fontSize: 13, fontWeight: "500", marginTop: 8, marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#374151", backgroundColor: "#1f2937" },
  chipActive: { borderColor: "#0284c7", backgroundColor: "#082f49" },
  chipAccent: { borderColor: "#7c3aed", backgroundColor: "#2e1065" },
  chipText: { color: "#9ca3af", fontSize: 13 },
  chipTextActive: { color: "white" },
  levelRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  levelChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#374151", backgroundColor: "#1f2937" },
  levelChipActive: { borderColor: "#0284c7", backgroundColor: "#082f49" },
  levelText: { color: "#9ca3af", fontSize: 14, fontWeight: "600" },
  levelTextActive: { color: "#38bdf8" },
  apiInput: { backgroundColor: "#1f2937", borderWidth: 1, borderColor: "#374151", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: "white", fontSize: 14 },
  summary: { backgroundColor: "#1f2937", borderRadius: 14, padding: 14, gap: 4, marginTop: 8 },
  summaryTitle: { color: "white", fontWeight: "600", marginBottom: 4 },
  summaryText: { color: "#9ca3af", fontSize: 13 },
});
