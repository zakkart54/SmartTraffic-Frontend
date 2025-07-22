import "../global.css";
import React from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/useAuth";

export default function Layout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}