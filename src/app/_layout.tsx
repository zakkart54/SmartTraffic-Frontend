import "../global.css";
import React from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/useAuth";
import { ThemeProvider } from "../hooks/useTheme";

export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </AuthProvider>
  );
}