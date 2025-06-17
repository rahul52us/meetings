import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Pressable,
} from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  selectedValue: string;
  options: Option[];
  onValueChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchableSelect({
  label,
  selectedValue,
  options,
  onValueChange,
  placeholder = "Select an option",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt?.label?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label;

  const handleSelect = (val: string) => {
    onValueChange(val);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.selectBox} onPress={() => setIsOpen(true)}>
        <Text style={selectedLabel ? styles.value : styles.placeholder}>
          {selectedLabel || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label || "Select Option"}</Text>
            <Pressable onPress={() => setIsOpen(false)}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          {/* Option List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.optionList}
            renderItem={({ item }) => {
              const isSelected = item.value === selectedValue;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.selectedOption]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.noResult}>No options found</Text>
            }
          />

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  value: {
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f7f7f7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeText: {
    fontSize: 22,
    color: "#888",
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    color: "#000",
  },
  optionList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedOption: {
    backgroundColor: "#d1fae5",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedText: {
    fontWeight: "bold",
    color: "#065f46",
  },
  noResult: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  cancelBtn: {
    alignItems: "center",
  },
  cancelText: {
    color: "#0f766e",
    fontSize: 16,
    fontWeight: "600",
  },
});
