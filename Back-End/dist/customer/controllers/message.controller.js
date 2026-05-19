import * as messageService from '../services/message.service';
const getCustomerId = (req) => req.user?.id;
export const getMessages = async (req, res, next) => {
    try {
        const messages = await messageService.findMessages(getCustomerId(req));
        res.json({ data: messages });
    }
    catch (error) {
        next(error);
    }
};
export const markMessageAsRead = async (req, res, next) => {
    try {
        const message = await messageService.markMessageAsRead(req.params.id, getCustomerId(req));
        res.json({ data: message });
    }
    catch (error) {
        next(error);
    }
};
export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await messageService.findNotifications(getCustomerId(req));
        res.json({ data: notifications });
    }
    catch (error) {
        next(error);
    }
};
export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const notifications = await messageService.markAllNotificationsAsRead(getCustomerId(req));
        res.json({ data: notifications });
    }
    catch (error) {
        next(error);
    }
};
export const deleteAllNotifications = async (req, res, next) => {
    try {
        const notifications = await messageService.deleteAllNotifications(getCustomerId(req));
        res.json({ data: notifications });
    }
    catch (error) {
        next(error);
    }
};
export const deleteNotification = async (req, res, next) => {
    try {
        const notifications = await messageService.deleteNotification(req.params.id, getCustomerId(req));
        res.json({ data: notifications });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=message.controller.js.map