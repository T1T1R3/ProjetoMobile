import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Game } from "../../../src/db/schema";
import { getGameColor } from "../../utils/gameUtils";
import { StarRating } from "../ui/StarRating";
import { StatusBadge } from "../ui/StatusBadge";

interface GameDetailsModalProps {
  game: Game | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  visible,
  onClose,
  onDelete,
}) => {
  if (!game) return null;

  const handleDelete = () => {
    Alert.alert(
      "Excluir Jogo",
      `Tem certeza que deseja excluir "${game.title}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => {
            onDelete(game.id);
            onClose();
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.gameBanner,
                { backgroundColor: getGameColor(game.title) },
              ]}
            >
              <Text style={styles.gameBannerText}>
                {game.title.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{game.title}</Text>

            <View style={styles.modalDetailsRow}>
              <StatusBadge status={game.status} />
              {game.rating !== null && <StarRating rating={game.rating} />}
            </View>

            {(game.platform || game.genre) && (
              <View style={styles.detailSection}>
                {game.platform && (
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="game-controller-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.detailText}>{game.platform}</Text>
                  </View>
                )}

                {game.genre && (
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{game.genre}</Text>
                  </View>
                )}
              </View>
            )}

            {(game.publisher || game.release_year) && (
              <View style={styles.detailSection}>
                {game.publisher && (
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{game.publisher}</Text>
                  </View>
                )}

                {game.release_year && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{game.release_year}</Text>
                  </View>
                )}
              </View>
            )}

            {game.description && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.description}>{game.description}</Text>
              </View>
            )}

            {game.hours > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Tempo de Jogo</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.detailText}>
                    {game.hours.toFixed(1)} horas
                  </Text>
                </View>
              </View>
            )}

            {game.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Anotações</Text>
                <Text style={styles.description}>{game.notes}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 4,
  },
  gameBanner: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  gameBannerText: {
    fontSize: 72,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.8)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  modalDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  deleteButton: {
    backgroundColor: "#D0021B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
