import { useMedicamentosTable } from "@/hooks/useMedicamentosTable";
import { useNotificacoesTable } from "@/hooks/useNotificacoesTable";
import { useRegistroMedicamentosTable } from "@/hooks/useRegistroMedicamentosTable";
import notifee from "@notifee/react-native";
import { Button } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Debug() {
  const medicamentosTable = useMedicamentosTable();
  const notificacoesTable = useNotificacoesTable();
  const registrosTable = useRegistroMedicamentosTable();

  async function clearDatabase() {
    try {
      await medicamentosTable.deleteAll();
      await notificacoesTable.deleteAll();
      await registrosTable.deleteAll();
      await notifee.cancelAllNotifications();

      console.log("Banco de dados limpo com sucesso.");
    } catch (error) {
      console.log("Erro ao limpar o banco de dados:", error);
    }
  }

  async function listDatabase() {
    try {
      console.clear();

      const medicamentos = await medicamentosTable.select("");
      const notificacoes = await notificacoesTable.select("");
      const registros = await registrosTable.selectAll();

      const scheduledNotifs = await notifee.getTriggerNotifications();

      console.group("Banco de dados");
      console.log("💊 Medicamentos:", medicamentos);
      console.log("🔔 Notificações:", notificacoes);
      console.log("📝 Registros:", registros);
      console.log("⏰ Notifee:", scheduledNotifs);
      console.groupEnd();
    } catch (error) {
      console.log("Erro ao buscar dados do banco:", error);
    }
  }

  return (
    <SafeAreaView className="space-y-2">
      <Button className="mb-4" onPress={listDatabase}>
        Listar registros
      </Button>
      <Button className="mb-4" onPress={clearDatabase}>
        Limpar banco de dados
      </Button>
    </SafeAreaView>
  );
}
