import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { partnerService } from "../../services/partner.service";
import { ArrowLeft } from "lucide-react-native";

const isMobile = Platform.OS !== "web";

const roomSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên loại phòng"),
  description: z.string().optional(),
  maxGuests: z.number().min(1, "Sức chứa tối thiểu 1 người"),
  bedType: z.string().optional(),
  roomSizeSqm: z.number().optional(),
  totalUnits: z.number().min(1, "Tối thiểu 1 phòng"),
  hourlyPrice: z
    .number({ message: "Vui lòng nhập giá" })
    .min(1, "Vui lòng nhập giá theo giờ"),
  hourlyMinHours: z
    .number({ message: "Vui lòng nhập số giờ" })
    .min(1, "Vui lòng nhập số giờ đầu"),
  hourlyExtraPrice: z
    .number({ message: "Vui lòng nhập giá" })
    .min(0, "Vui lòng nhập giá giờ thêm"),
  overnightPrice: z
    .number({ message: "Vui lòng nhập giá" })
    .min(1, "Vui lòng nhập giá qua đêm"),
  overnightCheckinFrom: z.string().min(1, "Nhập giờ nhận (VD: 21:00)"),
  overnightCheckoutBefore: z.string().min(1, "Nhập giờ trả (VD: 12:00)"),
  dailyPrice: z
    .number({ message: "Vui lòng nhập giá" })
    .min(1, "Vui lòng nhập giá theo ngày"),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface Props {
  hotelId?: string;
  roomId?: string;
  onBack?: () => void;
}

export function RoomForm({
  hotelId: propHotelId,
  roomId: propRoomId,
  onBack,
}: Props) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hotelId = propHotelId || (params.hotelId as string);
  const roomId = propRoomId || (params.roomId as string);
  const isEdit = !!roomId;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      description: "",
      maxGuests: 2,
      bedType: "double",
      roomSizeSqm: undefined,
      totalUnits: 1,
      hourlyPrice: undefined,
      hourlyMinHours: undefined,
      hourlyExtraPrice: undefined,
      overnightPrice: undefined,
      overnightCheckinFrom: "",
      overnightCheckoutBefore: "",
      dailyPrice: undefined,
    },
  });

  React.useEffect(() => {
    if (isEdit && hotelId && roomId) {
      setIsLoading(true);
      partnerService
        .getRoomType(hotelId, roomId)
        .then((room) => {
          const hourly = room.pricingPolicies?.find(
            (p: any) => p.bookingType === "hourly",
          );
          const overnight = room.pricingPolicies?.find(
            (p: any) => p.bookingType === "overnight",
          );
          const daily = room.pricingPolicies?.find(
            (p: any) => p.bookingType === "daily",
          );

          reset({
            name: room.name,
            description: room.description || "",
            maxGuests: room.maxGuests,
            bedType: room.bedType || "",
            roomSizeSqm: room.roomSizeSqm || undefined,
            totalUnits: room.totalUnits,
            hourlyPrice: hourly ? Number(hourly.basePrice) : undefined,
            hourlyMinHours: hourly ? Number(hourly.minHours || 2) : undefined,
            hourlyExtraPrice: hourly
              ? Number(hourly.extraHourPrice || 0)
              : undefined,
            overnightPrice: overnight ? Number(overnight.basePrice) : undefined,
            overnightCheckinFrom: overnight?.overnightCheckinFrom || "",
            overnightCheckoutBefore: overnight?.overnightCheckoutBefore || "",
            dailyPrice: daily ? Number(daily.basePrice) : undefined,
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEdit, hotelId, roomId, reset]);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      setIsLoading(true);

      if (!hotelId) {
        throw new Error("Không tìm thấy thông tin khách sạn");
      }

      const pricingPolicies: any[] = [];
      if (data.hourlyPrice) {
        pricingPolicies.push({
          bookingType: "hourly",
          basePrice: data.hourlyPrice,
          minHours: data.hourlyMinHours || 2,
          extraHourPrice: data.hourlyExtraPrice || 0,
        });
      }
      if (data.overnightPrice) {
        pricingPolicies.push({
          bookingType: "overnight",
          basePrice: data.overnightPrice,
          overnightCheckinFrom: data.overnightCheckinFrom,
          overnightCheckoutBefore: data.overnightCheckoutBefore,
        });
      }
      if (data.dailyPrice) {
        pricingPolicies.push({
          bookingType: "daily",
          basePrice: data.dailyPrice,
        });
      }

      const payload = {
        name: data.name.trim(),
        description: data.description?.trim(),
        maxGuests: data.maxGuests,
        bedType: data.bedType?.trim(),
        roomSizeSqm:
          typeof data.roomSizeSqm === "number" ? data.roomSizeSqm : undefined,
        totalUnits: data.totalUnits,
        pricingPolicies,
      };

      if (isEdit) {
        await partnerService.updateRoomType(hotelId, roomId, payload);
        setSuccessMsg("Cập nhật loại phòng thành công!");
      } else {
        await partnerService.createRoomType(hotelId, payload);
        setSuccessMsg("Thêm loại phòng thành công!");
      }
      setTimeout(() => {
        handleGoBack();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {isMobile ? (
        <View style={s.mobileBackHeader}>
          <TouchableOpacity onPress={handleGoBack} style={{ padding: 4 }}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.mobileBackTitle}>
            {isEdit ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
          </Text>
        </View>
      ) : null}
      <ScrollView style={s.scroll}>
        {!isMobile && (
          <View style={s.pageHeader}>
            <Text style={s.pageTitle}>
              {isEdit ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
            </Text>
          </View>
        )}

        {errorMsg ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
        {successMsg ? (
          <View style={s.successBox}>
            <Text style={s.successText}>{successMsg}</Text>
          </View>
        ) : null}

        <View style={s.formSection}>
          <View style={s.field}>
            <Text style={s.label}>
              Tên loại phòng <Text style={s.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, errors.name && s.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="VD: Phòng Standard, Phòng Deluxe"
                  placeholderTextColor="#94A3B8"
                />
              )}
            />
            {errors.name && (
              <Text style={s.fieldErrorText}>{errors.name.message}</Text>
            )}
          </View>

          <View style={s.field}>
            <Text style={s.label}>Mô tả</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, s.textarea]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Mô tả loại phòng"
                  placeholderTextColor="#94A3B8"
                  multiline
                />
              )}
            />
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>
                Sức chứa (người) <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="maxGuests"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.maxGuests && s.inputError]}
                    value={value?.toString()}
                    onChangeText={(v) => onChange(parseInt(v) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.maxGuests && (
                <Text style={s.fieldErrorText}>{errors.maxGuests.message}</Text>
              )}
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Loại giường</Text>
              <Controller
                control={control}
                name="bedType"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={s.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="double, twin..."
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Diện tích (m²)</Text>
              <Controller
                control={control}
                name="roomSizeSqm"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={s.input}
                    value={value?.toString()}
                    onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
                    keyboardType="numeric"
                    placeholder="25"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.roomSizeSqm && (
                <Text style={s.fieldErrorText}>
                  {errors.roomSizeSqm.message}
                </Text>
              )}
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>
                Số phòng <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="totalUnits"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.totalUnits && s.inputError]}
                    value={value?.toString()}
                    onChangeText={(v) => onChange(parseInt(v) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.totalUnits && (
                <Text style={s.fieldErrorText}>
                  {errors.totalUnits.message}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Bảng giá */}
        <View style={s.formSection}>
          <Text style={[s.pageTitle, { fontSize: 16, marginBottom: 12 }]}>
            Cài đặt giá phòng
          </Text>

          <Text style={s.pricingTitle}>Theo giờ</Text>
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>
                Giá (VNĐ) <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="hourlyPrice"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.hourlyPrice && s.inputError]}
                    value={value?.toString() || ""}
                    onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
                    keyboardType="numeric"
                    placeholder="VD: 150000"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.hourlyPrice && (
                <Text style={s.fieldErrorText}>
                  {errors.hourlyPrice.message}
                </Text>
              )}
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>
                Số giờ đầu <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="hourlyMinHours"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.hourlyMinHours && s.inputError]}
                    value={value?.toString() || ""}
                    onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
                    keyboardType="numeric"
                    placeholder="VD: 2"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.hourlyMinHours && (
                <Text style={s.fieldErrorText}>
                  {errors.hourlyMinHours.message}
                </Text>
              )}
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>
                Thêm 1 giờ <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="hourlyExtraPrice"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.hourlyExtraPrice && s.inputError]}
                    value={value?.toString() || ""}
                    onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
                    keyboardType="numeric"
                    placeholder="VD: 50000"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.hourlyExtraPrice && (
                <Text style={s.fieldErrorText}>
                  {errors.hourlyExtraPrice.message}
                </Text>
              )}
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.pricingTitle}>
                Qua đêm (VNĐ) <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="overnightPrice"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.overnightPrice && s.inputError]}
                    value={value?.toString() || ""}
                    onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
                    keyboardType="numeric"
                    placeholder="VD: 300000"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.overnightPrice && (
                <Text style={s.fieldErrorText}>
                  {errors.overnightPrice.message}
                </Text>
              )}
              <View style={[s.row, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>
                    Giờ nhận <Text style={s.required}>*</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="overnightCheckinFrom"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          s.input,
                          errors.overnightCheckinFrom && s.inputError,
                        ]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="21:00"
                        placeholderTextColor="#94A3B8"
                      />
                    )}
                  />
                  {errors.overnightCheckinFrom && (
                    <Text style={s.fieldErrorText}>
                      {errors.overnightCheckinFrom.message}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>
                    Giờ trả <Text style={s.required}>*</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="overnightCheckoutBefore"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          s.input,
                          errors.overnightCheckoutBefore && s.inputError,
                        ]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="12:00"
                        placeholderTextColor="#94A3B8"
                      />
                    )}
                  />
                  {errors.overnightCheckoutBefore && (
                    <Text style={s.fieldErrorText}>
                      {errors.overnightCheckoutBefore.message}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.pricingTitle}>
                Theo ngày (VNĐ) <Text style={s.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="dailyPrice"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[s.input, errors.dailyPrice && s.inputError]}
                    value={value?.toString() || ""}
                    onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
                    keyboardType="numeric"
                    placeholder="VD: 500000"
                    placeholderTextColor="#94A3B8"
                  />
                )}
              />
              {errors.dailyPrice && (
                <Text style={s.fieldErrorText}>
                  {errors.dailyPrice.message}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={s.actions}>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={handleGoBack}
            disabled={isLoading}
          >
            <Text style={s.cancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.submitBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleSubmit(onSubmit as any)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={s.submitText}>
                {isEdit ? "Cập nhật" : "Tạo loại phòng"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: isMobile ? "#FFF" : "#F8FAFC" },
  scroll: { flex: 1 },
  mobileBackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mobileBackTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  pageHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  pageTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  formSection: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: isMobile ? 16 : 20,
    backgroundColor: "#FFF",
    borderRadius: isMobile ? 16 : 14,
    padding: isMobile ? 16 : 20,
    borderWidth: isMobile ? 0 : 1,
    borderColor: "#E2E8F0",
    ...(isMobile
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }
      : {}),
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#1E293B",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : ({} as any)),
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    ...(Platform.OS === "web" ? { outlineColor: "#EF4444" } : ({} as any)),
  },
  fieldErrorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  row: { flexDirection: isMobile ? "column" : "row", gap: 12 },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: isMobile ? 20 : 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelText: { color: "#475569", fontSize: 14, fontWeight: "700" },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
    alignItems: "center",
  },
  submitText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  pricingTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    marginTop: 8,
  },
  errorBox: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: "#EF4444", fontSize: 14, textAlign: "center" },
  successBox: {
    marginHorizontal: isMobile ? 16 : 20,
    marginTop: 16,
    backgroundColor: "#F0FDFA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  successText: { color: "#0D9488", fontSize: 14, textAlign: "center" },
});
