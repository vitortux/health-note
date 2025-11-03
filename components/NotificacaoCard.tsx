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

  // Define label e cores de status
  let labelColor, labelText;
  switch (status) {
    case "tomado":
      labelColor = "bg-green-500";
      labelText = "TOMADO";
      break;
    case "atrasado":
      labelColor = "bg-red-500";
      labelText = "ATRASADO";
      break;
    default:
      labelColor = "bg-sky-500";
      labelText = "PENDENTE";
  }

  // Define cor e desabilitação do botão
  const isTomado = status === "tomado";
  const buttonColor = isTomado ? "bg-gray-400" : "bg-sky-500";

  return (
    <View className="flex-row justify-between items-center py-6 px-4 rounded-3xl mb-4 bg-card">
      <View className="flex-row items-center">
        {notificacao.imagem_uri && (
          <Image
            source={{ uri: notificacao.imagem_uri }}
            className="w-16 h-16 rounded-xl mr-4"
          />
        )}
        <View>
          <Text className="text-main font-semibold text-3xl">
            {notificacao.nome_medicamento}
          </Text>
          <Text className="text-label text-lg mt-1 font-medium">
            {notificacao.dosagem} {notificacao.medida}, às {notificacao.hora}
          </Text>

          {/* Label de status */}
          <View
            className={`self-start mt-2 px-3 py-1 rounded-full ${labelColor}`}
          >
            <Text className="text-white font-semibold text-sm">
              {labelText}
            </Text>
          </View>
        </View>
      </View>

      {/* Botão de ação */}
      <TouchableOpacity
        onPress={!isTomado ? onPressTomado : undefined}
        disabled={isTomado}
        className={`px-4 py-2 rounded-full ${buttonColor} ${
          isTomado ? "opacity-60" : "active:opacity-80"
        }`}
      >
        <Text className="text-white font-bold">
          {isTomado ? "TOMADO" : "TOMAR"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
