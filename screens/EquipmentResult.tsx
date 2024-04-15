import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Button,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { BackIcon, EditIcon, DownArrow } from "../svgs"; // Ensure DownArrow is imported
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";

const db = getFirestore();

interface EquipmentScan {
  id: string;
  class: string;
  imageUrl: string;
}

interface GymItemProps {
  item: string;
  onSelect: (item: string) => void;
}

const EquipmentResult = ({ navigation }: { navigation: any }) => {
  const [equipmentScans, setEquipmentScans] = useState<EquipmentScan[]>([]);
  const [selectedGym, setSelectedGym] = useState("");
  const [gyms, setGyms] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{
    id: string | null;
    class: string;
  }>({ id: null, class: "" });

  useEffect(() => {
    const fetchGyms = async () => {
      const gymsRef = collection(db, "Gyms");
      const q = query(gymsRef, orderBy("created", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedGyms = querySnapshot.docs.map((doc) => doc.id);
        setGyms(fetchedGyms);
        if (fetchedGyms.length > 0) {
          setSelectedGym(fetchedGyms[0]);
        }
      });
      return () => unsubscribe();
    };

    fetchGyms();
  }, []);

  useEffect(() => {
    if (selectedGym) {
      const unsubscribe = onSnapshot(
        query(collection(db, "Gyms", selectedGym, "Scans")),
        (snapshot) => {
          setEquipmentScans(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as { class: string; imageUrl: string }),
            }))
          );
        }
      );
      return () => unsubscribe();
    }
  }, [selectedGym]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "Gyms", selectedGym, "Scans", id));
  };

  const handleEdit = async () => {
    if (currentEdit.id) {
      const scanDoc = doc(db, "Gyms", selectedGym, "Scans", currentEdit.id);
      await updateDoc(scanDoc, { class: currentEdit.class });
      setEditMode(false);
    }
  };

  const GymItem = ({ item, onSelect }: GymItemProps) => {
    return (
      <View style={styles.dropdownItemRow}>
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.itemText}>{item}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any, onPress: any) => {
    // Use the interpolate function to create a smooth transition
    const opacity = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.deleteBox, { opacity }]}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.BackContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageHeader}>Equipment Scan History</Text>
      <View style={styles.gymDropdown}>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.triggerText}>{selectedGym || "Select Gym"}</Text>
          <DownArrow />
        </TouchableOpacity>
        {dropdownVisible && (
          <FlatList
            data={gyms}
            style={styles.dropdownList}
            renderItem={({ item }) => (
              <GymItem
                item={item}
                onSelect={(item) => {
                  setSelectedGym(item);
                  setDropdownVisible(false);
                }}
              />
            )}
            keyExtractor={(item) => item} // Assuming item names are unique
          />
        )}
      </View>
      <FlatList
        data={equipmentScans}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Swipeable
            key={index}
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, () => handleDelete(item.id))
            }
            friction={1}
          >
            <View style={styles.scanRow}>
              <Image source={{ uri: item.imageUrl }} style={styles.scanImage} />
              <Text style={styles.scanText}>{item.class}</Text>
              <TouchableOpacity
                onPress={() => {
                  setCurrentEdit({ id: item.id, class: item.class });
                  setEditMode(true);
                }}
              >
                <EditIcon />
              </TouchableOpacity>
            </View>
          </Swipeable>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={editMode}
        onRequestClose={() => {
          setEditMode(false);
        }}
      >
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={() => {
            setEditMode(false);
          }}
        >
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              onChangeText={(text) =>
                setCurrentEdit((prev) => ({ ...prev, class: text }))
              }
              value={currentEdit.class}
            />
            <Button title="Save" onPress={handleEdit} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  BackContainer: {
    alignItems: "flex-start",
    marginLeft: "5%",
    marginTop: "2%",
  },
  pageHeader: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#ffffff33",
    borderBottomWidth: 1,
    paddingVertical: 10, // Adjust as needed for spacing
    height: 150,
  },
  scanImage: {
    height: 135,
    width: 100,
    marginRight: 10,
  },
  scanText: {
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
    fontSize: 18,
    flex: 1,
  },
  deleteBox: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 150,
    width: 100,
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    padding: 25,
    fontFamily: "SFProRounded-Light",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%", // Set the width of the modal content
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center", // Center items vertically in the modal
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  gymDropdown: {
    marginHorizontal: 20,
  },
  dropdownTrigger: {
    flexDirection: "row", // Ensures the text and the arrow are on the same line
    alignItems: "center",
    marginTop: "5%",
  },
  triggerText: {
    marginRight: 5,
    fontSize: 18,
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
  },
  dropdownList: {
    borderWidth: 1,
  },
  dropdownItemRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    width: "100%",
  },
  dropdownItem: {
    flex: 1,
  },
  itemText: {
    color: "#fff",
    fontFamily: "SFProRounded-Regular",
    fontSize: 16,
  },
});

export default EquipmentResult;
