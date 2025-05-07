import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "expo-checkbox";
import { useEffect, useState } from "react";
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type taskType = { // Create new type - task containing id, title and isDone
  id: number;
  title: string;
  isDone: boolean;
}
 
export default function Index() {
  const [tasks, setTasks] = useState<taskType[]>([]); // State for tasks -  all the task that was created
  const [taskText, setTaskText] = useState<string>(''); // State for "add new task" text
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for text/query in search bar
  const [unfTasks, setUnfTasks] = useState<taskType[]>([]); // State used to log tasks in a "backup" state to update main state when search bar query is cleared

  useEffect(() => { // Runs when app is started up to check for tasks in AsyncStorage
    const getTask = async () => {
      try {
        const tasks = await AsyncStorage.getItem('my-task');
        if ( tasks !== null) { // If task array not empty set task in their respective state
          setTasks(JSON.parse(tasks));
          setUnfTasks(JSON.parse(tasks));
        }
      } catch (error) {
        console.log(error)
      }
    };
    getTask();
  }, [])

  const addTask = async () => {
    try {
      if (taskText.trim() === '') { // Check whether "add new task" text is empty
        Keyboard.dismiss()
        return; // If empty, return and not add task
      }

      const newTask = {
        id: Math.random(),
        title: taskText,
        isDone: false,
      };
      tasks.push(newTask); // Add new task into task array
      setTasks(tasks);
      setUnfTasks(tasks);
      await AsyncStorage.setItem('my-task', JSON.stringify(tasks)); // Add new task into AsyncStorage
      setTaskText('');
      Keyboard.dismiss();
    } catch (error) {
      console.log(error)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      const newTasks = tasks.filter((task) => task.id !== id); // Filter out all task that is not 'deleted'
      await AsyncStorage.setItem('my-task', JSON.stringify(newTasks)); // Update AsyncStorage with filtered task
      setTasks(newTasks);
      setUnfTasks(newTasks);
    } catch (error) {
      console.log(error)
    }
  };

  const taskCheck = async (id: number) => {
    try {
      const newTasks = tasks.map((task) => { // Iterate through each task
        if (task.id === id) { // If task matches ID that pass through
          task.isDone = !task.isDone; // Change boolean value of isDone (toggled), false => true, true => false
        }
        return task
      });
      await AsyncStorage.setItem("my-task", JSON.stringify(newTasks)); // Update AsyncStorage with new task array
      setTasks(newTasks);
      setUnfTasks(newTasks);
    } catch (error) {
      console.log(error)
    }
  };

  const onSearch = (query: string) => {
    if (query == '') { // If search bar is cleared
      setTasks(unfTasks); // Set main task state with 'backup' task array 
    } else {
        const filteredTasks = tasks.filter((task) => 
          task.title.toLowerCase().includes(query.toLowerCase()) // Checks for task matching search query
        );
        setTasks(filteredTasks);
    }
  };

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="menu" size={24} color={'#333'}/>
        </TouchableOpacity>
        <Image 
          source={require('../assets/images/account.png')}
          style={{width: 40, height: 40, borderRadius: 20}}
        />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color={"#333"} />
        <TextInput 
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.searchInput} 
          clearButtonMode="always"
        />
      </View>

      <FlatList 
        data={[...tasks].reverse()} 
        keyExtractor = {(item) => item.id.toString()}
        renderItem = {({ item }) => (
          <TaskItem task={item} deleteTask={deleteTask} taskCheck={taskCheck}/>
        )}
      />

      <KeyboardAvoidingView style={styles.addTask} behavior="padding" keyboardVerticalOffset={10}>
        <TextInput 
          placeholder="Add New Task"
          value={taskText}
          onChangeText={(text) => setTaskText(text)}
          style={styles.taskInput}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => addTask()}>
          <Ionicons name="add" size={34} color={'#fff'} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TaskItem = ({ task, deleteTask, taskCheck } : { task: taskType, deleteTask: (id: number) => void, taskCheck: (id: number) => void }) => (
  <View style={styles.todoContainer}>
            <View style={styles.todoInfoContainer}>
              <Checkbox 
                value={task.isDone}
                color={task.isDone ? "#00FF00" : undefined}
                onValueChange={() => taskCheck(task.id)}
              />
              <Text style={[styles.todoText, task.isDone && { textDecorationLine: "line-through"}]}>
                {task.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={ () => {
                deleteTask(task.id)
                }}
            >
              <Ionicons name="trash" size={24} color={'red'} />
            </TouchableOpacity>
          </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 8,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
    alignItems: 'center',

  },
  searchInput:{
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  todoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  todoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todoText: {
    fontSize: 16,
    color: "#333",
  },
  addTask: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#00FF00',
    padding: 8,
    borderRadius: 10,
    marginLeft: 20,
  }
})