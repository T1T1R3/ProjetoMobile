import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CURRENT_TIMESTAMP, CURRENT_USER } from "../constants/gameConstants";
import { Game, GameStatus } from "../db/schema";

// Tipos locais para filtros, sem dependência do gamesRepo
type SortOption = "updated" | "title" | "rating" | "hours" | "created";

interface GameFilters {
  searchQuery?: string;
  status?: GameStatus | "all";
  sortBy?: SortOption;
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedStatus: GameStatus | "all";
  onStatusFilter: (status: GameStatus | "all") => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusFilter,
  sortBy,
  onSortChange,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Cabeçalho principal com título e informações do usuário */}
      <View style={styles.headerTop}>
        <Text style={styles.header}>Biblioteca de Jogos</Text>
        <View style={styles.userInfo}>
          <Text style={styles.timestampText}>{CURRENT_TIMESTAMP}</Text>
          <View style={styles.userBadge}>
            <Ionicons name="person" size={14} color="#fff" />
            <Text style={styles.userBadgeText}>{CURRENT_USER}</Text>
          </View>
        </View>
      </View>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar jogos..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filtros e ordenação */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Filtros por status */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedStatus === "all" && styles.filterPillActive,
            ]}
            onPress={() => onStatusFilter("all")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedStatus === "all" && styles.filterPillTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedStatus === "playing" && styles.filterPillActive,
            ]}
            onPress={() => onStatusFilter("playing")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedStatus === "playing" && styles.filterPillTextActive,
              ]}
            >
              Jogando
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedStatus === "backlog" && styles.filterPillActive,
            ]}
            onPress={() => onStatusFilter("backlog")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedStatus === "backlog" && styles.filterPillTextActive,
              ]}
            >
              Na Fila
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedStatus === "completed" && styles.filterPillActive,
            ]}
            onPress={() => onStatusFilter("completed")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedStatus === "completed" && styles.filterPillTextActive,
              ]}
            >
              Concluído
            </Text>
          </TouchableOpacity>

          {/* Divisor visual entre filtros e ordenação */}
          <View style={styles.sortDivider} />

          {/* Opções de ordenação */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              sortBy === "updated" && styles.filterPillActive,
            ]}
            onPress={() => onSortChange("updated")}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={sortBy === "updated" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterPillText,
                sortBy === "updated" && styles.filterPillTextActive,
              ]}
            >
              Recentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              sortBy === "title" && styles.filterPillActive,
            ]}
            onPress={() => onSortChange("title")}
          >
            <Ionicons
              name="text-outline"
              size={14}
              color={sortBy === "title" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterPillText,
                sortBy === "title" && styles.filterPillTextActive,
              ]}
            >
              Nome
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              sortBy === "rating" && styles.filterPillActive,
            ]}
            onPress={() => onSortChange("rating")}
          >
            <Ionicons
              name="star-outline"
              size={14}
              color={sortBy === "rating" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterPillText,
                sortBy === "rating" && styles.filterPillTextActive,
              ]}
            >
              Avaliação
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              sortBy === "hours" && styles.filterPillActive,
            ]}
            onPress={() => onSortChange("hours")}
          >
            <Ionicons
              name="hourglass-outline"
              size={14}
              color={sortBy === "hours" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.filterPillText,
                sortBy === "hours" && styles.filterPillTextActive,
              ]}
            >
              Horas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

// Função utilitária para aplicar filtros em uma lista de jogos
export const filterGames = (games: Game[], filters: GameFilters): Game[] => {
  let filteredGames = [...games];

  // Aplica filtro de busca por texto
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase().trim();
    filteredGames = filteredGames.filter(
      (game) =>
        game.title.toLowerCase().includes(query) ||
        game.platform?.toLowerCase().includes(query) ||
        game.genre?.toLowerCase().includes(query) ||
        game.publisher?.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query)
    );
  }

  // Aplica filtro por status
  if (filters.status && filters.status !== "all") {
    filteredGames = filteredGames.filter(
      (game) => game.status === filters.status
    );
  }

  // Aplica ordenação
  if (filters.sortBy) {
    filteredGames.sort((a, b) => {
      switch (filters.sortBy) {
        case "title":
          return a.title.localeCompare(b.title, "pt-BR");

        case "rating":
          // Jogos sem avaliação vão para o final
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating; // Ordem decrescente (maior primeiro)

        case "hours":
          return b.hours - a.hours; // Ordem decrescente (mais horas primeiro)

        case "created":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        case "updated":
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });
  }

  return filteredGames;
};

// Função utilitária para obter contagem de jogos por status
export const getGameStatusCounts = (games: Game[]) => {
  const counts = {
    all: games.length,
    backlog: 0,
    playing: 0,
    completed: 0,
  };

  games.forEach((game) => {
    counts[game.status]++;
  });

  return counts;
};

// Função utilitária para obter estatísticas dos jogos
export const getGameStats = (games: Game[]) => {
  const totalHours = games.reduce((sum, game) => sum + game.hours, 0);
  const averageRating = games
    .filter((game) => game.rating !== null)
    .reduce((sum, game, _, arr) => sum + game.rating! / arr.length, 0);

  const gamesWithRating = games.filter((game) => game.rating !== null).length;

  return {
    totalGames: games.length,
    totalHours: Math.round(totalHours * 10) / 10, // Arredonda para 1 casa decimal
    averageRating:
      gamesWithRating > 0 ? Math.round(averageRating * 10) / 10 : 0,
    gamesWithRating,
    statusCounts: getGameStatusCounts(games),
  };
};

// Exporta os tipos para uso em outros componentes
export type { GameFilters, SortOption };

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  userInfo: {
    alignItems: "flex-end",
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  userBadge: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
  },
  userBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  filtersContainer: {
    flexDirection: "row",
  },
  filterPill: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    alignItems: "center",
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: "#007AFF",
  },
  filterPillText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  filterPillTextActive: {
    color: "#fff",
  },
  sortDivider: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
  },
});
