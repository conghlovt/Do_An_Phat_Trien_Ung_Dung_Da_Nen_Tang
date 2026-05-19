import * as hotelCardService from '../services/hotelCard.service';
export const getHotelCards = async (req, res) => {
    try {
        const hotelCards = await hotelCardService.findHotelCards();
        return res.status(200).json(hotelCards);
    }
    catch (error) {
        console.error('Lỗi lấy hotel cards:', error);
        return res.status(500).json({
            message: 'Không thể tải danh sách khách sạn',
        });
    }
};
export const getHotelCardsByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const hotelCards = await hotelCardService.findHotelCardsByCity(city);
        return res.status(200).json(hotelCards);
    }
    catch (error) {
        console.error('Lỗi lấy hotel cards theo thành phố:', error);
        return res.status(500).json({
            message: 'Không thể tải danh sách khách sạn theo thành phố',
        });
    }
};
//# sourceMappingURL=hotelCard.controller.js.map