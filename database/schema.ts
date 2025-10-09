import { type SQLiteDatabase } from "expo-sqlite";

export async function initialize(database: SQLiteDatabase) {
  await database.execAsync("DROP TABLE IF EXISTS medicamentos;");
  await database.execAsync("DROP TABLE IF EXISTS medicamento_horarios;");

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      medicamento_id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      dosagem TEXT NOT NULL,
      foto TEXT
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS medicamento_horarios (
      horario_id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicamento_id INTEGER NOT NULL,
      dia_semana INTEGER,
      hora TEXT,
      FOREIGN KEY(medicamento_id) REFERENCES medicamentos(medicamento_id)
    );
  `);
}

// CREATE TABLE IF NOT EXISTS horario (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   medicamento_id INTEGER NOT NULL,
//   hora TEXT NOT NULL, -- ex: "08:00"
//   FOREIGN KEY (medicamento_id) REFERENCES medicamento(id) ON DELETE CASCADE
// );

// Provavelmente vamos ter que criar uma tabela de horários e linkar com a tabela de medicamentos, já que um medicamento pode ter mais de um horário
