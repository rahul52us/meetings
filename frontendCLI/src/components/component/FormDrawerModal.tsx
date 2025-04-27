import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";
import { Box } from "native-base";

interface DrawerModalProps {
  visible: boolean;
  isLoading: boolean;
  data: any;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

type FieldType = "text" | "date" | "number" | "select";

interface FieldConfig {
  type: FieldType;
  options?: string[];
}

const DEFAULT_FIELDS: Record<string, string> = {
  name: "",
  designation: "",
  company: "",
  dob: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

const REQUIRED_KEYS = ["email", "dob", "company", "phone"];

const FormDrawerModal: React.FC<DrawerModalProps> = ({
  isLoading,
  visible,
  data,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({ ...DEFAULT_FIELDS, ...data });
  const [fieldTypes, setFieldTypes] = useState<Record<string, FieldConfig>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("text");
  const [selectOptions, setSelectOptions] = useState("");
  const [showFieldTypeDropdown, setShowFieldTypeDropdown] = useState(false);

  useEffect(() => {
    setFormData({ ...DEFAULT_FIELDS, ...data });

    const types: Record<string, FieldConfig> = {};
    Object.keys(DEFAULT_FIELDS).forEach((key) => {
      types[key] =
        key === "dob"
          ? { type: "date" }
          : key === "phone" || key === "pincode"
          ? { type: "number" }
          : { type: "text" };
    });
    setFieldTypes(types);
  }, [data]);

  const handleChange = (key: string, value: string) => {
    if (fieldTypes[key]?.type === "number") {
      value = value.replace(/[^0-9]/g, "");
    }
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateRequiredFields = () => {
    for (const key of REQUIRED_KEYS) {
      if (!formData[key]?.trim()) {
        Alert.alert("Validation Error", `Please fill the required field: ${key}`);
        return false;
      }
    }
    return true;
  };

  const handleAddField = () => {
    const key = newFieldKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key) {
      Alert.alert("Error", "Field name is required.");
      return;
    }
    if (formData.hasOwnProperty(key)) {
      Alert.alert("Error", "Field already exists.");
      return;
    }

    const newField: FieldConfig = { type: newFieldType };
    if (newFieldType === "select") {
      const optionsArray = selectOptions
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);
      if (optionsArray.length === 0) {
        Alert.alert("Error", "Select field must have options.");
        return;
      }
      newField.options = optionsArray;
    }

    setFormData((prev: any) => ({ ...prev, [key]: "" }));
    setFieldTypes((prev) => ({ ...prev, [key]: newField }));
    setNewFieldKey("");
    setNewFieldType("text");
    setSelectOptions("");
    setShowAddModal(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.drawerContent}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Edit Contact Details</Text>
            <Box style={styles.formContainer}>
              {Object.keys(formData).map((key) => {
                const field = fieldTypes[key];
                const value = formData[key];
                return (
                  <View key={key} style={styles.inputGroup}>
                    <Text style={styles.label}>{key.replace(/_/g, " ").toUpperCase()}</Text>
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={(val) => handleChange(key, val)}
                      placeholder={
                        field?.type === "date"
                          ? "DD/MM/YYYY"
                          : field?.type === "number"
                          ? "Enter number"
                          : `Enter ${key}`
                      }
                      keyboardType={
                        field?.type === "number"
                          ? "numeric"
                          : field?.type === "date"
                          ? "numbers-and-punctuation"
                          : "default"
                      }
                    />
                  </View>
                );
              })}
            </Box>

            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addFieldButton}>
              <Text style={styles.buttonText}>+ Add New Field</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                if (validateRequiredFields()) onSave(formData);
              }}
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Field Modal */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.innerModal}>
              <Text style={styles.title}>Add New Field</Text>
              <TextInput
                style={styles.input}
                placeholder="Field name (e.g., hobby)"
                value={newFieldKey}
                onChangeText={setNewFieldKey}
              />
              <View style={styles.fieldTypeWrapper}>
                <Text style={styles.label}>Select Field Type</Text>
                <TouchableOpacity
                  onPress={() => setShowFieldTypeDropdown((prev) => !prev)}
                  style={styles.dropdownButton}
                >
                  <Text style={styles.dropdownButtonText}>
                    {newFieldType.charAt(0).toUpperCase() + newFieldType.slice(1)}
                  </Text>
                </TouchableOpacity>

                {showFieldTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {["text", "number", "date"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => {
                          setNewFieldType(type as FieldType);
                          setShowFieldTypeDropdown(false);
                        }}
                        style={styles.dropdownOption}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleAddField} style={styles.saveButton}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.closeButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  drawerContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  formContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    width: "48%",
  },
  closeButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    width: "48%",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addFieldButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  fieldTypeWrapper: {
    marginTop: 15,
  },
  dropdownButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#444",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    position: "absolute",
    top: 45,
    width: "100%",
  },
  dropdownOption: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    zIndex:999999999,
    backgroundColor:'white'
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#444",
  },
  innerModal: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10
  },
});

export default FormDrawerModal;