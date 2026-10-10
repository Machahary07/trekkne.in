import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DestinationOverview } from "@trekne/db";
import { supabase } from "@/lib/supabase";
import { must, todayIST, useLoad } from "@/lib/data";
import { F, radius, useBrand } from "@/lib/theme";
import { Icon } from "./icon";
import { Button, Dot, Row, T } from "./ui";

export interface Picked { id: string; name: string; lat: number; lng: number }

/** Full-screen destination chooser with search, showing each place's eco-risk for `day`. */
export function DestinationPicker({ visible, day = todayIST(), onClose, onPick, title = "Choose a destination" }: {
  visible: boolean; day?: string; onClose: () => void; onPick: (d: Picked & { overview: DestinationOverview }) => void; title?: string;
}) {
  const b = useBrand();
  const [q, setQ] = useState("");
  const { data } = useLoad(() => must(supabase.rpc("destination_overview", { on_day: day })), [day]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((d) => !s || d.name.toLowerCase().includes(s) || d.district.toLowerCase().includes(s) || d.state_code.toLowerCase() === s)
      .sort((a, b2) => a.name.localeCompare(b2.name));
  }, [data, q]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: b.bg, padding: 16, gap: 12 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T v="h2">{title}</T>
          <Button title="Close" variant="chip" small onPress={onClose} />
        </Row>
        <Row style={{ backgroundColor: b.surface, borderRadius: radius.pill, paddingHorizontal: 16, borderWidth: 1.5, borderColor: b.line }}>
          <Icon name="search" size={19} color={b.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search places, districts or a state code" placeholderTextColor={b.muted}
            style={{ flex: 1, paddingVertical: 13, fontFamily: F.body, fontSize: 16, color: b.text }} />
        </Row>
        <FlatList
          data={list}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 30 }}
          renderItem={({ item: d }) => (
            <Pressable onPress={() => { onPick({ id: d.id, name: d.name, lat: d.lat, lng: d.lng, overview: d }); onClose(); }}
              style={{ backgroundColor: b.surface, borderRadius: radius.sm, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Dot level={d.risk_level} />
              <View style={{ flex: 1 }}>
                <T v="h3">{d.name}</T>
                <T v="small" muted>{d.district} · {d.state_code}{d.is_lesser_known ? " · lesser-known" : ""}</T>
              </View>
              <T v="mono" muted>{d.risk_score}</T>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
