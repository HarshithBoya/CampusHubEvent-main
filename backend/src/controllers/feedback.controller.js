import prisma from '../config/prisma.js';

export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            include: {
                user: true,
                event: true
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        res.json({ feedbacks });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export async function getFeedbackSummary(req, res) {
    try {
        const totalFeedbacks = await prisma.feedback.count();

        const avg = await feedback.aggregate({
            _avg: { rating: true }
        });

        res.json({
            totalFeedbacks,
            averageRating: avg._avg.rating || 0
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}