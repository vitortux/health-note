import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { sendRelatorio } from "@/utils/emailjs";
import { displayNotification } from "@/utils/notifee";
import notifee, { EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function NotifeeListener() {
  const { gerarRelatorio, computeRegistrosNaoTomados } =
    useRegistroMedicamentosTable();

  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(
      async ({ type, detail }) => {
        if (
          type === EventType.DELIVERED &&
          detail.notification?.id === "auto_send_email"
        ) {
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);
          const report = await gerarRelatorio(ontem);
          const savedEmail = await AsyncStorage.getItem("responsavelEmail");
          const savedNome = await AsyncStorage.getItem("nomeUsuario");
          await sendRelatorio(report, savedEmail!, ontem, savedNome!);
        }

        if (
          type === EventType.DELIVERED &&
          detail.notification?.id === "auto_compute_registros"
        ) {
          const ontem = new Date();
          ontem.setDate(ontem.getDate() - 1);
          try {
            await computeRegistrosNaoTomados(ontem);
          } catch (error) {
            console.error(
              "Erro ao computar registros não tomados automaticamente:",
              error
            );
            notifee.displayNotification({
              id: "error_notification",
              title: "Erro ao processar registros",
              body: "Houve um problema ao atualizar os registros de medicamentos.",
            });
          }
        }
      }
    );

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log("Usuário pressionou a notificação", detail.notification);
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return null;
}
