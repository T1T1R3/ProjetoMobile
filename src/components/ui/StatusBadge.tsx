import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GameStatus } from "../../../src/db/schema";
import { statusDisplayMap } from "../../constants/gameConstants";

interface StatusBadgeProps {
  status: GameStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "backlog":
        return { bg: "#f0f0f0", text: "#666666" };
      case "playing":
        return { bg: "#E3F2FD", text: "#1976D2" };
      case "completed":
        return { bg: "#E8F5E9", text: "#388E3C" };
      default:
        return { bg: "#f0f0f0", text: "#666666" };
    }
  };

  const colors = getStatusColor();

  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusText, { color: colors.text }]}>
        {statusDisplayMap[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
