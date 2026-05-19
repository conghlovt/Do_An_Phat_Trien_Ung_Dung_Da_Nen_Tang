import * as hotelService from './hotels.service';
const VIETNAM_PROVINCES_API = 'https://provinces.open-api.vn/api/?depth=3';
const compareVietnamese = (a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' });
const stripAdministrativePrefix = (value) => value
    .replace(/^(Tỉnh|Thành phố|TP\.?|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\s+/i, '')
    .trim();
const normalizeKey = (value) => stripAdministrativePrefix(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(tinh|thanh pho|tp\.?|quan|huyen|thi xa|phuong|xa|thi tran)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
const buildDistrictMap = (districts) => {
    const districtMap = new Map();
    districts.forEach((district) => {
        districtMap.set(normalizeKey(district.name), district);
    });
    return districtMap;
};
const mergeDistricts = (apiDistricts, hotelDistricts) => {
    const hotelDistrictMap = buildDistrictMap(hotelDistricts);
    const mergedDistrictKeys = new Set();
    const districtsFromApi = (apiDistricts ?? []).map((district) => {
        const matchedHotelDistrict = hotelDistrictMap.get(normalizeKey(district.name));
        mergedDistrictKeys.add(normalizeKey(district.name));
        const hotelWardMap = new Map((matchedHotelDistrict?.wards ?? []).map((ward) => [normalizeKey(ward.name), ward.count]));
        return {
            name: stripAdministrativePrefix(district.name),
            count: matchedHotelDistrict?.count ?? 0,
            wards: (district.wards ?? []).map((ward) => ({
                name: stripAdministrativePrefix(ward.name),
                count: hotelWardMap.get(normalizeKey(ward.name)) ?? 0,
            })),
        };
    });
    const hotelOnlyDistricts = hotelDistricts.filter((district) => !mergedDistrictKeys.has(normalizeKey(district.name)));
    return [...districtsFromApi, ...hotelOnlyDistricts].sort((a, b) => compareVietnamese(a.name, b.name));
};
const fetchVietnamProvinces = async () => {
    const response = await fetch(VIETNAM_PROVINCES_API);
    if (!response.ok) {
        throw new Error(`Could not load Vietnam provinces: ${response.status}`);
    }
    return response.json();
};
export const findCustomerLocations = async () => {
    const hotelLocations = await hotelService.findHotelLocations();
    try {
        const provinceItems = await fetchVietnamProvinces();
        const hotelProvinceMap = new Map(hotelLocations.map((province) => [normalizeKey(province.name), province]));
        return provinceItems
            .map((province) => {
            const provinceName = stripAdministrativePrefix(province.name);
            const matchedHotelProvince = hotelProvinceMap.get(normalizeKey(province.name));
            return {
                name: provinceName,
                count: matchedHotelProvince?.count ?? 0,
                districts: mergeDistricts(province.districts, matchedHotelProvince?.districts ?? []),
            };
        })
            .sort((a, b) => compareVietnamese(a.name, b.name));
    }
    catch (error) {
        console.warn('[customer/location] Falling back to hotel locations:', error);
        return hotelLocations;
    }
};
//# sourceMappingURL=location.service.js.map