import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import notifee, { EventType } from "@notifee/react-native";
import { useEffect } from "react";

export default function NotifeeListener() {
  const { gerarRelatorioDiario } = useRegistroMedicamentosTable();

  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(
      async ({ type, detail }) => {
        if (
          type === EventType.DELIVERED &&
          detail.notification?.id === "auto_send_email"
        ) {
          // const report = await gerarRelatorioDiario();
          // await sendRelatorio(report);
          console.log("Vamos economizar e-mails :)");
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
