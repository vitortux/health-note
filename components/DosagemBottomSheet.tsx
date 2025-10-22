import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Ref = BottomSheet;

interface DosagemBottomSheetProps {
  onSelectDose: (dose: string) => void;
}

const Dosagem = ({
  name,
  onPress,
  selected,
}: {
  name: string;
  onPress?: () => void;
  selected?: boolean;
}) => {
  const formatName =
    name.toLowerCase() === "mg" || name.toLowerCase() === "ml"
      ? name.toUpperCase()
      : name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="py-4 border-b border-gray-200"
      activeOpacity={0.6}
    >
      <Text
        className={`text-lg ${
          selected ? "text-sky-500 font-bold" : "text-gray-700"
        }`}
      >
        {formatName}
      </Text>
    </TouchableOpacity>
  );
};

const DosagemBottomSheet = forwardRef<Ref, DosagemBottomSheetProps>(
  function DosagemBottomSheet({ onSelectDose }, ref) {
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      ),
      []
    );

    const [selectedDose, setSelectedDose] = useState<string | null>(null);
    const doses = ["mg", "ml", "unidade", "gotas", "comprimido"];

    const handleSelect = (dose: string) => {
      setSelectedDose(dose);
      onSelectDose(dose);
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
      >
        <BottomSheetView className="flex-1 px-6 pt-6">
          <Text className="text-2xl font-semibold mb-6 text-center text-gray-800">
            Selecione a dosagem
          </Text>

          <View>
            {doses.map((dose) => (
              <Dosagem
                key={dose}
                name={dose}
                selected={dose === selectedDose}
                onPress={() => handleSelect(dose)}
              />
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default DosagemBottomSheet;
