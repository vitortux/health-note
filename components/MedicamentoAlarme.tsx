import { Text, TouchableOpacity, View } from "react-native";

interface MedicamentoAlarmeProps {
  readonly horario: string;
  readonly dias: number[];
  readonly nomeMedicamento: string;
  readonly dosagem: number;
  readonly medida: string;
  readonly onPress: () => void;
}

const formatDoseName = (dose: string) => {
  return dose.toLowerCase() === "mg" || dose.toLowerCase() === "ml"
    ? dose.toUpperCase()
    : dose.charAt(0).toUpperCase() + dose.slice(1);
};

export default function MedicamentoAlarme({
  horario,
  dias,
  nomeMedicamento,
  dosagem,
  medida,
  onPress,
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
    <TouchableOpacity onPress={onPress}>
      <View className="flex-row justify-between items-center py-6 px-4 rounded-3xl mb-4 bg-slate-50">
        {/* Esquerda: horário e info do medicamento */}
        <View>
          <Text className="text-gray-800 font-semibold text-4xl">
            {horario}
          </Text>
          <Text className="text-gray-700 text-lg mt-1 font-medium">
            {nomeMedicamento} — {dosagem} {formatDoseName(medida)}
          </Text>
        </View>

        {/* Direita: dias da semana */}
        <View className="flex-row space-x-4">
          {semana.map((dia, index) => {
            const ativo = dias.includes(index); // compara números agora
            return (
              <View
                key={dia.nome}
                className={`items-center relative ${index !== 0 ? "ml-1" : ""}`}
              >
                {ativo && (
                  <View className="w-1.5 h-1.5 rounded-full bg-sky-500 absolute -top-1" />
                )}
                <Text
                  className={`font-semibold ${
                    ativo ? "text-sky-500" : "text-gray-400"
                  }`}
                >
                  {dia.sigla}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}
