import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const STORAGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({}); //hashmap 같은 것을 만들 것임. array가 아니라 object(key와 value)
  const [editingId, setEditingId] = useState(null); // 수정할 toDo의 id(key)
  const [editingText, setEditingText] = useState(""); // 수정할 text

  //앱을 처음 실행할 때 toDos들이 로드됨.
  useEffect(() => {
    loadToDos(STORAGE_KEY);
    loadWorking(WORKING_KEY);
  }, []);

  const travel = async () => {
    setWorking(false); //여행탭은 false
    await saveWorking(false);
  };
  const work = async () => {
    setWorking(true); //일 탭은 true
    await saveWorking(true);
  };
  const onChangeText = (payload) => setText(payload); //payload는 input에 쓴 나의 글

  //toDo 관련 함수들
  const saveToDos = async (toSave) => {
    try {
      const s = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, s);
    } catch (e) {
      alert("save error");
    }
  };
  const loadToDos = async (STORAGE_KEY) => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(s));
    } catch (e) {
      alert("load error");
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    //save to do
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, compeleted: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    //input란 비우기
    setText("");
  };
  //console.log(toDos);

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      {
        text: "Delete",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
      { text: "Cancel" },
    ]);
  };

  //working 저장관련 함수들
  const saveWorking = async (value) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(value));
    } catch (e) {
      alert("saveWorking error");
    }
  };

  const loadWorking = async () => {
    try {
      const s = await AsyncStorage.getItem(WORKING_KEY);
      setWorking(JSON.parse(s) !== null ? JSON.parse(s) : true); //기본값 true
    } catch (e) {
      alert("loadWorking error");
    }
  };

  //todo 완료 기능
  const compeleteToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].compeleted = !newToDos[key].compeleted; // 상태 토글
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  //todo 수정 기능
  const startEditing = (key) => {
    setEditingId(key); // 수정할 text의 key 저장
    setEditingText(toDos[key].text); //수정할 text로 설정
  };

  const updateToDo = (key) => {
    if (editingText === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[key].text = editingText; //text update
    setToDos(newToDos);
    saveToDos(newToDos);
    setEditingId(null); // 수정 모드 종료
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        {/* Work */}
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>

        {/* Travel */}
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <TextInput
        value={text}
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
        returnKeyType="done"
        placeholder={working ? "Add a new To Do" : "Where do you want to go?"}
        style={styles.input}
      />

      {/* ToDo */}
      <ScrollView>
        {/* Object.keys(x) : x의 key들을 배열로 반환함. */}
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              {editingId === key ? (
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  onSubmitEditing={() => updateToDo(key)}
                  style={styles.editInput}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => startEditing(key)}>
                  <Text
                    style={[
                      styles.toDoText,
                      toDos[key].compeleted ? styles.compeletedText : null,
                    ]}
                  >
                    {toDos[key].text}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.toDoActions}>
                <TouchableOpacity onPress={() => compeleteToDo(key)}>
                  {toDos[key].compeleted ? (
                    <MaterialCommunityIcons
                      name="checkbox-marked"
                      size={24}
                      color="white"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="checkbox-blank-outline"
                      size={24}
                      color="white"
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    //backgroundColor: "tomato",
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    //backgroundColor: "green",
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    backgroundColor: "white",
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    //backgroundColor: "green",
  },
  toDoActions: {
    //backgroundColor: "green",
    flexDirection: "row",
    color: "white",
    alignItems: "center",
  },
  compeletedText: {
    textDecorationLine: "line-through",
    color: "lightgray",
  },
  editInput: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "680",
  },
});
