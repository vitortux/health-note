import { Image, Text, TouchableOpacity, View } from "react-native";

interface RegistroItemProps {
  registro: {
    id_registro: number;
    data: string;
    hora_registro: string | null;
    tomado: 0 | 1 | 2;
    id_notifee: string | null;
    hora_prevista: string | null;
    id_medicamento: number;
    nome_medicamento: string;
    dosagem: number;
    medida: string;
    imagem_uri: string | null;
  };
  onPressImagem?: () => void;
}

function formatMeasure(name: string) {
  const lower = name.toLowerCase();
  return lower === "mg" || lower === "ml"
    ? name.toUpperCase()
    : name.charAt(0).toUpperCase() + name.slice(1);
}

export function RegistroItem({
  registro,
  onPressImagem,
}: Readonly<RegistroItemProps>) {
  // Mapeia status para label e cor
  const statusMap = {
    0: { label: "Não tomou", color: "text-red-500" },
    1: { label: "Tomado", color: "text-green-500" },
    2: { label: "Tomado com atraso", color: "text-yellow-500" },
  };

  const { label: statusLabel, color: statusColor } = statusMap[registro.tomado];

  return (
    <TouchableOpacity
      onPress={onPressImagem}
      className="flex-row items-center p-5 bg-card rounded-3xl mb-3"
    >
      {registro.imagem_uri && (
        <View>
          <Image
            source={{ uri: registro.imagem_uri }}
            className="w-16 h-16 rounded-2xl mr-4"
          />
        </View>
      )}

      <View className="flex-1">
        <Text className="text-main font-semibold text-xl flex-shrink">
          <Text className={`${statusColor} font-bold`}>{statusLabel}</Text>
          {` - "${registro.nome_medicamento}" — ${registro.dosagem} ${formatMeasure(registro.medida)}`}
        </Text>
        <Text className="text-label text-lg mt-1">
          Registro: {registro.hora_registro ?? "—"}, (previsto:{" "}
          {registro.hora_prevista ?? "—"})
        </Text>
      </View>
    </TouchableOpacity>
  );
}
