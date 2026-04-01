import prisma from '../config/prisma.js';

export const getAdminLogs = async (req, res) => {
    try {
        const logs = await prisma.adminLog.findMany({
            include: { user: true },
            orderBy: { timestamp: 'desc' }
        });

        res.json({ logs });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};