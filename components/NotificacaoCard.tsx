import { NotificacaoComRegistro } from "@/app/(tabs)/notificacoes";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  notificacao: NotificacaoComRegistro;
  onPressTomado?: () => void;
  onPressCard?: () => void;
};

export default function NotificacaoCard({
  notificacao,
  onPressTomado,
  onPressCard,
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

  let labelColor, labelText;
  switch (status) {
    case "tomado":
      labelColor = "bg-fine";
      labelText = "TOMADO";
      break;
    case "atrasado":
      labelColor = "bg-danger";
      labelText = "ATRASADO";
      break;
    default:
      labelColor = "bg-primary";
      labelText = "PENDENTE";
  }

  const isTomado = status === "tomado";
  const buttonColor = isTomado ? "bg-gray-400" : "bg-primary";

  return (
    <View className="flex-row justify-between items-center py-6 px-4 rounded-3xl mb-4 bg-card">
      {/* Toda a área informativa é clicável (abrir imagem) */}
      <TouchableOpacity
        className="flex-row items-center flex-1 mr-4"
        activeOpacity={0.8}
        onPress={onPressCard}
      >
        {notificacao.imagem_uri && (
          <Image
            source={{ uri: notificacao.imagem_uri }}
            className="w-16 h-16 rounded-xl mr-4"
          />
        )}
        <View className="flex-1">
          <Text className="text-main font-semibold text-3xl">
            {notificacao.nome_medicamento}
          </Text>
          <Text className="text-label text-lg mt-1 font-medium">
            {notificacao.dosagem} {notificacao.medida}, às {notificacao.hora}
          </Text>

          <View
            className={`self-start mt-2 px-3 py-1 rounded-full ${labelColor}`}
          >
            <Text className="text-white font-semibold text-sm">
              {labelText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Botão separado para "Tomar" */}
      <TouchableOpacity
        onPress={async () => {
          if (!isTomado) {
            try {
              await onPressTomado?.();
            } catch (error) {
              alert("Erro ao marcar como tomado: " + error);
            }
          }
        }}
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
