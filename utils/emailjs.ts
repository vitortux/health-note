import { EmailJSResponseStatus, send } from "@emailjs/react-native";

export async function sendRelatorio() {
  try {
    await send(
      process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        name: "Chaves",
        email: process.env.EXPO_PUBLIC_TEST_EMAIL!,
        message: "This is a static message",
      },
      {
        publicKey: process.env.EXPO_PUBLIC_EMAILJS_USER_ID!,
      }
    );

    console.log("Relatório enviado com sucesso!");
  } catch (err) {
    if (err instanceof EmailJSResponseStatus) {
      console.log("EmailJS Request Failed...", err);
    }

    console.log("ERRO ao enviar relatório: ", err);
  }
}
