import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import { useEffect } from "react";

import { Button, Text, View } from "react-native";

export default function Index() {
  async function requestUserPermission() {
    const settings = await notifee.getNotificationSettings();

    if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
      await notifee.requestPermission();
    }
  }

  async function createChannelId() {
    const channelId = await notifee.createChannel({
      id: "test",
      name: "Medicamentos",
      vibration: true,
      importance: AndroidImportance.HIGH,
    });

    return channelId;
  }

  async function displayNotification() {
    await requestUserPermission();

    const channelId = await createChannelId();

    await notifee.displayNotification({
      id: "200",
      title: "Lembreeeeete!",
      body: "Está na hora de tomar seu <strong>medicamento</strong>.",
      android: {
        channelId,
      },
    });
  }

  // Para atualizar, basta reenviar a notificação com o mesmo ID
  async function updateNotification() {
    await requestUserPermission();

    const channelId = await createChannelId();

    await notifee.displayNotification({
      id: "200",
      title: "Lembrete!",
      body: "Está na hora de tomar seu <strong>medicamento</strong>.",
      android: {
        channelId,
      },
    });
  }

  async function cancelNotification() {
    await notifee.cancelNotification("200");
  }

  // Notificações agendadas geram um ID automático
  async function scheduleNotification() {
    await requestUserPermission();

    const date = new Date(Date.now());
    date.setSeconds(date.getSeconds() + 10);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    const channelId = await createChannelId();

    await notifee.createTriggerNotification(
      {
        title: "Lembrete agendado!",
        body: "Esta é uma notificação agendada.",
        android: {
          channelId,
        },
      },
      trigger
    );
  }

  function listScheduledNotifications() {
    notifee.getTriggerNotifications().then((notifications) => {
      console.log(
        "Notificações agendadas:\n",
        JSON.stringify(notifications, null, 2)
      );
    });
  }

  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log("Usuário descartou a notificação", detail.notification);
          break;
        case EventType.PRESS:
          console.log("Usuário pressionou a notificação", detail.notification);
          break;
      }
    });
  }, []);

  useEffect(() => {
    return notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log("Usuário pressionou a notificação", detail.notification);
      }
    });
  }, []);

  return (
    <View>
      <Text>
        Volta o cão arrependido, com suas orelhas tão fartas, com seu osso roído
        e com o rabo entre as patas.
      </Text>
      <Button title="Enviar notificação" onPress={displayNotification} />
      <Button title="Atualizar notificação" onPress={updateNotification} />
      <Button title="Cancelar notificação" onPress={cancelNotification} />
      <Button title="Agendar notificação" onPress={scheduleNotification} />
      <Button
        title="Listar notificações agendadas"
        onPress={listScheduledNotifications}
      />
    </View>
  );
}
