import * as locationService from '../services/location.service';
// GET /api/customer/locations
export const getCustomerLocations = async (_req, res, next) => {
    try {
        const locations = await locationService.findCustomerLocations();
        res.json({ data: locations });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=location.controller.js.map