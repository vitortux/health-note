import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Link href="/" style={styles.button}>
        Voltar para Home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    fontSize: 20,
    marginTop: 20,
    color: "gray",
  },
});
