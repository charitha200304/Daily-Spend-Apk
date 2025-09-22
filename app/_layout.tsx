import React from "react"
import { Slot, Stack } from "expo-router"
// import "./../global.css" // REMOVE NativeWind/Tailwind CSS for web safety
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
