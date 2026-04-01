import { adminLog } from '../config/prisma.js';

export async function createLog(userId, action) {
    await adminLog.create({
        data: {
            userId,
            action
        }
    });
}
