import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native"
import React, { useEffect, useState } from "react"
import { getAllTask, getAllTaskData, getTasksCollection, deleteTask } from "@/services/taskService"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter, useSegments } from "expo-router"
import { Task } from "@/types/task"
import { useLoader } from "@/context/LoaderContext"
import { onSnapshot, query, orderBy } from "firebase/firestore"

const TasksScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const segment = useSegments()
  const router = useRouter()
  const { hideLoader, showLoader } = useLoader()

  const handleFetchData = async () => {
    showLoader()
    await getAllTaskData()
      .then((data) => {
        setTasks(data)
        console.log(data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        hideLoader()
      })
    //  await getAllTask()
    // .then((data) => {
    //   console.log(data)
    // })
    // .catch((err) => {
    //   console.error(err)
    // })
  }

  // useEffect(() => {
  //   handleFetchData()
  // }, [segment])

  useEffect(() => {
    const tasksQuery = query(
      getTasksCollection(),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Task[]
        setTasks(tasksList)
      },
      (error) => {
        console.error("Error getting tasks:", error)
        Alert.alert("Error", "Failed to load tasks")
      }
    )

    return () => unsubscribe()
  }, [])

  const handleDelete = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            showLoader();
            await deleteTask(taskId);
            // Optionally, you can call handleFetchData() or rely on onSnapshot for updates
          } catch (err) {
            console.error("Failed to delete task:", err);
            Alert.alert("Error", "Failed to delete task");
          } finally {
            hideLoader();
          }
        }
      }
    ])
  }

  return (
    <View className="flex-1 w-full justify-center align-items-center">
      <Text className="text-center text-4xl">Tasks screen</Text>
      <View className="absolute bottom-5 right-5 z-40">
        <Pressable
          className="bg-blue-500 rounded-full p-5 shadow-lg"
          onPress={() => {
            router.push("/(dashboard)/tasks/new")
          }}
        >
          <MaterialIcons name="add" size={28} color={"#fff"} />
        </Pressable>
      </View>

      <ScrollView className="mt-4">
        {tasks.map((task) => {
          return (
            <View
              key={task.id}
              className="bg-gray-200 p-4 mb-3 rounded-lg mx-4 border border-gray-400"
            >
              <Text className="text-lg font-semibold">{task.title}</Text>
              <Text className="text-sm text-gray-700 mb-2">
                {task.description}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className="bg-yellow-300 px-3 py-1 rounded"
                  onPress={() => router.push(`/(dashboard)/tasks/${task.id ?? ""}`)}
                >
                  <Text className="text-xl">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-red-500 px-3 py-1 rounded ml-3" onPress={() => handleDelete(task.id ?? "")}>
                  <Text className="text-xl">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

export default TasksScreen
