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
  if (status === "tomado") bgColor = "bg-sky-500";
  else if (status === "atrasado") bgColor = "bg-red-500";
  else bgColor = "bg-sky-500";

  return (
    <View className="flex-row justify-between items-center py-6 px-4 rounded-3xl mb-4 bg-slate-50">
      <View className="flex-row items-center">
        {notificacao.imagem_uri && (
          <Image
            source={{ uri: notificacao.imagem_uri }}
            className="w-16 h-16 rounded-xl mr-4"
          />
        )}
        <View>
          <Text className="text-gray-800 font-semibold text-4xl">
            {notificacao.nome_medicamento}
          </Text>
          <Text className="text-gray-700 text-lg mt-1 font-medium">
            {notificacao.dosagem} {notificacao.medida}, às {notificacao.hora}
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
