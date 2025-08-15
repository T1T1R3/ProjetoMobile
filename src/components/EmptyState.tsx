import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyStateProps {
  onAddSampleGames: () => void;
  onAddNewGame: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddSampleGames,
  onAddNewGame,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="game-controller-outline" size={64} color="#ddd" />
      <Text style={styles.emptyText}>Nenhum jogo encontrado</Text>
      <View style={styles.emptyButtonsContainer}>
        <TouchableOpacity style={styles.emptyButton} onPress={onAddSampleGames}>
          <Text style={styles.emptyButtonText}>Adicionar Jogos de Exemplo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyButton, styles.emptyButtonPrimary]}
          onPress={onAddNewGame}
        >
          <Text style={styles.emptyButtonTextPrimary}>Adicionar Novo Jogo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButtonsContainer: {
    flexDirection: "row",
  },
  emptyButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  emptyButtonPrimary: {
    backgroundColor: "#007AFF",
  },
  emptyButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyButtonTextPrimary: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
