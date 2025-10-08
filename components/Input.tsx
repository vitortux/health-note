import { TextInput, TextInputProps } from "react-native";

export function Input({ ...rest }: TextInputProps) {
  return <TextInput style={{ backgroundColor: "white" }} {...rest} />;
}

// Depois adicionamos o NativeWind para estilizar
