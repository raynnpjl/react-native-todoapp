import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "expo-checkbox";
import { useEffect, useState } from "react";
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type taskType = {
  id: number;
  title: string;
  isDone: boolean;
}
 
export default function Index() {
  const [tasks, setTasks] = useState<taskType[]>([]);
  const [taskText, setTaskText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unfTasks, setUnfTasks] = useState<taskType[]>([]);

  useEffect(() => {
    const getTask = async () => {
      try {
        const tasks = await AsyncStorage.getItem('my-task');
        if ( tasks !== null) {
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
      if (taskText.trim() === '') {
        Keyboard.dismiss()
        return;
      }

      const newTask = {
        id: Math.random(),
        title: taskText,
        isDone: false,
      };
      tasks.push(newTask);
      setTasks(tasks);
      setUnfTasks(tasks);
      await AsyncStorage.setItem('my-task', JSON.stringify(tasks));
      setTaskText('');
      Keyboard.dismiss();
    } catch (error) {
      console.log(error)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      const newTasks = tasks.filter((task) => task.id !== id);
      await AsyncStorage.setItem('my-task', JSON.stringify(newTasks));
      setTasks(newTasks);
      setUnfTasks(newTasks);
    } catch (error) {
      console.log(error)
    }
  };

  const taskCheck = async (id: number) => {
    try {
      const newTasks = tasks.map((task) => {
        if (task.id === id) {
          task.isDone = !task.isDone;
        }
        return task
      });
      await AsyncStorage.setItem("my-task", JSON.stringify(newTasks));
      setTasks(newTasks);
      setUnfTasks(newTasks);
    } catch (error) {
      console.log(error)
    }
  };

  const onSearch = (query: string) => {
    if (query == '') {
      setTasks(unfTasks);
    } else {
        const filteredTasks = tasks.filter((task) => 
          task.title.toLowerCase().includes(query.toLowerCase())
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