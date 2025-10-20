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
      android: {
        channelId,
      },
    },
    trigger
  );

  return notifeeId;
}
