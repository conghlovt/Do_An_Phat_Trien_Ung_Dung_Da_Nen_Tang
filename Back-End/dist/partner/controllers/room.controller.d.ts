import type { Response } from 'express';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
export declare class RoomController {
    createRoomType(req: AuthRequest, res: Response): Promise<void>;
    updateRoomType(req: AuthRequest, res: Response): Promise<void>;
    listRoomTypes(req: AuthRequest, res: Response): Promise<void>;
    getRoomType(req: AuthRequest, res: Response): Promise<void>;
    deleteRoomType(req: AuthRequest, res: Response): Promise<void>;
    createRoomUnit(req: AuthRequest, res: Response): Promise<void>;
    updateRoomUnit(req: AuthRequest, res: Response): Promise<void>;
    listRoomUnits(req: AuthRequest, res: Response): Promise<void>;
    deleteRoomUnit(req: AuthRequest, res: Response): Promise<void>;
    uploadMedia(req: AuthRequest, res: Response): Promise<void>;
    deleteMedia(req: AuthRequest, res: Response): Promise<void>;
}
export declare const roomController: RoomController;
//# sourceMappingURL=room.controller.d.ts.map