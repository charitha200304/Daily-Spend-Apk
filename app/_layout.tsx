import React from "react"
import { Slot } from "expo-router"
import { AuthProvider } from "@/context/AuthContext"
import { LoaderProvider } from "@/context/LoaderContext"

export default function RootLayout() {
  return (
    <AuthProvider>
      <LoaderProvider>
        <Slot />
      </LoaderProvider>
    </AuthProvider>
  );
}
