import { type SQLiteDatabase } from "expo-sqlite";

export async function initialize(database: SQLiteDatabase) {
  // await database.execAsync("DROP TABLE IF EXISTS medicamentos;");
  // await database.execAsync("DROP TABLE IF EXISTS medicamento_horarios;");
  // await database.execAsync("DROP TABLE IF EXISTS registro_medicamentos;");

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id_medicamento INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_medicamento TEXT NOT NULL,
      dosagem REAL,
      medida TEXT,
      imagem_uri TEXT
    );

    CREATE TABLE IF NOT EXISTS notificacoes (
      id_notifee TEXT PRIMARY KEY,
      id_medicamento INTEGER NOT NULL,
      hora TEXT,
      dia INT,
      FOREIGN KEY(id_medicamento) REFERENCES medicamentos(id_medicamento) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registro_medicamentos (
      id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
      id_notifee TEXT NOT NULL,
      data TEXT NOT NULL,
      hora TEXT,
      tomado INTEGER NOT NULL,
      UNIQUE(id_notifee, data),
      FOREIGN KEY(id_notifee) REFERENCES notificacoes(id_notifee) ON DELETE CASCADE
    );
  `);
}
