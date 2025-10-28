// components/HorarioDiasPicker.tsx
import { useTheme } from "@/context/ConfigContext";
import WheelPicker, {
  type PickerItem,
  useOnPickerValueChangedEffect,
  useOnPickerValueChangingEffect,
  usePickerControl,
  withPickerControl,
} from "@quidone/react-native-wheel-picker";
import { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ControlPicker = withPickerControl(WheelPicker);

type ControlPickersMap = {
  value1: { item: PickerItem<number> };
  value2: { item: PickerItem<number> };
};

const hours = Array.from({ length: 24 }, (_, i) => ({ value: i }));
const minutes = Array.from({ length: 60 }, (_, i) => ({ value: i }));

interface DateTimePickerProps {
  readonly onChange?: (dias: number[], hora: number, minuto: number) => void;
  readonly initialDias?: number[];
  readonly initialHora?: number;
  readonly initialMinuto?: number;
}

const semana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export default function DateTimePicker({
  onChange,
  initialDias = [],
  initialHora = 0,
  initialMinuto = 0,
}: DateTimePickerProps) {
  const [diasSelecionados, setDiasSelecionados] =
    useState<number[]>(initialDias);

  const [value, setValue] = useState({
    value1: initialHora,
    value2: initialMinuto,
  });

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

  function toggleDia(index: number) {
    const novosDias = diasSelecionados.includes(index)
      ? diasSelecionados.filter((d) => d !== index)
      : [...diasSelecionados, index];
    setDiasSelecionados(novosDias);
    onChange?.(novosDias, value.value1, value.value2);
  }

  const descricao = useMemo(() => {
    if (diasSelecionados.length === 0) return "Selecione dias e horário";

    const diasFormatados = diasSelecionados
      .map((d) => {
        const diaNome = semana[d]; // pega o nome do dia pelo índice
        return diaNome[0].toUpperCase() + diaNome.slice(1);
      })
      .join(", ");

    const hora = String(value.value1).padStart(2, "0");
    const minuto = String(value.value2).padStart(2, "0");

    return `Toda ${diasFormatados} às ${hora}:${minuto}`;
  }, [diasSelecionados, value]);

  useEffect(() => {
    setDiasSelecionados(initialDias);
  }, [initialDias]);

  useEffect(() => {
    setValue({ value1: initialHora, value2: initialMinuto });
  }, [initialHora, initialMinuto]);

  useEffect(() => {
    onChange?.(diasSelecionados, value.value1, value.value2);
  }, [diasSelecionados, value.value1, value.value2]);

  const { theme } = useTheme();

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
          itemTextStyle={{
            color: theme === "dark" ? "#fff" : "#111",
            backgroundColor: theme === "dark" ? "#111" : "#fff",
            borderRadius: 12,
          }}
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
          itemTextStyle={{
            color: theme === "dark" ? "#fff" : "#111",
            backgroundColor: theme === "dark" ? "#111" : "#fff",
            borderRadius: 12,
          }}
        />
      </View>

      {/* Label informativa */}
      <Text className="text-label text-lg mt-3 mb-6">{descricao}</Text>

      {/* Dias da semana */}
      <View className="flex-row justify-between mb-6">
        {semana.map((dia, index) => {
          const ativo = diasSelecionados.includes(index);
          return (
            <TouchableOpacity
              key={dia}
              className={`w-12 h-12 rounded-full items-center justify-center ${ativo ? "bg-primary" : "bg-card"}`}
              onPress={() => toggleDia(index)}
            >
              <Text
                className={`text-base font-bold ${ativo ? "text-white" : "text-label"}`}
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
