import { Text, View } from "react-native";

interface MedicamentoAlarmeProps {
  readonly horario: string;
  readonly dias: string[];
}

export default function MedicamentoAlarme({
  horario,
  dias,
}: MedicamentoAlarmeProps) {
  const semana = [
    { sigla: "D", nome: "dom" },
    { sigla: "S", nome: "seg" },
    { sigla: "T", nome: "ter" },
    { sigla: "Q", nome: "qua" },
    { sigla: "Q", nome: "qui" },
    { sigla: "S", nome: "sex" },
    { sigla: "S", nome: "sab" },
  ];

  return (
    <View className="flex-row justify-between items-center py-10 px-4 rounded-3xl mb-4 bg-slate-50">
      {/* Horário */}
      <Text className="text-gray-800 font-semibold text-3xl">{horario}</Text>

      {/* Dias da semana */}
      <View className="flex-row space-x-4">
        {semana.map((dia, index) => {
          const ativo = dias.includes(dia.nome);
          return (
            <View
              key={dia.nome}
              className={`items-center relative ${index !== 0 ? "ml-1" : ""}`}
            >
              {/* Bolinha sobreposta */}
              {ativo && (
                <View className="w-1 h-1 rounded-full bg-sky-500 absolute -top-1" />
              )}
              <Text
                className={`font-semibold ${ativo ? "text-sky-500" : "text-gray-400"}`}
              >
                {dia.sigla}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
