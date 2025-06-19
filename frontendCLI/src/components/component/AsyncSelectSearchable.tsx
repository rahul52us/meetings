import React, { useEffect, useState } from "react";
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
  [key: string]: any;
};

type Props = {
  label?: string;
  selectedValue: Option | null;
  defaultOptions?: Option[];
  fetchOptions: (query: string) => Promise<Option[]>;
  onValueChange: (option: Option) => void;
  placeholder?: string;
};

export default function AsyncSelectSearchable({
  label,
  selectedValue,
  defaultOptions = [],
  fetchOptions,
  onValueChange,
  placeholder = "Select an option",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option[]>(defaultOptions);
  const [loading, setLoading] = useState(false);

  const mergeUnique = (base: Option[], incoming: Option[]) => {
    const map = new Map<string, Option>();
    [...base, ...incoming].forEach((opt) => map.set(opt.value, opt));
    return Array.from(map.values());
  };

  const fetchAndUpdateOptions = async (text: string) => {
    setLoading(true);
    try {
      const results = await fetchOptions(text);
      const merged = mergeUnique(options, results);
      setOptions(merged);
    } catch (err) {
      console.error("Error fetching options:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const delayDebounce = setTimeout(() => {
      if (search.trim() === "") {
        setOptions((prev) => mergeUnique(prev, defaultOptions));
      } else {
        fetchAndUpdateOptions(search.trim());
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [search, isOpen]);

  const handleSelect = (option: Option) => {
    setOptions((prev) => mergeUnique(prev, [option]));
    onValueChange(option);
    setIsOpen(false);
    setSearch("");
  };

  const selectedLabel = selectedValue?.label || "";

  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.selectBox} onPress={() => setIsOpen(true)}>
        <Text style={selectedLabel ? styles.value : styles.placeholder}>
          {selectedLabel || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label || "Select Option"}</Text>
            <Pressable onPress={() => setIsOpen(false)}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

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

          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue?.value;
                return (
                  <TouchableOpacity
                    style={[styles.option, isSelected && styles.selectedOption]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<Text style={styles.noResult}>No options found</Text>}
            />
          )}

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
  loading: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "#555",
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
