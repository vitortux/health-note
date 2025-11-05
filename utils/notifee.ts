import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
  AndroidStyle,
} from "@notifee/react-native";

interface NotificationData {
  id?: string;
  timestamp?: number;
  title: string;
  body: string;
  nome_medicamento: string;
  dosagem: number;
  medida: string;
  hora_prevista: string;
  imagem_uri: string;
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

  const notfTitle = `💊 Hora do medicamento: ${data.nome_medicamento}`;
  const notfBody = `Tomar ${data.dosagem} ${data.medida} às ${data.hora_prevista}`;

  const notifeeId = await notifee.createTriggerNotification(
    {
      title: notfTitle,
      body: notfBody,
      data: {
        nome_medicamento: data.nome_medicamento,
        dosagem: data.dosagem,
        medida: data.medida,
        hora_prevista: data.hora_prevista,
        imagem_uri: data.imagem_uri,
      },
      android: {
        channelId,
        loopSound: true,
        ongoing: true,
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: data.imagem_uri,
        },
        pressAction: {
          id: "default",
          launchActivity: "default",
          mainComponent: "MainScreen",
        },
      },
    },
    trigger
  );

  return notifeeId;
}

export async function scheduleDailyReportNotification() {
  await requestUserPermission();

  const now = new Date();
  const nextMidnight = new Date();

  // Ajusta para amanhã às 00:01
  nextMidnight.setDate(now.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextMidnight.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  const channelId = await createLesserChannelId();

  const notifeeId = await notifee.createTriggerNotification(
    {
      id: "auto_send_email",
      title: "Envio de relatório automático!",
      body: "Seu relatório está sendo enviado para o e-mail do seu responsável.",
      android: {
        channelId,
        ongoing: true,
        pressAction: {
          id: "default",
          launchActivity: "default",
          mainComponent: "MainScreen",
        },
      },
    },
    trigger
  );

  return notifeeId;
}

export async function scheduleDailyComputeNotification() {
  await requestUserPermission();

  const now = new Date();
  const nextMidnight = new Date();

  // Ajusta para amanhã às 00:01
  nextMidnight.setDate(now.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextMidnight.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  const channelId = await createLesserChannelId();

  // Criar notificação apenas para disparar o evento
  const notifeeId = await notifee.createTriggerNotification(
    {
      id: "auto_compute_registros",
      title: "Atualização automática",
      body: "Processando dados do dia anterior...",
      android: {
        channelId,
        ongoing: false,
        pressAction: {
          id: "default",
          launchActivity: "default",
          mainComponent: "MainScreen",
        },
      },
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
