import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GameStatus } from "../../../src/db/schema";
import { statusDisplayMap } from "../../constants/gameConstants";

interface NewGameModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (gameData: any) => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState<GameStatus>("backlog");
  const [genre, setGenre] = useState("");
  const [publisher, setPublisher] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [rating, setRating] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setPlatform("");
    setStatus("backlog");
    setGenre("");
    setPublisher("");
    setReleaseYear("");
    setRating("");
    setDescription("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Erro", "O título é obrigatório");
      return;
    }

    const gameData = {
      title: title.trim(),
      platform: platform.trim() || undefined,
      status,
      genre: genre.trim() || undefined,
      publisher: publisher.trim() || undefined,
      release_year: releaseYear.trim()
        ? parseInt(releaseYear.trim(), 10)
        : undefined,
      rating: rating.trim() ? parseInt(rating.trim(), 10) : undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSubmit(gameData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.formTitle}>Adicionar Novo Jogo</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Título <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Digite o título do jogo"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Plataforma</Text>
                <TextInput
                  style={styles.formInput}
                  value={platform}
                  onChangeText={setPlatform}
                  placeholder="Ex: PS5, Nintendo Switch, PC"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  {(["backlog", "playing", "completed"] as GameStatus[]).map(
                    (statusOption) => (
                      <TouchableOpacity
                        key={statusOption}
                        style={[
                          styles.statusOption,
                          status === statusOption &&
                            styles.statusOptionSelected,
                        ]}
                        onPress={() => setStatus(statusOption)}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            status === statusOption &&
                              styles.statusOptionTextSelected,
                          ]}
                        >
                          {statusDisplayMap[statusOption]}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Gênero</Text>
                <TextInput
                  style={styles.formInput}
                  value={genre}
                  onChangeText={setGenre}
                  placeholder="Ex: Ação, RPG, Estratégia"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Editora</Text>
                <TextInput
                  style={styles.formInput}
                  value={publisher}
                  onChangeText={setPublisher}
                  placeholder="Ex: Nintendo, Sony, EA"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ano de Lançamento</Text>
                <TextInput
                  style={styles.formInput}
                  value={releaseYear}
                  onChangeText={setReleaseYear}
                  placeholder="Ex: 2025"
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Avaliação (1-10)</Text>
                <TextInput
                  style={styles.formInput}
                  value={rating}
                  onChangeText={setRating}
                  placeholder="1-10"
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descrição</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descrição do jogo"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Anotações</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Suas anotações pessoais"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Adicionar Jogo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  formScrollView: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: "#D0021B",
  },
  formInput: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  statusOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  statusOptionSelected: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderColor: "#007AFF",
  },
  statusOptionText: {
    fontWeight: "500",
    color: "#666",
  },
  statusOptionTextSelected: {
    color: "#007AFF",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
