import { Tabs } from "expo-router";
import { Platform, type ColorValue } from "react-native";
import { Icon, type IconName } from "@/components/icon";
import { useAuth } from "@/lib/auth";
import { F, useBrand } from "@/lib/theme";

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={23} color={String(color)} />,
});

export default function TabsLayout() {
  const b = useBrand();
  const { can } = useAuth();
  const field = can("reports.field") || can("panoramas.create");
  const community = can("heritage.propose");
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: b.orange,
        tabBarInactiveTintColor: b.muted,
        tabBarLabelStyle: { fontFamily: F.semibold, fontSize: 11, lineHeight: 14 },
        // Web has no safe-area inset to pad the labels, so give the bar room there.
        tabBarStyle: { backgroundColor: b.surface, borderTopColor: b.line, ...(Platform.OS === "web" ? { height: 64, paddingBottom: 8, paddingTop: 4 } : null) },
      }}
    >
      <Tabs.Screen name="index" options={tab("Home", "home")} />
      <Tabs.Screen name="explore" options={tab("Explore", "map")} />
      <Tabs.Screen name="plan" options={tab("Plan", "route")} />
      <Tabs.Screen name="ranger" options={{ ...tab("Ranger", "shield"), href: field ? undefined : null }} />
      <Tabs.Screen name="community" options={{ ...tab("Village", "flag"), href: community ? undefined : null }} />
      <Tabs.Screen name="profile" options={tab("Profile", "user")} />
    </Tabs>
  );
}
