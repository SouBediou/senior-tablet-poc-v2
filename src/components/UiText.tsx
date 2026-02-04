import React from "react";
import { Text, TextProps } from "react-native";
import { useTheme } from "@/src/ui/useTheme";

type Variant = "h1" | "title" | "body" | "small";

export function UiText({
  variant = "body",
  muted = false,
  style,
  ...props
}: TextProps & { variant?: Variant; muted?: boolean }) {
  const t = useTheme();
  const size =
    variant === "h1" ? t.font.h1 : variant === "title" ? t.font.title : variant === "small" ? t.font.small : t.font.body;

  return (
    <Text
      {...props}
      style={[
        {
          fontSize: size,
          color: muted ? t.colors.muted : t.colors.text,
          lineHeight: Math.round(size * 1.25),
        },
        style,
      ]}
    />
  );
}
