import { View } from "react-native";
import { Screen } from "@/src/components/Screen";
import { UiText } from "@/src/components/UiText";



export default function ContactsScreen() {
  return (
    <Screen>
      <UiText variant="h1" style={{ fontWeight: "900" }}>Contacts</UiText>
      <UiText muted style={{ marginTop: 8 }}>
        Famille & soignants (à venir).
      </UiText>
    </Screen>
  );
}
