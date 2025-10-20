import { NotificacaoComRegistro } from "@/app/(tabs)/notificacoes";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  notificacao: NotificacaoComRegistro;
  onPressTomado?: () => void;
};

export default function NotificacaoCard({
  notificacao,
  onPressTomado,
}: Readonly<Props>) {
  function getStatus() {
    if (notificacao.tomado) return "tomado";

    const agora = new Date();
    const [horaStr, minutoStr] = notificacao.hora.split(":");
    const horario = new Date();
    horario.setHours(Number(horaStr), Number(minutoStr), 0, 0);

    const diffMinutos = (agora.getTime() - horario.getTime()) / 1000 / 60;

    if (diffMinutos > 15) return "atrasado";
    return "previsto";
  }

  const status = getStatus();

  let bgColor;
  if (status === "tomado") bgColor = "bg-green-500";
  else if (status === "atrasado") bgColor = "bg-red-500";
  else bgColor = "bg-yellow-400";

  return (
    <View className="bg-white p-4 rounded-xl shadow mb-4 flex-row justify-between items-center">
      <View className="flex-row items-center">
        {notificacao.imagem_uri && (
          <Image
            source={{ uri: notificacao.imagem_uri }}
            className="w-16 h-16 rounded-xl mr-3"
          />
        )}
        <View>
          <Text className="text-lg font-bold">
            {notificacao.nome_medicamento}
          </Text>
          <Text className="text-gray-600">
            {notificacao.dosagem} {notificacao.medida}
          </Text>
          <Text className="text-gray-400 text-sm">
            Hora: {notificacao.hora}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onPressTomado}
        className={`px-4 py-2 rounded-full ${bgColor}`}
      >
        <Text className="text-white font-bold">{status.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
}
