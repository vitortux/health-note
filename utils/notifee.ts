import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";

interface NotificationData {
  id?: string;
  title: string;
  body: string;
  timestamp?: number;
  nome_medicamento: string;
  dosagem: number;
  medida: string;
}

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

export async function cancelNotification(id: string) {
  await notifee.cancelNotification(id);
}

export function listScheduledNotifications() {
  notifee.getTriggerNotifications().then((notifications) => {
    console.log(
      "Notificações agendadas:\n",
      JSON.stringify(notifications, null, 2)
    );
  });
}

export async function displayNotification(data: NotificationData) {
  await requestUserPermission();

  const channelId = await createChannelId();

  await notifee.displayNotification({
    id: data.id,
    title: data.title,
    body: data.body,
    data: {
      nome_medicamento: data.nome_medicamento,
      dosagem: data.dosagem,
      medida: data.medida,
    },
    android: {
      channelId,
    },
  });
}

export async function scheduleNotification(data: NotificationData) {
  await requestUserPermission();

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: data.timestamp!,
    repeatFrequency: RepeatFrequency.WEEKLY,
  };

  const channelId = await createChannelId();

  const notifeeId = await notifee.createTriggerNotification(
    {
      title: data.title,
      body: data.body,
      data: {
        nome_medicamento: data.nome_medicamento,
        dosagem: data.dosagem,
        medida: data.medida,
      },
      android: { channelId },
    },
    trigger
  );

  return notifeeId;
}

export async function getProximoMedicamento() {
  const now = Date.now();
  const scheduled = await notifee.getTriggerNotifications();

  const futuros = scheduled.filter(
    (n): n is { trigger: TimestampTrigger; notification: any } =>
      n.trigger.type === TriggerType.TIMESTAMP && n.trigger.timestamp > now
  );

  futuros.sort((a, b) => a.trigger.timestamp - b.trigger.timestamp);

  if (futuros.length === 0) return null;

  const proximo = futuros[0];

  const { nome_medicamento, dosagem, medida } = proximo.notification.data as {
    nome_medicamento: string;
    dosagem: number;
    medida: string;
  };

  const diffMs = proximo.trigger.timestamp - now;
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const data = new Date(proximo.trigger.timestamp);

  return {
    nome_medicamento,
    dosagem,
    medida,
    timestamp: proximo.trigger.timestamp,
    diffDias,
    data: data.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }),
    hora: data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
