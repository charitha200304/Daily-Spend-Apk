import React from "react"
import { Slot, Stack } from "expo-router"
// import "./../global.css" // REMOVE NativeWind/Tailwind CSS for web safety
import { AuthProvider } from "@/context/AuthContext"
import { LoaderProvider } from "@/context/LoaderContext"

const RootLayout = () => {
  return (
    <LoaderProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </LoaderProvider>
  )
}

export default RootLayout
