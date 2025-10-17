import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "gray" }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifee"
        options={{
          headerTitle: "Notifee",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medicamentos"
        options={{
          headerTitle: "Medicamentos",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused ? "information-circle" : "information-circle-outline"
              }
              color={color}
              size={20}
            />
          ),
        }}
      />
    </Tabs>
  );
}
