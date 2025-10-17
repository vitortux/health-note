// components/HorarioDiasPicker.tsx
import WheelPicker, {
  type PickerItem,
  useOnPickerValueChangedEffect,
  useOnPickerValueChangingEffect,
  usePickerControl,
  withPickerControl,
} from "@quidone/react-native-wheel-picker";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ControlPicker = withPickerControl(WheelPicker);

type ControlPickersMap = {
  value1: { item: PickerItem<number> };
  value2: { item: PickerItem<number> };
};

const hours = Array.from({ length: 24 }, (_, i) => ({ value: i }));
const minutes = Array.from({ length: 60 }, (_, i) => ({ value: i }));

interface DateTimePickerProps {
  readonly onChange?: (dias: string[], hora: number, minuto: number) => void;
}

export default function DateTimePicker({ onChange }: DateTimePickerProps) {
  const semana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [value, setValue] = useState({ value1: 0, value2: 0 });

  const pickerControl = usePickerControl<ControlPickersMap>();

  useOnPickerValueChangedEffect(pickerControl, (event) => {
    const novoValor = {
      value1: event.pickers.value1.item.value,
      value2: event.pickers.value2.item.value,
    };
    setValue(novoValor);
    onChange?.(diasSelecionados, novoValor.value1, novoValor.value2);
  });

  useOnPickerValueChangingEffect(pickerControl, (event) => {
    // opcional: lógica de preview
  });

  function toggleDia(dia: string) {
    const novosDias = diasSelecionados.includes(dia)
      ? diasSelecionados.filter((d) => d !== dia)
      : [...diasSelecionados, dia];
    setDiasSelecionados(novosDias);
    onChange?.(novosDias, value.value1, value.value2);
  }

  const descricao = useMemo(() => {
    if (diasSelecionados.length === 0) return "Selecione dias e horário";
    const diasFormatados = diasSelecionados
      .map((d) => d[0].toUpperCase() + d.slice(1))
      .join(", ");
    const hora = String(value.value1).padStart(2, "0");
    const minuto = String(value.value2).padStart(2, "0");
    return `Toda ${diasFormatados} às ${hora}:${minuto}`;
  }, [diasSelecionados, value]);

  return (
    <View>
      {/* Seletor de horário */}
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <ControlPicker
          control={pickerControl}
          pickerName="value1"
          data={hours.map((h) => ({
            value: h.value,
            label: String(h.value).padStart(2, "0"),
          }))}
          value={value.value1}
          width={100}
          enableScrollByTapOnItem
        />
        <ControlPicker
          control={pickerControl}
          pickerName="value2"
          data={minutes.map((m) => ({
            value: m.value,
            label: String(m.value).padStart(2, "0"),
          }))}
          value={value.value2}
          width={100}
          enableScrollByTapOnItem
        />
      </View>

      {/* Label informativa */}
      <Text className="text-gray-700 text-lg mt-3 mb-6">{descricao}</Text>

      {/* Dias da semana */}
      <View className="flex-row justify-between mb-6">
        {semana.map((dia) => {
          const ativo = diasSelecionados.includes(dia);
          return (
            <TouchableOpacity
              key={dia}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                ativo ? "bg-sky-500" : "bg-gray-200"
              }`}
              onPress={() => toggleDia(dia)}
            >
              <Text
                className={`text-base font-bold ${ativo ? "text-white" : "text-gray-700"}`}
              >
                {dia[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
