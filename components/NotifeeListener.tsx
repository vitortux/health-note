import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { sendRelatorio } from "@/utils/emailjs";
import notifee, { EventType } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function NotifeeListener() {
  const { gerarRelatorio } = useRegistroMedicamentosTable();

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
          if (!savedEmail) return console.log("E-mail não definido.");
          if (!savedNome) return console.log("E-mail não definido.");
          await sendRelatorio(report, savedEmail, ontem, savedNome);
          // console.log("Vamos economizar e-mails :)");
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
