import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { COLORS } from "../../utils/constants";
import Button from "../../components/common/Button";
import AuthService from "../../services/authService";

const OTPVerificationScreen = ({ route, navigation }) => {
  const { mobile, type } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle OTP input
  const handleOTPChange = (value, index) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter complete OTP");
      return;
    }

    setLoading(true);
    const result = await AuthService.verifyOTP(mobile, otpCode);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "OTP verified successfully!");
      // Navigate to KYC screen
      navigation.navigate("KYC");
    } else {
      Alert.alert("Error", result.message);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    const result = await AuthService.sendOTP(mobile);
    if (result.success) {
      Alert.alert("Success", "OTP sent successfully!");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.mobile}>+91 {mobile}</Text>
          </Text>
        </View>

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendTimer > 0}
          >
            <Text
              style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendLinkDisabled,
              ]}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <Button
          title="Verify OTP"
          onPress={handleVerifyOTP}
          loading={loading}
          disabled={loading}
        />

        {/* Edit Mobile Number */}
        <TouchableOpacity
          style={styles.editMobile}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.editMobileText}>Edit Mobile Number</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 24,
  },
  mobile: {
    fontWeight: "600",
    color: COLORS.dark,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: COLORS.gray,
  },
  editMobile: {
    alignSelf: "center",
    marginTop: 16,
  },
  editMobileText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default OTPVerificationScreen;
