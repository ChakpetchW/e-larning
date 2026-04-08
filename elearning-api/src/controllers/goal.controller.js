const goalService = require('../services/goal.service');
const asyncHandler = require('../utils/handlers').asyncHandler;

const createGoal = asyncHandler(async (req, res) => {
    const goal = await goalService.createGoal(req.body, req.user);
    res.status(201).json({
        message: 'Goal created successfully',
        data: goal
    });
});

const getGoals = asyncHandler(async (req, res) => {
    const goals = await goalService.getGoals(req.user);
    res.json({
        data: goals
    });
});

const deleteGoal = asyncHandler(async (req, res) => {
    await goalService.deleteGoal(req.params.id, req.user);
    res.json({
        message: 'Goal archived successfully'
    });
});

const getGoalReport = asyncHandler(async (req, res) => {
    const report = await goalService.getGoalReport(req.params.id, req.user);
    res.json({
        data: report
    });
});

module.exports = {
    createGoal,
    getGoals,
    deleteGoal,
    getGoalReport
};
