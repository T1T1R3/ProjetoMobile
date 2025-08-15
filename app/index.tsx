import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  EmptyState,
  GameCard,
  GameDetailsModal,
  Header,
  NewGameModal,
} from "../src/components";
import { initDatabase } from "../src/db/database";
import gamesRepo from "../src/db/repos/gamesRepo";
import { Game, GameStatus } from "../src/db/schema";

// Tipos locais para filtros sem dependência do gamesRepo
type SortOption = "updated" | "title" | "rating" | "hours" | "created";

interface GameFilters {
  searchQuery: string;
  status: GameStatus | "all";
  sortBy: SortOption;
}

export default function Index() {
  // Estados principais do banco de dados
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]); // Todos os jogos do banco
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [filters, setFilters] = useState<GameFilters>({
    searchQuery: "",
    status: "all",
    sortBy: "updated",
  });

  // Estados dos modais
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);

  // Inicializa o banco de dados quando o componente é montado
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      console.log("[App] Inicializando banco de dados...");
      await initDatabase();
      setDbInitialized(true);
      await loadAllGames();
      console.log("[App] Banco inicializado com sucesso");
    } catch (error: any) {
      console.error("[App] Erro na inicialização:", error);
      setDbError(error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega todos os jogos do banco de dados
  const loadAllGames = async () => {
    try {
      setLoading(true);
      const gamesList = await gamesRepo.list({});
      setAllGames(gamesList);
      console.log(`[App] ${gamesList.length} jogos carregados`);
    } catch (error) {
      console.error("[App] Erro ao carregar jogos:", error);
      Alert.alert("Erro", "Falha ao carregar jogos do banco de dados");
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar e ordenar jogos usando useMemo para otimização
  const filteredGames = useMemo(() => {
    let result = [...allGames];

    // Aplica filtro de busca por texto
    if (filters.searchQuery.trim().length > 0) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter((game) => {
        const searchableText = [
          game.title,
          game.platform,
          game.genre,
          game.publisher,
          game.description,
          game.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Aplica filtro por status
    if (filters.status !== "all") {
      result = result.filter((game) => game.status === filters.status);
    }

    // Aplica ordenação
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "title":
          return a.title.localeCompare(b.title, "pt-BR", {
            numeric: true,
            sensitivity: "base",
          });

        case "rating":
          // Jogos sem avaliação vão para o final
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating; // Maior primeiro

        case "hours":
          return b.hours - a.hours; // Mais horas primeiro

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

    return result;
  }, [allGames, filters]);

  // Estatísticas dos jogos filtrados
  const gameStats = useMemo(() => {
    const totalHours = filteredGames.reduce((sum, game) => sum + game.hours, 0);
    const gamesWithRating = filteredGames.filter(
      (game) => game.rating !== null
    );
    const averageRating =
      gamesWithRating.length > 0
        ? gamesWithRating.reduce((sum, game) => sum + game.rating!, 0) /
          gamesWithRating.length
        : 0;

    const statusCounts = {
      all: allGames.length,
      backlog: allGames.filter((g) => g.status === "backlog").length,
      playing: allGames.filter((g) => g.status === "playing").length,
      completed: allGames.filter((g) => g.status === "completed").length,
    };

    return {
      totalGames: filteredGames.length,
      totalHours: Math.round(totalHours * 10) / 10,
      averageRating: Math.round(averageRating * 10) / 10,
      gamesWithRating: gamesWithRating.length,
      statusCounts,
    };
  }, [allGames, filteredGames]);

  // Adiciona jogos de exemplo para demonstração
  const addSampleGames = useCallback(async () => {
    try {
      setLoading(true);
      await gamesRepo.addSampleData();
      await loadAllGames();
      Alert.alert("Sucesso", "Jogos de exemplo adicionados com sucesso!", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("[App] Erro ao adicionar jogos de exemplo:", error);
      Alert.alert(
        "Erro",
        "Falha ao adicionar jogos de exemplo. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Cria um novo jogo no banco de dados
  const createNewGame = useCallback(async (gameData: any) => {
    try {
      setLoading(true);

      // Adiciona timestamps
      const now = new Date().toISOString();
      const gameWithTimestamps = {
        ...gameData,
        created_at: now,
        updated_at: now,
      };

      await gamesRepo.create(gameWithTimestamps);
      await loadAllGames();

      Alert.alert(
        "Sucesso",
        `Jogo "${gameData.title}" foi adicionado à sua biblioteca!`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("[App] Erro ao criar jogo:", error);
      Alert.alert(
        "Erro",
        "Não foi possível adicionar o jogo. Verifique os dados e tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove um jogo do banco de dados
  const deleteGame = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await gamesRepo.delete(id);
      await loadAllGames();

      Alert.alert("Sucesso", "Jogo removido da biblioteca com sucesso!", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("[App] Erro ao excluir jogo:", error);
      Alert.alert("Erro", "Não foi possível remover o jogo. Tente novamente.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manipuladores de eventos otimizados com useCallback
  const handleSearchChange = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: text }));
  }, []);

  const handleStatusFilter = useCallback((status: GameStatus | "all") => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const handleSortChange = useCallback((sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const openGameDetails = useCallback((game: Game) => {
    setSelectedGame(game);
    setDetailsModalVisible(true);
  }, []);

  const closeGameDetails = useCallback(() => {
    setDetailsModalVisible(false);
    setSelectedGame(null);
  }, []);

  const openNewGameModal = useCallback(() => {
    setNewGameModalVisible(true);
  }, []);

  const closeNewGameModal = useCallback(() => {
    setNewGameModalVisible(false);
  }, []);

  // Renderiza componente de jogo otimizado
  const renderGameItem = useCallback(
    ({ item }: { item: Game }) => (
      <GameCard game={item} onPress={openGameDetails} />
    ),
    [openGameDetails]
  );

  // Tela de carregamento ou erro enquanto banco não está pronto
  if (!dbInitialized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
        <View style={styles.centered}>
          {dbError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#D0021B" />
              <Text style={styles.errorTitle}>Erro na Inicialização</Text>
              <Text style={styles.errorText}>{dbError.message}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeDatabase}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                Inicializando banco de dados...
              </Text>
              <Text style={styles.loadingSubtext}>
                Configurando sua biblioteca de jogos
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
      <View style={styles.container}>
        {/* Cabeçalho com busca e filtros */}
        <Header
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
          selectedStatus={filters.status}
          onStatusFilter={handleStatusFilter}
          sortBy={filters.sortBy}
          onSortChange={handleSortChange}
          gameStats={gameStats}
        />

        {/* Lista principal de jogos com indicador de carregamento sobreposto */}
        <View style={styles.listWrapper}>
          <FlatList
            data={filteredGames}
            keyExtractor={(item) => `game-${item.id}`}
            contentContainerStyle={[
              styles.listContainer,
              filteredGames.length === 0 && styles.emptyListContainer,
            ]}
            renderItem={renderGameItem}
            ListEmptyComponent={
              <EmptyState
                onAddSampleGames={addSampleGames}
                onAddNewGame={openNewGameModal}
                hasFilters={
                  filters.searchQuery.length > 0 || filters.status !== "all"
                }
                totalGames={allGames.length}
              />
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 120, // Altura estimada do item
              offset: 120 * index,
              index,
            })}
          />

          {/* Indicador de carregamento sobreposto */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingOverlayText}>Carregando...</Text>
              </View>
            </View>
          )}
        </View>

        {/* Informações de estatísticas na parte inferior */}
        {filteredGames.length > 0 && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>
              {gameStats.totalGames} jogo{gameStats.totalGames !== 1 ? "s" : ""}{" "}
              • {gameStats.totalHours}h jogadas
              {gameStats.gamesWithRating > 0 &&
                ` • Média: ${gameStats.averageRating}/10`}
            </Text>
          </View>
        )}

        {/* Botão flutuante para adicionar novo jogo */}
        {allGames.length > 0 && (
          <View style={styles.fab}>
            <TouchableOpacity
              style={styles.fabButton}
              onPress={openNewGameModal}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Modais */}
        <GameDetailsModal
          game={selectedGame}
          visible={detailsModalVisible}
          onClose={closeGameDetails}
          onDelete={deleteGame}
        />

        <NewGameModal
          visible={newGameModalVisible}
          onClose={closeNewGameModal}
          onSubmit={createNewGame}
        />
      </View>
    </SafeAreaView>
  );
}

// Estilos aprimorados do componente
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D0021B",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: "#D0021B",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  listWrapper: {
    flex: 1,
    position: "relative",
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1000,
  },
  loadingCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingOverlayText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statsBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});
