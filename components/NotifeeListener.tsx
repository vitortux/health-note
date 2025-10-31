import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import { sendRelatorio } from "@/utils/emailjs";
import notifee, { EventType } from "@notifee/react-native";
import { useEffect } from "react";

export default function NotifeeListener() {
  const { getDailyReport } = useRegistroMedicamentosTable();

  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(
      async ({ type, detail }) => {
        if (
          type === EventType.DELIVERED &&
          detail.notification?.id === "auto_send_email"
        ) {
          const report = await getDailyReport(new Date());
          await sendRelatorio(report);
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
