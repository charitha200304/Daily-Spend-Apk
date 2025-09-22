import { View, Text, SafeAreaView, ActivityIndicator } from "react-native"
import React, { useEffect } from "react"
import { Slot, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { useAuth } from "@/context/AuthContext"

const DashboardLayout = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  console.log("User Data :", user)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading])

  if (loading) {
    return (
      <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Removed Tabs/Footer navigation as per user request */}
      <Slot />
    </SafeAreaView>
  );
}

export default DashboardLayout
