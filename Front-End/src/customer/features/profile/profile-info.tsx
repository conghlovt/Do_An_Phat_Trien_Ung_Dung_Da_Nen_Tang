import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
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
import { useAuth } from "@/src/customer/hooks/useAuth";

type GenderValue = "MALE" | "FEMALE" | "OTHER" | null;

export default function ProfileInfoScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const canEdit = isEditMode;

  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<GenderValue>("OTHER");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();

        setNickname(profile.nickname || profile.username || "");
        setPhone(profile.phone || "");
        setOriginalPhone(profile.phone || "");
        setEmail(profile.email || "");
        setGender((profile.gender as GenderValue) || "OTHER");
        setDateOfBirth(
          profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : "",
        );
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
    const fields = [nickname, phone, email, gender, dateOfBirth];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [nickname, phone, email, gender, dateOfBirth]);

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
    try {
      setSaving(true);

      await updateMyProfile({
        nickname,
        email,
        phone,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        avatar: avatar || undefined,
      });

      // Update user context
      await updateUser({
        nickname: nickname || undefined,
        email: email || undefined,
        phone: phone || undefined,
        gender: (gender || undefined) as any,
        dateOfBirth: dateOfBirth || undefined,
        avatar: avatar || undefined,
      });

      Alert.alert("Thành công", "Lưu hồ sơ thành công.");
      setIsEditMode(false);
      router.back();
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
      <View style={styles.topBanner} />

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Pressable style={styles.cameraBtn}>
          <Feather name="camera" size={18} color="#72B18F" />
        </Pressable>
      </View>

      <Text style={styles.displayName}>{nickname || "Nickname"}</Text>
      <Text style={styles.memberText}>Thành viên</Text>

      {!canEdit && (
        <Pressable style={styles.editHintCard} onPress={handleEnableEdit}>
          <Text style={styles.editHintTitle}>Bật chỉnh sửa</Text>
          <Text style={styles.editHintText}>
            Nhấn để mở chế độ chỉnh sửa hồ sơ.
          </Text>
        </Pressable>
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
            style={[styles.infoInput, !!originalPhone && { color: "#A0A8B3" }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#A0A8B3"
            editable={canEdit && !originalPhone}
          />
          {!!originalPhone && (
            <Text style={{ fontSize: 12, color: "#e05252", marginTop: 4 }}>
              Số điện thoại không thể thay đổi
            </Text>
          )}
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
            style={styles.infoInput}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nhập nickname"
            placeholderTextColor="#A0A8B3"
            editable={canEdit}
          />
        </View>
        <View style={styles.editPill}>
          <Text style={styles.editPillText}>Chỉnh sửa</Text>
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
            style={styles.infoInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            placeholderTextColor="#A0A8B3"
            editable={canEdit}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.editPill}>
          <Text style={styles.editPillText}>Chỉnh sửa</Text>
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
            <Pressable
              style={[
                styles.genderChip,
                gender === "MALE" && styles.genderChipActive,
              ]}
              onPress={() => canEdit && setGender("MALE")}
              disabled={!canEdit}
            >
              <Text
                style={[
                  styles.genderChipText,
                  gender === "MALE" && styles.genderChipTextActive,
                ]}
              >
                Nam
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.genderChip,
                gender === "FEMALE" && styles.genderChipActive,
              ]}
              onPress={() => canEdit && setGender("FEMALE")}
              disabled={!canEdit}
            >
              <Text
                style={[
                  styles.genderChipText,
                  gender === "FEMALE" && styles.genderChipTextActive,
                ]}
              >
                Nữ
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.genderChip,
                gender === "OTHER" && styles.genderChipActive,
              ]}
              onPress={() => canEdit && setGender("OTHER")}
              disabled={!canEdit}
            >
              <Text
                style={[
                  styles.genderChipText,
                  gender === "OTHER" && styles.genderChipTextActive,
                ]}
              >
                Khác
              </Text>
            </Pressable>
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
          {Platform.OS === "web" ? (
            React.createElement("input" as any, {
              type: "date",
              value: dateOfBirth,
              onChange: (e: any) => canEdit && setDateOfBirth(e.target.value),
              disabled: !canEdit,
              style: {
                fontSize: 17,
                fontWeight: "700",
                color: "#182537",
                paddingVertical: 0,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                cursor: canEdit ? "pointer" : "default",
              } as any,
            })
          ) : (
            <TextInput
              style={styles.infoInput}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A0A8B3"
              editable={canEdit}
            />
          )}
        </View>
        {Platform.OS !== "web" && (
          <View style={styles.editPill}>
            <Text style={styles.editPillText}>Chỉnh sửa</Text>
          </View>
        )}
      </View>

      {canEdit && (
        <Pressable
          style={[styles.saveBtn, saving && { opacity: 0.75 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Đang lưu..." : "Lưu hồ sơ"}
          </Text>
        </Pressable>
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
  infoStatic: {
    fontSize: 17,
    fontWeight: "700",
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
