// Implementação de banco de dados em memória

// Tipos de dados do banco
interface Column {
  name: string; // Nome da coluna
  type: string; // Tipo de dados da coluna
  primaryKey?: boolean; // Se é chave primária
  autoIncrement?: boolean; // Se incrementa automaticamente
  notNull?: boolean; // Se não permite valores nulos
  defaultValue?: any; // Valor padrão da coluna
  foreignKey?: {
    table: string; // Tabela referenciada
    column: string; // Coluna referenciada
  };
}

interface Table {
  name: string; // Nome da tabela
  columns: Column[]; // Definições das colunas
  records: Record<string, any>[]; // Registros armazenados
  autoIncrementValue: number; // Próximo valor do auto incremento
}

interface InMemoryDatabase {
  tables: Map<string, Table>; // Mapa com todas as tabelas
}

// Instância global do banco de dados
let inMemoryDb: InMemoryDatabase | null = null;

/**
 * Inicializa o banco de dados em memória
 */
export async function initDatabase(): Promise<void> {
  console.log("[Database] Inicializando banco de dados em memória...");

  try {
    // Cria a estrutura do banco de dados
    inMemoryDb = {
      tables: new Map<string, Table>(),
    };

    // Verifica se as tabelas existem e as cria/atualiza
    await ensureTablesExist();

    console.log(
      "[Database] Banco de dados em memória inicializado com sucesso"
    );
  } catch (error) {
    console.error("[Database] Erro na inicialização:", error);
    throw error;
  }
}

/**
 * Cria as tabelas necessárias se elas não existirem
 */
async function ensureTablesExist() {
  const db = getDb();

  // Verifica se a tabela game existe
  if (!db.tables.has("game")) {
    console.log("[Database] Criando tabela game em memória...");

    const gameTable: Table = {
      name: "game",
      columns: [
        { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true }, // ID único auto incrementado
        { name: "title", type: "TEXT", notNull: true }, // Título do jogo (obrigatório)
        { name: "platform", type: "TEXT" }, // Plataforma (opcional)
        {
          name: "status",
          type: "TEXT",
          notNull: true,
          defaultValue: "backlog", // Status padrão é "backlog"
        },
        { name: "rating", type: "INTEGER" }, // Avaliação numérica (opcional)
        { name: "hours", type: "REAL", notNull: true, defaultValue: 0 }, // Horas jogadas (padrão 0)
        { name: "notes", type: "TEXT" }, // Anotações pessoais (opcional)
        { name: "release_year", type: "INTEGER" }, // Ano de lançamento (opcional)
        { name: "started_at", type: "TEXT" }, // Data/hora que começou a jogar
        { name: "completed_at", type: "TEXT" }, // Data/hora que completou
        { name: "created_at", type: "TEXT", notNull: true }, // Timestamp de criação
        { name: "updated_at", type: "TEXT", notNull: true }, // Timestamp de atualização
        { name: "deleted", type: "INTEGER", notNull: true, defaultValue: 0 }, // Marcador de exclusão soft
        { name: "publisher", type: "TEXT" }, // Editora do jogo
        { name: "year", type: "INTEGER" }, // Ano (campo alternativo)
        { name: "genre", type: "TEXT" }, // Gênero do jogo
        { name: "description", type: "TEXT" }, // Descrição do jogo
      ],
      records: [], // Inicia sem registros
      autoIncrementValue: 1, // Próximo ID será 1
    };

    db.tables.set("game", gameTable);
  } else {
    // Tabela existe, verifica colunas faltantes e as adiciona se necessário
    console.log("[Database] Tabela game existe, verificando colunas...");

    const gameTable = db.tables.get("game")!;
    const columnNames = gameTable.columns.map((col) => col.name);

    // Define colunas obrigatórias
    const requiredColumns: {
      name: string;
      type: string;
      defaultValue?: any;
      notNull?: boolean;
    }[] = [
      { name: "platform", type: "TEXT" },
      { name: "status", type: "TEXT", defaultValue: "backlog", notNull: true },
      { name: "rating", type: "INTEGER" },
      { name: "hours", type: "REAL", defaultValue: 0, notNull: true },
      { name: "notes", type: "TEXT" },
      { name: "release_year", type: "INTEGER" },
      { name: "started_at", type: "TEXT" },
      { name: "completed_at", type: "TEXT" },
      { name: "created_at", type: "TEXT", notNull: true },
      { name: "updated_at", type: "TEXT", notNull: true },
      { name: "deleted", type: "INTEGER", defaultValue: 0, notNull: true },
      { name: "publisher", type: "TEXT" },
      { name: "year", type: "INTEGER" },
      { name: "genre", type: "TEXT" },
      { name: "description", type: "TEXT" },
    ];

    // Adiciona colunas faltantes
    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`[Database] Adicionando coluna faltante: ${col.name}`);
        gameTable.columns.push({
          name: col.name,
          type: col.type,
          defaultValue: col.defaultValue,
          notNull: col.notNull,
        });

        // Adiciona valores padrão aos registros existentes se a coluna tem um padrão
        if (col.defaultValue !== undefined) {
          gameTable.records.forEach((record) => {
            record[col.name] = col.defaultValue;
          });
        }
      }
    }

    // Atualiza valores NULL de created_at e updated_at
    const now = new Date().toISOString();
    if (columnNames.includes("created_at")) {
      gameTable.records.forEach((record) => {
        if (record.created_at === null || record.created_at === undefined) {
          record.created_at = now;
        }
      });
    }

    if (columnNames.includes("updated_at")) {
      gameTable.records.forEach((record) => {
        if (record.updated_at === null || record.updated_at === undefined) {
          record.updated_at = now;
        }
      });
    }
  }

  // Verifica/cria tabela game_session
  if (!db.tables.has("game_session")) {
    console.log("[Database] Criando tabela game_session em memória...");

    const sessionTable: Table = {
      name: "game_session",
      columns: [
        { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true }, // ID único da sessão
        {
          name: "game_id",
          type: "INTEGER",
          notNull: true,
          foreignKey: { table: "game", column: "id" }, // Referência ao jogo
        },
        { name: "minutes", type: "INTEGER", notNull: true }, // Minutos jogados na sessão
        { name: "note", type: "TEXT" }, // Nota opcional da sessão
        { name: "played_at", type: "TEXT", notNull: true }, // Quando foi jogado
        { name: "created_at", type: "TEXT", notNull: true }, // Timestamp de criação
      ],
      records: [],
      autoIncrementValue: 1,
    };

    db.tables.set("game_session", sessionTable);
  }

  console.log("[Database] Tabelas em memória criadas/atualizadas com sucesso");
}

/**
 * Obtém a instância do banco de dados
 */
export function getDb(): InMemoryDatabase {
  if (!inMemoryDb) {
    throw new Error(
      "Banco de dados não inicializado. Chame initDatabase() primeiro."
    );
  }
  return inMemoryDb;
}

/**
 * Executa uma consulta SQL simulada contra o banco em memória
 */
export async function queryAsync<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const db = getDb();
    const result = executeQuery<T>(sql, params);
    return result || [];
  } catch (error) {
    console.error(`[Database] Erro na consulta: ${sql}`, error);
    throw error;
  }
}

/**
 * Obtém o primeiro resultado de uma consulta
 */
export async function getFirstAsync<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | undefined> {
  const results = await queryAsync<T>(sql, params);
  return results.length > 0 ? results[0] : undefined;
}

/**
 * Executa um comando SQL
 */
export async function executeAsync(
  sql: string,
  params: any[] = []
): Promise<void> {
  try {
    executeQuery(sql, params);
  } catch (error) {
    console.error(`[Database] Erro ao executar: ${sql}`, error);
    throw error;
  }
}

/**
 * Insere um registro em uma tabela
 */
export async function insertAsync(
  table: string,
  data: Record<string, any>
): Promise<number> {
  try {
    const db = getDb();

    if (!db.tables.has(table)) {
      throw new Error(`Tabela '${table}' não existe`);
    }

    const tableData = db.tables.get(table)!;

    // Filtra valores undefined
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        filteredData[key] = value === null ? null : value;
      }
    }

    // Adiciona valores padrão para colunas faltantes
    tableData.columns.forEach((column) => {
      if (
        column.defaultValue !== undefined &&
        filteredData[column.name] === undefined
      ) {
        filteredData[column.name] = column.defaultValue;
      }
    });

    // Trata auto incremento para chave primária
    const primaryKeyColumn = tableData.columns.find(
      (col) => col.primaryKey && col.autoIncrement
    );
    if (primaryKeyColumn) {
      filteredData[primaryKeyColumn.name] = tableData.autoIncrementValue++;
    }

    // Adiciona o registro
    tableData.records.push(filteredData);

    // Retorna o ID do registro inserido
    return primaryKeyColumn ? filteredData[primaryKeyColumn.name] : 0;
  } catch (error) {
    console.error(`[Database] Erro ao inserir na tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Atualiza registros em uma tabela
 */
export async function updateAsync(
  table: string,
  data: Record<string, any>,
  whereClause: string,
  whereParams: any[] = []
): Promise<void> {
  try {
    const db = getDb();

    if (!db.tables.has(table)) {
      throw new Error(`Tabela '${table}' não existe`);
    }

    const tableData = db.tables.get(table)!;

    // Filtra valores undefined
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        filteredData[key] = value === null ? null : value;
      }
    }

    // Aplica cláusula WHERE (implementação simplificada)
    const matchingRecords =
      whereClause === "1=1"
        ? tableData.records
        : filterRecordsByWhereClause(
            tableData.records,
            whereClause,
            whereParams
          );

    // Atualiza registros correspondentes
    matchingRecords.forEach((record) => {
      Object.entries(filteredData).forEach(([key, value]) => {
        record[key] = value;
      });
    });
  } catch (error) {
    console.error(`[Database] Erro ao atualizar tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Executa uma consulta SQL simulada
 */
function executeQuery<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();

  // Parser SQL muito básico (implementação simplificada)
  sql = sql.trim();

  // Trata consultas SELECT
  if (sql.toUpperCase().startsWith("SELECT")) {
    return executeSelectQuery<T>(sql, params);
  }

  // Trata consultas INSERT
  if (sql.toUpperCase().startsWith("INSERT INTO")) {
    executeInsertQuery(sql, params);
    return [] as T[];
  }

  // Trata consultas UPDATE
  if (sql.toUpperCase().startsWith("UPDATE")) {
    executeUpdateQuery(sql, params);
    return [] as T[];
  }

  // Trata consultas especiais
  if (sql.includes("last_insert_rowid()")) {
    // Encontra o valor mais recente do auto incremento
    let lastId = 0;
    for (const table of db.tables.values()) {
      if (table.autoIncrementValue > 1) {
        lastId = Math.max(lastId, table.autoIncrementValue - 1);
      }
    }
    return [{ id: lastId }] as unknown as T[];
  }

  // Trata verificação se tabelas existem (PRAGMA, etc.)
  if (sql.includes("sqlite_master")) {
    const tableNameMatch = /name='(\w+)'/.exec(sql);
    if (tableNameMatch) {
      const tableName = tableNameMatch[1];
      if (db.tables.has(tableName)) {
        return [{ name: tableName }] as unknown as T[];
      }
      return [] as T[];
    }
  }

  // Trata PRAGMA table_info
  if (sql.includes("PRAGMA table_info")) {
    const tableNameMatch = /table_info\((\w+)\)/.exec(sql);
    if (tableNameMatch) {
      const tableName = tableNameMatch[1];
      if (db.tables.has(tableName)) {
        const table = db.tables.get(tableName)!;
        return table.columns.map((col, index) => ({
          cid: index, // ID da coluna
          name: col.name, // Nome da coluna
          type: col.type, // Tipo da coluna
          notnull: col.notNull ? 1 : 0, // Se não permite nulo
          dflt_value: col.defaultValue, // Valor padrão
          pk: col.primaryKey ? 1 : 0, // Se é chave primária
        })) as unknown as T[];
      }
    }
    return [] as T[];
  }

  // Trata ALTER TABLE (adicionar coluna)
  if (
    sql.toUpperCase().startsWith("ALTER TABLE") &&
    sql.toUpperCase().includes("ADD COLUMN")
  ) {
    const matches =
      /ALTER TABLE (\w+) ADD COLUMN (\w+) ([A-Z0-9\s]+)(?:DEFAULT (.+))?/.exec(
        sql
      );
    if (matches) {
      const [_, tableName, columnName, columnType, defaultValue] = matches;
      if (db.tables.has(tableName)) {
        const table = db.tables.get(tableName)!;
        // Verifica se a coluna já existe
        if (!table.columns.some((col) => col.name === columnName)) {
          // Adiciona a nova coluna
          table.columns.push({
            name: columnName,
            type: columnType.trim(),
            defaultValue: defaultValue
              ? parseDefaultValue(defaultValue)
              : undefined,
          });

          // Adiciona valor padrão aos registros existentes se especificado
          if (defaultValue) {
            const parsedDefault = parseDefaultValue(defaultValue);
            table.records.forEach((record) => {
              record[columnName] = parsedDefault;
            });
          }
        }
      }
    }
    return [] as T[];
  }

  // Se nada correspondeu, retorna resultado vazio
  console.warn(`[Database] Consulta não tratada: ${sql}`);
  return [] as T[];
}

/**
 * Executa uma consulta SELECT
 */
function executeSelectQuery<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();

  // Implementação muito básica - em cenário real precisaria de parser SQL adequado
  let tableName = "";
  let whereClause = "";

  // Extrai nome da tabela (abordagem muito simplificada)
  const fromMatch = /FROM\s+(\w+)/i.exec(sql);
  if (fromMatch) {
    tableName = fromMatch[1];
  }

  // Extrai cláusula WHERE se presente
  const whereMatch = /WHERE\s+(.+)(?:$|ORDER|LIMIT)/i.exec(sql);
  if (whereMatch) {
    whereClause = whereMatch[1].trim();
  }

  if (!tableName || !db.tables.has(tableName)) {
    return [] as T[];
  }

  const table = db.tables.get(tableName)!;

  // Aplica cláusula WHERE se presente
  let results = whereClause
    ? filterRecordsByWhereClause(table.records, whereClause, params)
    : [...table.records];

  // Trata SELECT * vs colunas específicas
  if (!sql.toUpperCase().startsWith("SELECT *")) {
    const columnsMatch = /SELECT\s+(.+?)\s+FROM/i.exec(sql);
    if (columnsMatch) {
      const columns = columnsMatch[1].split(",").map((c) => c.trim());
      results = results.map((record) => {
        const newRecord: Record<string, any> = {};
        columns.forEach((col) => {
          // Trata alias 'AS'
          const colParts = col.split(/\s+AS\s+/i);
          const colName = colParts[0].trim();
          const aliasName = colParts.length > 1 ? colParts[1].trim() : colName;
          newRecord[aliasName] = record[colName];
        });
        return newRecord;
      });
    }
  }

  return results as T[];
}

/**
 * Executa uma consulta INSERT
 */
function executeInsertQuery(sql: string, params: any[] = []): void {
  const db = getDb();

  // Analisa INSERT INTO tableName (col1, col2, ...) VALUES (?, ?, ...)
  const tableMatch =
    /INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i.exec(sql);
  if (tableMatch) {
    const tableName = tableMatch[1];
    const columns = tableMatch[2].split(",").map((c) => c.trim());

    if (!db.tables.has(tableName)) {
      throw new Error(`Tabela '${tableName}' não existe`);
    }

    const table = db.tables.get(tableName)!;
    const newRecord: Record<string, any> = {};

    // Trata auto incremento para chave primária
    const primaryKeyColumn = table.columns.find(
      (col) => col.primaryKey && col.autoIncrement
    );
    if (primaryKeyColumn && !columns.includes(primaryKeyColumn.name)) {
      newRecord[primaryKeyColumn.name] = table.autoIncrementValue++;
    }

    // Aplica valores das colunas a partir dos parâmetros
    columns.forEach((col, index) => {
      newRecord[col] = params[index];
    });

    // Adiciona valores padrão para colunas faltantes
    table.columns.forEach((column) => {
      if (
        column.defaultValue !== undefined &&
        newRecord[column.name] === undefined
      ) {
        newRecord[column.name] = column.defaultValue;
      }
    });

    table.records.push(newRecord);
  }
}

/**
 * Executa uma consulta UPDATE
 */
function executeUpdateQuery(sql: string, params: any[] = []): void {
  const db = getDb();

  // Analisa UPDATE tableName SET col1 = ?, col2 = ? WHERE ...
  const updateMatch = /UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i.exec(
    sql
  );
  if (updateMatch) {
    const tableName = updateMatch[1];
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3] || "";

    if (!db.tables.has(tableName)) {
      throw new Error(`Tabela '${tableName}' não existe`);
    }

    const table = db.tables.get(tableName)!;

    // Analisa cláusula SET
    const setClauses = setClause.split(",").map((c) => c.trim());
    const setColumns = setClauses.map((clause) => {
      const parts = clause.split("=").map((p) => p.trim());
      return parts[0];
    });

    // Determina quantos parâmetros são para SET vs WHERE
    const setParamsCount = setColumns.length;
    const setParams = params.slice(0, setParamsCount);
    const whereParams = params.slice(setParamsCount);

    // Encontra registros para atualizar
    const recordsToUpdate = whereClause
      ? filterRecordsByWhereClause(table.records, whereClause, whereParams)
      : table.records;

    // Aplica atualizações
    recordsToUpdate.forEach((record) => {
      setColumns.forEach((col, index) => {
        record[col] = setParams[index];
      });
    });
  }
}

/**
 * Filtra registros baseado em uma cláusula WHERE
 */
function filterRecordsByWhereClause(
  records: Record<string, any>[],
  whereClause: string,
  params: any[]
): Record<string, any>[] {
  // Implementação muito simplificada que trata casos básicos
  // Uma implementação real precisaria de parser SQL adequado

  // Substitui parâmetros na cláusula WHERE
  let paramIndex = 0;
  const processedClause = whereClause.replace(/\?/g, () => {
    const param = JSON.stringify(params[paramIndex++]);
    return param;
  });

  // Casos muito simples de tratamento
  if (processedClause.includes("=")) {
    const [column, value] = processedClause.split("=").map((p) => p.trim());
    // Trata caso especial IS NULL
    if (value.toUpperCase() === "NULL" || value.toUpperCase() === "IS NULL") {
      return records.filter(
        (record) => record[column] === null || record[column] === undefined
      );
    }

    // Remove aspas de valores string
    const parsedValue =
      value.startsWith('"') || value.startsWith("'")
        ? JSON.parse(value)
        : value;

    return records.filter(
      (record) => String(record[column]) === String(parsedValue)
    );
  }

  // Caso padrão - se não conseguir analisar, retorna todos os registros
  return [...records];
}

/**
 * Analisa valor padrão da sintaxe SQL
 */
function parseDefaultValue(defaultStr: string): any {
  defaultStr = defaultStr.trim();

  // Trata valores numéricos
  if (/^-?\d+$/.test(defaultStr)) {
    return parseInt(defaultStr, 10);
  }

  if (/^-?\d+\.\d+$/.test(defaultStr)) {
    return parseFloat(defaultStr);
  }

  // Trata valores string (remove aspas)
  if (
    (defaultStr.startsWith("'") && defaultStr.endsWith("'")) ||
    (defaultStr.startsWith('"') && defaultStr.endsWith('"'))
  ) {
    return defaultStr.substring(1, defaultStr.length - 1);
  }

  // Trata boolean
  if (defaultStr.toLowerCase() === "true") return true;
  if (defaultStr.toLowerCase() === "false") return false;

  // Trata NULL
  if (defaultStr.toUpperCase() === "NULL") return null;

  // Caso padrão
  return defaultStr;
}
