const DailyDelivery = require('../models/DailyDelivery');
const Consumer = require('../models/Consumer');

// @desc    Get monthly billing for a consumer
// @route   GET /api/billing/consumer/:id/monthly
// @access  Private/Admin
exports.getConsumerMonthlyBilling = async (req, res, next) => {
    try {
        const { year, month, startDate: queryStartDate, endDate: queryEndDate } = req.query;
        const { id: consumerId } = req.params;

        // Get consumer
        const consumer = await Consumer.findById(consumerId);
        if (!consumer) {
            return res.status(404).json({
                success: false,
                message: 'Consumer not found'
            });
        }

        let startDate, endDate, targetMonth, targetYear;

        if (queryStartDate && queryEndDate) {
            startDate = new Date(queryStartDate);
            endDate = new Date(queryEndDate);
            // Set time to end of day for endDate
            endDate.setHours(23, 59, 59, 999);
            targetMonth = startDate.getMonth();
            targetYear = startDate.getFullYear();
        } else {
            // Calculate date range for the month
            targetYear = year ? parseInt(year) : new Date().getFullYear();
            targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
            startDate = new Date(targetYear, targetMonth, 1);
            endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
        }

        // Get all deliveries for this consumer in the month
        const deliveries = await DailyDelivery.find({
            consumerId,
            deliveryDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ deliveryDate: 1 });

        // Calculate total quantity
        const totalQuantity = deliveries.reduce((sum, delivery) => sum + delivery.quantityDelivered, 0);

        // Calculate total amount
        const totalAmount = totalQuantity * consumer.perLiterRate;

        res.status(200).json({
            success: true,
            data: {
                consumer: {
                    id: consumer._id,
                    fullName: consumer.fullName,
                    mobileNumber: consumer.mobileNumber,
                    address: consumer.address,
                    area: consumer.area,
                    perLiterRate: consumer.perLiterRate
                },
                period: {
                    month: targetMonth + 1,
                    year: targetYear,
                    startDate,
                    endDate
                },
                deliveries,
                totalQuantity,
                totalAmount,
                deliveryCount: deliveries.length
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get monthly billing report for all consumers
// @route   GET /api/billing/report
// @access  Private/Admin
exports.getMonthlyBillingReport = async (req, res, next) => {
    try {
        const { year, month, startDate: queryStartDate, endDate: queryEndDate } = req.query;

        let startDate, endDate, targetMonth, targetYear;

        if (queryStartDate && queryEndDate) {
            startDate = new Date(queryStartDate);
            endDate = new Date(queryEndDate);
            // Set time to end of day for endDate
            endDate.setHours(23, 59, 59, 999);
            targetMonth = startDate.getMonth();
            targetYear = startDate.getFullYear();
        } else {
            // Calculate date range
            targetYear = year ? parseInt(year) : new Date().getFullYear();
            targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

            startDate = new Date(targetYear, targetMonth, 1);
            endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
        }

        // Get all deliveries for the month
        const deliveries = await DailyDelivery.find({
            deliveryDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('consumerId', 'fullName mobileNumber area perLiterRate');

        // Group by consumer
        const consumerMap = {};

        deliveries.forEach(delivery => {
            if (!delivery.consumerId) return; // Skip if consumer not found
            const consumerId = delivery.consumerId._id.toString();

            if (!consumerMap[consumerId]) {
                consumerMap[consumerId] = {
                    consumer: delivery.consumerId,
                    deliveries: [],
                    totalQuantity: 0,
                    totalAmount: 0
                };
            }

            consumerMap[consumerId].deliveries.push(delivery);
            consumerMap[consumerId].totalQuantity += delivery.quantityDelivered;
            consumerMap[consumerId].totalAmount += delivery.quantityDelivered * delivery.consumerId.perLiterRate;
        });

        // Convert to array
        const report = Object.values(consumerMap);

        // Calculate grand totals
        const grandTotalQuantity = report.reduce((sum, item) => sum + item.totalQuantity, 0);
        const grandTotalAmount = report.reduce((sum, item) => sum + item.totalAmount, 0);

        res.status(200).json({
            success: true,
            data: {
                period: {
                    month: targetMonth + 1,
                    year: targetYear,
                    startDate,
                    endDate
                },
                consumerBilling: report,
                summary: {
                    totalConsumers: report.length,
                    grandTotalQuantity,
                    grandTotalAmount
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get outstanding amounts (all consumers)
// @route   GET /api/billing/outstanding
// @access  Private/Admin
exports.getOutstandingAmounts = async (req, res, next) => {
    try {
        const { year, month } = req.query;

        // Calculate date range
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        // Get all consumers
        const consumers = await Consumer.find({ isActive: true });

        const outstandingList = [];

        for (const consumer of consumers) {
            // Get deliveries for this consumer in the period
            const deliveries = await DailyDelivery.find({
                consumerId: consumer._id,
                deliveryDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            const totalQuantity = deliveries.reduce((sum, d) => sum + d.quantityDelivered, 0);
            const totalAmount = totalQuantity * consumer.perLiterRate;

            if (totalAmount > 0) {
                outstandingList.push({
                    consumer: {
                        id: consumer._id,
                        fullName: consumer.fullName,
                        mobileNumber: consumer.mobileNumber,
                        area: consumer.area
                    },
                    totalQuantity,
                    totalAmount,
                    deliveryCount: deliveries.length
                });
            }
        }

        // Sort by amount descending
        outstandingList.sort((a, b) => b.totalAmount - a.totalAmount);

        const totalOutstanding = outstandingList.reduce((sum, item) => sum + item.totalAmount, 0);

        res.status(200).json({
            success: true,
            data: {
                period: {
                    month: targetMonth + 1,
                    year: targetYear,
                    startDate,
                    endDate
                },
                outstandingList,
                totalOutstanding,
                consumerCount: outstandingList.length
            }
        });

    } catch (error) {
        next(error);
    }
};
