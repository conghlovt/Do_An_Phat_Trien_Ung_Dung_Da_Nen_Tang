import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getMyProfile,
  updateMyProfile,
} from "@/src/customer/core/api/profile.api";

type GenderValue = "MALE" | "FEMALE" | "OTHER" | null;

export default function ProfileInfoScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const canEdit = isEditMode;

  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<GenderValue>("OTHER");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [dobError, setDobError] = useState("");

  const [avatar, setAvatar] = useState<string | null>(null);

  const validateDob = (d: string, m: string, y: string): string => {
    const hasAnyInput = !!d || !!m || !!y;

    if (!hasAnyInput) return "";

    if (d.length !== 2 || m.length !== 2 || y.length !== 4) {
      return "Vui lòng nhập đầy đủ ngày sinh";
    }

    const dNum = parseInt(d, 10);
    const mNum = parseInt(m, 10);
    const yNum = parseInt(y, 10);

    const date = new Date(yNum, mNum - 1, dNum);

    const isValidDate =
      date.getFullYear() === yNum &&
      date.getMonth() === mNum - 1 &&
      date.getDate() === dNum;

    if (!isValidDate) return "Ngày sinh không tồn tại";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date > today) return "Ngày sinh không được vượt quá ngày hiện tại";

    return "";
  };

  const validateDobWhileTyping = (d: string, m: string, y: string): string => {
    if (d.length < 2 || m.length < 2 || y.length < 4) return "";
    return validateDob(d, m, y);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();

        setNickname(profile.nickname || profile.username || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || "");
        setGender((profile.gender as GenderValue) || "OTHER");

        const dob = profile.dateOfBirth || "";
        setDateOfBirth(dob);

        if (dob) {
          if (dob.includes("-")) {
            const [yyyy, mm, dd] = dob.split("-");
            setYear(yyyy ?? "");
            setMonth(mm ?? "");
            setDay((dd ?? "").slice(0, 2));
          } else if (dob.includes("/")) {
            const [dd, mm, yyyy] = dob.split("/");
            setDay(dd ?? "");
            setMonth(mm ?? "");
            setYear(yyyy ?? "");
          }
        }

        setAvatar(profile.avatar || null);
      } catch (error) {
        console.log("LOAD PROFILE ERROR:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profileProgress = useMemo(() => {
    const dobFilled = !!dateOfBirth || (!!day && !!month && !!year);
    const fields = [nickname, phone, email, gender, dobFilled];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [nickname, phone, email, gender, dateOfBirth, day, month, year]);

  const initials = useMemo(() => {
    const source = nickname || email || "TK";
    return source.slice(0, 1).toUpperCase();
  }, [nickname, email]);

  const genderText = useMemo(() => {
    switch (gender) {
      case "MALE":
        return "Nam";
      case "FEMALE":
        return "Nữ";
      case "OTHER":
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  }, [gender]);

  const handleEnableEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email.trim())) {
      Alert.alert("Lỗi", "Email không hợp lệ.");
      return;
    }

    const err = validateDob(day, month, year);

    if (err) {
      setDobError(err);
      Alert.alert("Lỗi", err);
      return;
    }

    const builtDob =
      day && month && year
        ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        : "";

    try {
      setSaving(true);

      await updateMyProfile({
        nickname: nickname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gender: gender || undefined,
        dateOfBirth: builtDob || undefined,
        avatar: avatar || undefined,
      });

      setDateOfBirth(builtDob);

      Alert.alert("Thành công", "Lưu hồ sơ thành công.");
      setIsEditMode(false);
    } catch (error) {
      console.log("SAVE PROFILE ERROR:", error);
      Alert.alert("Lỗi", "Không thể lưu hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7EBE9B" />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header banner */}
      <View style={styles.topBanner}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <Text style={styles.displayName}>{nickname || "Nickname"}</Text>
      <Text style={styles.memberText}>Thành viên</Text>

      {!canEdit && (
        <TouchableOpacity
          style={styles.editHintCard}
          onPress={handleEnableEdit}
          activeOpacity={0.85}
        >
          <Text style={styles.editHintTitle}>Sửa đổi thông tin</Text>
          <Text style={styles.editHintText}>
            Nhấn để chỉnh sửa trực tiếp thông tin cá nhân.
          </Text>
        </TouchableOpacity>
      )}

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressTitle}>Hoàn thiện hồ sơ</Text>
          <Text style={styles.progressValue}>{profileProgress}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${profileProgress}%` }]}
          />
        </View>
      </View>

      {/* Phone */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="phone" size={18} color="#7EBE9B" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Số điện thoại</Text>

          <TextInput
            style={[styles.infoInput, !canEdit && styles.disabledInput]}
            value={phone}
            onChangeText={(value) => {
              const onlyNumber = value.replace(/\D/g, "");
              setPhone(onlyNumber);
            }}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#A0A8B3"
            keyboardType="phone-pad"
            editable={canEdit}
            maxLength={11}
          />
        </View>
      </View>

      {/* Nickname */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="user" size={18} color="#7EBE9B" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Nickname</Text>

          <TextInput
            style={[styles.infoInput, !canEdit && styles.disabledInput]}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nhập nickname"
            placeholderTextColor="#A0A8B3"
            editable={canEdit}
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="mail" size={18} color="#7EBE9B" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Email</Text>

          <TextInput
            style={[styles.infoInput, !canEdit && styles.disabledInput]}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            placeholderTextColor="#A0A8B3"
            editable={canEdit}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Gender */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="people-outline" size={18} color="#7EBE9B" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Giới tính</Text>
          <Text style={styles.infoStatic}>{genderText}</Text>

          <View style={styles.genderActions}>
            <TouchableOpacity
              style={[
                styles.genderChip,
                gender === "MALE" && styles.genderChipActive,
                !canEdit && { opacity: 0.6 },
              ]}
              onPress={() => canEdit && setGender("MALE")}
              disabled={!canEdit}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.genderChipText,
                  gender === "MALE" && styles.genderChipTextActive,
                ]}
              >
                Nam
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderChip,
                gender === "FEMALE" && styles.genderChipActive,
                !canEdit && { opacity: 0.6 },
              ]}
              onPress={() => canEdit && setGender("FEMALE")}
              disabled={!canEdit}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.genderChipText,
                  gender === "FEMALE" && styles.genderChipTextActive,
                ]}
              >
                Nữ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderChip,
                gender === "OTHER" && styles.genderChipActive,
                !canEdit && { opacity: 0.6 },
              ]}
              onPress={() => canEdit && setGender("OTHER")}
              disabled={!canEdit}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.genderChipText,
                  gender === "OTHER" && styles.genderChipTextActive,
                ]}
              >
                Khác
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date of birth */}
      <View style={styles.infoRow}>
        <View style={styles.iconCircle}>
          <Feather name="calendar" size={18} color="#7EBE9B" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Ngày sinh</Text>

          <View style={styles.dobRow}>
            <TextInput
              style={[
                styles.infoInput,
                styles.dobInput,
                !canEdit && styles.disabledInput,
              ]}
              placeholder="DD"
              placeholderTextColor="#A0A8B3"
              keyboardType="numeric"
              maxLength={2}
              value={day}
              editable={canEdit}
              onChangeText={(d) => {
                const newDay = d.replace(/\D/g, "").slice(0, 2);
                setDay(newDay);
                setDobError(validateDobWhileTyping(newDay, month, year));
              }}
            />

            <Text style={styles.dobSlash}>/</Text>

            <TextInput
              style={[
                styles.infoInput,
                styles.dobInput,
                !canEdit && styles.disabledInput,
              ]}
              placeholder="MM"
              placeholderTextColor="#A0A8B3"
              keyboardType="numeric"
              maxLength={2}
              value={month}
              editable={canEdit}
              onChangeText={(m) => {
                const newMonth = m.replace(/\D/g, "").slice(0, 2);
                setMonth(newMonth);
                setDobError(validateDobWhileTyping(day, newMonth, year));
              }}
            />

            <Text style={styles.dobSlash}>/</Text>

            <TextInput
              style={[
                styles.infoInput,
                styles.yearInput,
                !canEdit && styles.disabledInput,
              ]}
              placeholder="YYYY"
              placeholderTextColor="#A0A8B3"
              keyboardType="numeric"
              maxLength={4}
              value={year}
              editable={canEdit}
              onChangeText={(y) => {
                const newYear = y.replace(/\D/g, "").slice(0, 4);
                setYear(newYear);
                setDobError(validateDobWhileTyping(day, month, newYear));
              }}
            />
          </View>

          {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}
        </View>
      </View>

      {canEdit && (
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.75 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Đang lưu..." : "Lưu hồ sơ"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  content: {
    paddingBottom: 34,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#607080",
    fontSize: 14,
  },
  topBanner: {
    height: 84,
    backgroundColor: "#76B592",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 48 : 16,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  avatarWrap: {
    alignSelf: "center",
    marginTop: -42,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#76B592",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#EAF5EE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    fontSize: 44,
    fontWeight: "800",
    color: "#fff",
  },
  cameraBtn: {
    position: "absolute",
    right: 4,
    bottom: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F6FBF8",
    borderWidth: 1.5,
    borderColor: "#A9D2BA",
    justifyContent: "center",
    alignItems: "center",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#182537",
    marginTop: 10,
  },
  memberText: {
    textAlign: "center",
    color: "#98A2B3",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 20,
  },
  editHintCard: {
    backgroundColor: "#EAF3EE",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D8E7DE",
  },
  editHintTitle: {
    color: "#182537",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  editHintText: {
    color: "#607080",
    fontSize: 13,
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: "#E7F1EC",
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: {
    color: "#486160",
    fontSize: 16,
    fontWeight: "700",
  },
  progressValue: {
    color: "#72B18F",
    fontSize: 16,
    fontWeight: "800",
  },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#CDE3D8",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#72B18F",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1EF",
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAF3EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#98A2B3",
    marginBottom: 6,
  },
  infoInput: {
    fontSize: 17,
    fontWeight: "700",
    color: "#182537",
    paddingVertical: 0,
  },
  disabledInput: {
    color: "#182537",
  },
  infoStatic: {
    fontSize: 17,
    fontWeight: "700",
    color: "#182537",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  dobRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dobInput: {
    width: 50,
    textAlign: "center",
  },
  yearInput: {
    width: 70,
    textAlign: "center",
  },
  dobSlash: {
    fontSize: 18,
    marginHorizontal: 5,
    color: "#182537",
  },
  editPill: {
    minWidth: 92,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF3EE",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    marginLeft: 12,
    marginTop: 10,
  },
  editPillText: {
    color: "#7EBE9B",
    fontWeight: "700",
    fontSize: 14,
  },
  genderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#EEF5F1",
  },
  genderChipActive: {
    backgroundColor: "#7EBE9B",
  },
  genderChipText: {
    color: "#6B7280",
    fontWeight: "700",
  },
  genderChipTextActive: {
    color: "#fff",
  },
  saveBtn: {
    height: 56,
    marginHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#76B592",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
  },
});
