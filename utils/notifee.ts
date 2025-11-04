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
    id: "alarmes-health-note",
    name: "Medicamentos",
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: "alarme",
  });

  return channelId;
}

async function createLesserChannelId() {
  const channelId = await notifee.createChannel({
    id: "mensagens-health-note",
    name: "Notificações",
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
      loopSound: true,
      ongoing: true,
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
      android: {
        channelId,
        loopSound: true,
        ongoing: true,
      },
    },
    trigger
  );

  return notifeeId;
}

export async function scheduleDailyReportNotification() {
  await requestUserPermission();

  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextMidnight.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  const channelId = await createChannelId();

  const notifeeId = await notifee.createTriggerNotification(
    {
      id: "auto_send_email",
      title: "Envio de relatório automático!",
      body: "Seu relatório está sendo enviado para o e-mail do seu responsável.",
      android: { channelId, loopSound: true, ongoing: true },
    },
    trigger
  );

  return notifeeId;
}

export async function displayErrorNotification() {
  await requestUserPermission();

  const channelId = await createLesserChannelId();

  await notifee.displayNotification({
    id: "error_notification",
    title: "Ocorreu um erro no envio de seu relatório",
    body: "Verifique seus dados ou se possui conexão com a internet e tente novamente.",
    android: {
      channelId,
      loopSound: true,
      ongoing: true,
    },
  });
}
