import { Pressable, PressableProps, Text, View } from "react-native";

type Props = PressableProps & {
  data: {
    nome: string;
    dosagem: string;
  };
  onDelete: () => void;
  onOpen: () => void;
};

export function MedicamentoCard({ data, onDelete, onOpen, ...rest }: Props) {
  return (
    <Pressable
      className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 w-full mb-4"
      {...rest}
    >
      {/* Informações do medicamento */}
      <Text className="text-xl font-extrabold text-gray-800 mb-1">
        {data.nome}
      </Text>
      <Text className="text-md text-gray-500 mb-4">
        Dosagem:{" "}
        <Text className="font-semibold text-gray-700">{data.dosagem}</Text>
      </Text>

      {/* Botões */}
      <View className="flex-row justify-end space-x-2">
        <Pressable
          onPress={onOpen}
          className="px-4 py-2 rounded-xl bg-blue-600 mx-2"
        >
          <Text className="text-white font-semibold">Abrir</Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          className="px-4 py-2 rounded-xl bg-red-500 mx-2"
        >
          <Text className="text-white font-semibold">Deletar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
