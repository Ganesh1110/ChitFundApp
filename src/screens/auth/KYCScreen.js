import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import DocumentPicker from "react-native-document-picker";
import { COLORS } from "../../utils/constants";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthService from "../../services/authService";

const KYCScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    aadhaar: "",
    pan: "",
    address: "",
  });
  const [documents, setDocuments] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    photo: null,
    addressProof: null,
  });

  // Handle image picker
  const pickImage = async (documentType, useCamera = false) => {
    // const options = {
    //   mediaType: "photo",
    //   quality: 0.8,
    //   maxWidth: 1024,
    //   maxHeight: 1024,
    // };
    // try {
    //   const result = useCamera
    //     ? await launchCamera(options)
    //     : await launchImageLibrary(options);
    //   if (result.didCancel) return;
    //   if (result.assets && result.assets[0]) {
    //     setDocuments((prev) => ({
    //       ...prev,
    //       [documentType]: result.assets[0],
    //     }));
    //   }
    // } catch (error) {
    //   Alert.alert("Error", "Failed to pick image");
    // }
  };

  // Handle document picker
  const pickDocument = async (documentType) => {
    // try {
    //   const result = await DocumentPicker.pick({
    //     type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
    //   });
    //   setDocuments((prev) => ({
    //     ...prev,
    //     [documentType]: result[0],
    //   }));
    // } catch (error) {
    //   if (!DocumentPicker.isCancel(error)) {
    //     Alert.alert("Error", "Failed to pick document");
    //   }
    // }
  };

  // Show image picker options
  const showImageOptions = (documentType) => {
    Alert.alert("Select Option", "Choose how you want to upload the document", [
      {
        text: "Take Photo",
        onPress: () => pickImage(documentType, true),
      },
      {
        text: "Choose from Gallery",
        onPress: () => pickImage(documentType, false),
      },
      {
        text: "Pick Document",
        onPress: () => pickDocument(documentType),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Submit KYC
  const handleSubmitKYC = async () => {
    // Validate required fields
    if (!formData.aadhaar || formData.aadhaar.length !== 12) {
      Alert.alert("Error", "Please enter valid 12-digit Aadhaar number");
      return;
    }

    if (!formData.pan || formData.pan.length !== 10) {
      Alert.alert("Error", "Please enter valid 10-character PAN number");
      return;
    }

    if (!documents.aadhaarFront || !documents.aadhaarBack) {
      Alert.alert("Error", "Please upload both sides of Aadhaar card");
      return;
    }

    if (!documents.panCard) {
      Alert.alert("Error", "Please upload PAN card");
      return;
    }

    if (!documents.photo) {
      Alert.alert("Error", "Please upload your photo");
      return;
    }

    // Create FormData
    const data = new FormData();
    data.append("aadhaar_number", formData.aadhaar);
    data.append("pan_number", formData.pan);
    data.append("address", formData.address);

    // Append documents
    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        data.append(key, {
          uri: documents[key].uri,
          type: documents[key].type || "image/jpeg",
          name: documents[key].fileName || `${key}.jpg`,
        });
      }
    });

    setLoading(true);
    const result = await AuthService.uploadKYC(data);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Success",
        "KYC documents uploaded successfully! You will be notified once verified.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Dashboard"),
          },
        ]
      );
    } else {
      Alert.alert("Error", result.message);
    }
  };

  // Document upload component
  const DocumentUpload = ({ title, documentType, required = true }) => (
    <View style={styles.documentSection}>
      <Text style={styles.documentTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => showImageOptions(documentType)}
      >
        {documents[documentType] ? (
          <View style={styles.uploadedContainer}>
            {documents[documentType].uri && (
              <Image
                source={{ uri: documents[documentType].uri }}
                style={styles.uploadedImage}
              />
            )}
            <Text style={styles.uploadedText}>
              {documents[documentType].fileName || "Document uploaded"}
            </Text>
            <Text style={styles.changeText}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Upload {title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your KYC</Text>
          <Text style={styles.subtitle}>
            Please provide your documents for verification
          </Text>
        </View>

        {/* Aadhaar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aadhaar Card Details</Text>
          <Input
            label="Aadhaar Number"
            placeholder="Enter 12-digit Aadhaar number"
            value={formData.aadhaar}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, aadhaar: text }))
            }
            keyboardType="number-pad"
            maxLength={12}
          />
          <DocumentUpload title="Aadhaar Front" documentType="aadhaarFront" />
          <DocumentUpload title="Aadhaar Back" documentType="aadhaarBack" />
        </View>

        {/* PAN Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAN Card Details</Text>
          <Input
            label="PAN Number"
            placeholder="Enter 10-character PAN number"
            value={formData.pan}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, pan: text.toUpperCase() }))
            }
            maxLength={10}
            autoCapitalize="characters"
          />
          <DocumentUpload title="PAN Card" documentType="panCard" />
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Photo</Text>
          <DocumentUpload title="Your Photo" documentType="photo" />
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Proof</Text>
          <Input
            label="Current Address"
            placeholder="Enter your complete address"
            value={formData.address}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, address: text }))
            }
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top" }}
          />
          <DocumentUpload
            title="Address Proof (Utility Bill/Bank Statement)"
            documentType="addressProof"
            required={false}
          />
        </View>

        {/* Important Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>📌 Important Notes:</Text>
          <Text style={styles.noteText}>
            • All documents should be clear and readable{"\n"}• Documents must
            be valid and not expired{"\n"}• Selfie should show your face clearly
            {"\n"}• KYC verification may take 24-48 hours
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="Submit KYC Documents"
          onPress={handleSubmitKYC}
          loading={loading}
          disabled={loading}
        />

        {/* Skip for Now */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.skipText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 16,
  },
  documentSection: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 8,
  },
  required: {
    color: COLORS.danger,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    overflow: "hidden",
  },
  uploadPlaceholder: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "500",
  },
  uploadedContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadedText: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: "500",
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  noteContainer: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 22,
  },
  skipButton: {
    alignSelf: "center",
    marginTop: 16,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "600",
  },
});

export default KYCScreen;
