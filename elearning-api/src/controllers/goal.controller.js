const goalService = require('../services/goal.service');
const asyncHandler = require('../middleware/async');

const createGoal = asyncHandler(async (req, res) => {
    const goal = await goalService.createGoal(req.body, req.user);
    res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal
    });
});

const getGoals = asyncHandler(async (req, res) => {
    const goals = await goalService.getGoals(req.user);
    res.json({
        success: true,
        data: goals
    });
});

const getGoalDetails = asyncHandler(async (req, res) => {
    const goal = await goalService.getGoalDetails(req.params.id, req.user);
    res.json({
        success: true,
        data: goal
    });
});

const deleteGoal = asyncHandler(async (req, res) => {
    await goalService.deleteGoal(req.params.id, req.user);
    res.json({
        success: true,
        message: 'Goal archived successfully'
    });
});

const getGoalReport = asyncHandler(async (req, res) => {
    const report = await goalService.getGoalReport(req.params.id, req.user);
    res.json({
        success: true,
        data: report
    });
});

module.exports = {
    createGoal,
    getGoals,
    getGoalDetails,
    deleteGoal,
    getGoalReport
};
