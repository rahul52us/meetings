import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Switch as RNPSwitch,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Text,
} from "react-native";
import { Input, FormControl, Radio, Select } from "native-base";
import PhoneInput from "react-native-phone-number-input";
import EyeSVG from "../../../assets/icons/EyeIcon";
import EyeOffSVG from "../../../assets/icons/EyeOff";

interface CustomInputProps {
  type?:
    | "password"
    | "number"
    | "text"
    | "textarea"
    | "radio"
    | "switch"
    | "select"
    | "date"
    | "phone";
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxDate?: Date;
  minDate?: Date;
  name: string;
  onChange?: (value: any) => void;
  value?: any;
  options?: any[];
  disabled?: boolean;
  showError?: boolean;
  maxLength?: any;
  size?: any;
  floatingLabel?: boolean;
  isReadOnly?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  label,
  placeholder,
  error,
  name,
  value,
  onChange,
  required,
  options,
  disabled,
  showError,
  maxDate,
  minDate,
  maxLength,
  size,
  isReadOnly,
  floatingLabel = true,
}) => {
  const [phoneValue, setPhoneValue] = useState(value || "");
  const [showPassword, setShowPassword] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLabelPress = () => {
    inputRef.current?.focus();
  };

  const renderInputComponent = () => {
    switch (type) {
      case "phone":
        return (
          <PhoneInput
            defaultCode="IN"
            layout="first"
            value={value}
            textInputProps={{
              maxLength: 10,
              placeholderTextColor: "#a2a2a2",
            }}
            placeholder={floatingLabel ? undefined : placeholder}
            disabled={disabled}
            onChangeText={(text) => {
              setPhoneValue(text);
              if (onChange) onChange(text);
            }}
            containerStyle={[styles.inputContainer, styles.phoneContainer]}
            textContainerStyle={styles.phoneInput}
            textInputStyle={[styles.input, styles.phoneInputText]}
          />
        );
      case "password":
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input]}
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              editable={!disabled}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleTogglePassword}
              disabled={disabled}
            >
              {showPassword ? <EyeOffSVG />: <EyeSVG />  }
            </TouchableOpacity>
          </View>
        );
      case "number":
        return (
          <Input
            ref={inputRef}
            style={styles.input}
            keyboardType="numeric"
            placeholder={floatingLabel ? undefined : placeholder}
            value={value}
            onChangeText={onChange}
            isDisabled={disabled}
            maxLength={maxLength}
            size={size}
            variant="outline"
            autoComplete="cc-number"
            autoCorrect={false}
            autoCapitalize="none"
          />
        );
      case "text":
        return (
          <TextInput
            ref={inputRef}
            style={[styles.input, isFocused && styles.focusedInput]}
            onFocus={() => setIsFocused(true)}
            placeholder={floatingLabel ? undefined : placeholder}
            value={value}
            onChangeText={onChange}
            // isDisabled={disabled}
            maxLength={maxLength}
            // size={size}
            // variant="outline"
            // borderRadius="lg"
            // isReadOnly={isReadOnly}
          />
        );
      case "textarea":
        return (
          <TextInput
            ref={inputRef}
            multiline
            numberOfLines={3}
            placeholder={floatingLabel ? undefined : placeholder}
            value={value}
            onChangeText={onChange}
            style={[styles.textarea, isFocused && styles.focusedInput]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
          />
        );
      case "radio":
        return (
          <Radio.Group
            name={name}
            value={value}
            isDisabled={disabled}
            onChange={(nextValue) => onChange && onChange(nextValue)}
          >
            {options &&
              options.map((opt: any) => (
                <Radio
                  key={`${name}-${opt.value}`}
                  value={opt.value}
                  my={1}
                  isDisabled={disabled}
                >
                  {opt.label}
                </Radio>
              ))}
          </Radio.Group>
        );
      case "switch":
        return (
          <RNPSwitch
            value={value}
            onValueChange={(val) => onChange && onChange(val)}
            disabled={disabled}
          />
        );
      case "select":
        return (
          <Select
            selectedValue={value}
            style={styles.input}
            onValueChange={onChange}
            placeholder={floatingLabel ? undefined : placeholder}
            isDisabled={disabled}
          >
            {options &&
              options.map((opt: any) => (
                <Select.Item
                  key={`${name}-${opt.value}`}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
          </Select>
        );
      default:
        return (
          <Input
            ref={inputRef}
            style={styles.input}
            placeholder={floatingLabel ? undefined : placeholder}
            value={value}
            onChangeText={onChange}
            isDisabled={disabled}
            maxLength={maxLength}
            size={size}
            variant="outline"
          />
        );
    }
  };

  const labelStyle = {
    position: "absolute" as const,
    left: 14,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [13, -11],
    }),
    backgroundColor: '#fafafb',
    zIndex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", "#000"],
    }),
  };

  return (
    <FormControl isInvalid={!!error && showError}>
      {floatingLabel && (
        <TouchableWithoutFeedback onPress={handleLabelPress}>
          <Animated.Text style={[labelStyle]}>
            {label} {required && "*"}
          </Animated.Text>
        </TouchableWithoutFeedback>
      )}
      {renderInputComponent()}
      {showError && error && (
        <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>
      )}
    </FormControl>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  input: {
    height: 50,
    paddingLeft: 14,
    paddingRight: 40, // Space for the icon
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    // backgroundColor: "white",
    fontSize: 16,
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  phoneContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    height: 60,
  },
  phoneInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 0,
  },
  phoneInputText: {
    fontSize: 18,
  },
  textarea: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: '#a1a1a1',
    borderRadius: 8,
    color: "#000",
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
  },
  focusedInput: {
    borderColor: "#14b8a6", // Teal color on focus
  },
  required: {
    color: "red",
  },
});

export default CustomInput;
