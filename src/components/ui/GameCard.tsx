import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Game } from "../../../src/db/schema";
import { getGameColor } from "../../utils/gameUtils";
import { StatusBadge } from "./StatusBadge";

interface GameCardProps {
  game: Game;
  onPress: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPress }) => {
  return (
    <TouchableOpacity style={styles.gameItem} onPress={() => onPress(game)}>
      <View style={styles.gameItemContent}>
        <View
          style={[
            styles.gameIcon,
            { backgroundColor: getGameColor(game.title) },
          ]}
        >
          <Text style={styles.gameIconText}>
            {game.title.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.gameDetails}>
          <Text style={styles.gameTitle}>{game.title}</Text>

          <View style={styles.gameMetaRow}>
            {game.platform && (
              <Text style={styles.gameInfo}>{game.platform}</Text>
            )}
            {game.genre && (
              <>
                <Text style={styles.bulletSeparator}>•</Text>
                <Text style={styles.gameInfo}>{game.genre}</Text>
              </>
            )}
          </View>

          <View style={styles.gameBottomRow}>
            <StatusBadge status={game.status} />

            {game.hours > 0 && (
              <View style={styles.hoursContainer}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.hoursText}>{game.hours.toFixed(1)}h</Text>
              </View>
            )}
          </View>
        </View>

        {game.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>{game.rating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gameItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  gameItemContent: {
    flexDirection: "row",
    padding: 16,
  },
  gameIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  gameIconText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  gameDetails: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  gameMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gameInfo: {
    fontSize: 14,
    color: "#666",
  },
  bulletSeparator: {
    fontSize: 14,
    color: "#ccc",
    marginHorizontal: 6,
  },
  gameBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hoursText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  ratingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  ratingBadgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
