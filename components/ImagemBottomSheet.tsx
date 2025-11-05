import { useConfig } from "@/context/ConfigContext";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { Image, Text } from "react-native";

type Ref = BottomSheet;

interface ImagemBottomSheetProps {
  imagemUri: string | null;
}

const ImagemBottomSheet = forwardRef<Ref, ImagemBottomSheetProps>(
  function ImagemBottomSheet({ imagemUri }, ref) {
    const snapPoints = useMemo(() => ["50%", "80%"], []);
    const { theme } = useConfig();

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

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: theme === "dark" ? "#1a1a1a" : "#f3f4f6",
        }}
        handleIndicatorStyle={{
          backgroundColor: theme === "dark" ? "#fff" : "#000",
        }}
      >
        <BottomSheetView className="flex-1 justify-center items-center bg-card">
          <Text className="text-main font-bold text-2xl mb-4">
            Imagem do medicamento
          </Text>
          <Image
            source={{ uri: imagemUri }}
            className="w-full h-80 rounded-2xl" // agora ocupa toda a largura e altura maior
            resizeMode="contain"
          />
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default ImagemBottomSheet;
