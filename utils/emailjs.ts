import { EmailJSResponseStatus, send } from "@emailjs/react-native";
import { format } from "date-fns";

export async function sendRelatorio(relatorio: any) {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  let corpoEmail = `📅 Relatório diário - ${format(ontem, "dd/MM/yyyy")}\n\n`;

  if (relatorio.length === 0) {
    corpoEmail += "Nenhum medicamento programado para hoje.";
  } else {
    relatorio.forEach((item) => {
      corpoEmail += `${item.status} — ${item.nome} às ${item.hora}\n`;
    });
  }

  try {
    await send(
      process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        name: "Equipe Health Note",
        email: process.env.EXPO_PUBLIC_TEST_EMAIL!,
        message: corpoEmail,
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
