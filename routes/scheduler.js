const express = require('express');
const mongoose = require('mongoose');
const SchedulerTask = require('../models/SchedulerTask');
const Category = require('../models/Category');
const { verifyAdminToken } = require('../middleware/adminAuth');

const router = express.Router();

// Helper validations
const validPlatforms = ['flipkart', 'amazon', 'myntra', '1mg', 'nykaa', 'ajio', 'meesho', 'snapdeal', 'paytm', 'other'];

const validateObjectId = (id) => (id ? mongoose.Types.ObjectId.isValid(String(id)) : true);

// Create a scheduler task
// POST /api/admin/scheduler/tasks
router.post('/tasks', verifyAdminToken, async (req, res) => {
  try {
    const {
      taskName,
      taskType, // 'product' | 'category'
      platform,
      url,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      startTime,
      endTime,
      status, // optional: scheduled | running | completed | cancelled
      resultStatus, // optional: pending | passed | failed
      notes
    } = req.body;

    if (!taskName || !taskType || !platform) {
      return res.status(400).json({ success: false, message: 'taskName, taskType and platform are required', error: 'Missing required fields' });
    }

    if (!['product', 'category'].includes(String(taskType).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid taskType', error: 'taskType must be product or category' });
    }

    if (!validPlatforms.includes(String(platform).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid platform', error: `Platform must be one of: ${validPlatforms.join(', ')}` });
    }

    if (url) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(url)) {
        return res.status(400).json({ success: false, message: 'Invalid URL format', error: 'URL must start with http:// or https://' });
      }
    }

    // Validate ObjectIds
    const ids = [mainCategoryId, subCategoryId, subSubCategoryId].filter(Boolean);
    for (let i = 0; i < ids.length; i++) {
      if (!validateObjectId(ids[i])) {
        return res.status(400).json({ success: false, message: 'Invalid category ID format', error: `Invalid ObjectId at index ${i}` });
      }
    }

    // Optional: verify categories exist if provided
    const categoryPath = [];
    if (mainCategoryId) categoryPath.push(mainCategoryId);
    if (subCategoryId) categoryPath.push(subCategoryId);
    if (subSubCategoryId) categoryPath.push(subSubCategoryId);

    if (categoryPath.length) {
      const found = await Category.find({ _id: { $in: categoryPath } }).select('_id');
      if (found.length !== categoryPath.length) {
        return res.status(404).json({ success: false, message: 'One or more categories not found', error: 'Invalid category IDs in path' });
      }
    }

    const task = new SchedulerTask({
      taskName: String(taskName).trim(),
      taskType: String(taskType).toLowerCase(),
      platform: String(platform).toLowerCase(),
      url: url || undefined,
      mainCategoryId: mainCategoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      subSubCategoryId: subSubCategoryId || undefined,
      categoryPath,
      schedule: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      },
      status: status || undefined,
      resultStatus: resultStatus || undefined,
      notes: notes || '',
      createdBy: {
        id: req.admin.id,
        name: req.admin.name || 'Admin',
        email: req.admin.email
      }
    });

    await task.save();

    res.status(201).json({ success: true, message: 'Scheduler task created successfully', data: { task } });
  } catch (error) {
    console.error('Create scheduler task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while creating scheduler task', error: 'Scheduler task creation failed' });
  }
});

// List tasks with filters/pagination
// GET /api/admin/scheduler/tasks
router.get('/tasks', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, platform, status, resultStatus, taskType, search, startFrom, startTo } = req.query;

    const filter = {};
    if (platform) filter.platform = String(platform).toLowerCase();
    if (status) filter.status = status;
    if (resultStatus) filter.resultStatus = resultStatus;
    if (taskType) filter.taskType = String(taskType).toLowerCase();
    if (search) filter.taskName = { $regex: search, $options: 'i' };
    if (startFrom || startTo) {
      filter['schedule.startTime'] = {};
      if (startFrom) filter['schedule.startTime'].$gte = new Date(startFrom);
      if (startTo) filter['schedule.startTime'].$lte = new Date(startTo);
    }

    const tasks = await SchedulerTask.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('mainCategoryId', 'name slug')
      .populate('subCategoryId', 'name slug')
      .populate('subSubCategoryId', 'name slug');

    const total = await SchedulerTask.countDocuments(filter);

    res.json({
      success: true,
      message: 'Scheduler tasks retrieved successfully',
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('List scheduler tasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching scheduler tasks', error: 'Scheduler tasks fetch failed' });
  }
});

// Get single task
// GET /api/admin/scheduler/tasks/:id
router.get('/tasks/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format', error: 'ObjectId must be a 24 character hex string' });
    }

    const task = await SchedulerTask.findById(id)
      .populate('mainCategoryId', 'name slug')
      .populate('subCategoryId', 'name slug')
      .populate('subSubCategoryId', 'name slug');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Scheduler task not found', error: 'Task does not exist' });
    }

    res.json({ success: true, message: 'Scheduler task retrieved successfully', data: { task } });
  } catch (error) {
    console.error('Get scheduler task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while fetching scheduler task', error: 'Scheduler task fetch failed' });
  }
});

// Update a task (including start/end times)
// PUT /api/admin/scheduler/tasks/:id
router.put('/tasks/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID format', error: 'ObjectId must be a 24 character hex string' });
    }

    const update = {};
    const {
      taskName,
      taskType,
      platform,
      url,
      mainCategoryId,
      subCategoryId,
      subSubCategoryId,
      startTime,
      endTime,
      status,
      resultStatus,
      notes
    } = req.body;

    if (taskName !== undefined) update.taskName = String(taskName).trim();
    if (taskType !== undefined) {
      if (!['product', 'category'].includes(String(taskType).toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid taskType', error: 'taskType must be product or category' });
      }
      update.taskType = String(taskType).toLowerCase();
    }
    if (platform !== undefined) {
      if (!validPlatforms.includes(String(platform).toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid platform', error: `Platform must be one of: ${validPlatforms.join(', ')}` });
      }
      update.platform = String(platform).toLowerCase();
    }
    if (url !== undefined) {
      if (url) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(url)) {
          return res.status(400).json({ success: false, message: 'Invalid URL format', error: 'URL must start with http:// or https://' });
        }
      }
      update.url = url;
    }

    // Category IDs
    const ids = [mainCategoryId, subCategoryId, subSubCategoryId];
    const keys = ['mainCategoryId', 'subCategoryId', 'subSubCategoryId'];
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== undefined) {
        if (ids[i] && !validateObjectId(ids[i])) {
          return res.status(400).json({ success: false, message: 'Invalid category ID format', error: `Invalid ${keys[i]}` });
        }
        update[keys[i]] = ids[i] || undefined;
      }
    }

    // If any category IDs are provided, rebuild categoryPath
    if (mainCategoryId !== undefined || subCategoryId !== undefined || subSubCategoryId !== undefined) {
      const categoryPath = [];
      if (mainCategoryId) categoryPath.push(mainCategoryId);
      if (subCategoryId) categoryPath.push(subCategoryId);
      if (subSubCategoryId) categoryPath.push(subSubCategoryId);
      update.categoryPath = categoryPath;
    }

    // Schedule
    if (startTime !== undefined || endTime !== undefined) {
      update.schedule = {};
      if (startTime !== undefined) update.schedule.startTime = startTime ? new Date(startTime) : undefined;
      if (endTime !== undefined) update.schedule.endTime = endTime ? new Date(endTime) : undefined;
    }

    if (status !== undefined) update.status = status;
    if (resultStatus !== undefined) update.resultStatus = resultStatus;
    if (notes !== undefined) update.notes = notes;

    const updated = await SchedulerTask.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    ).populate('mainCategoryId', 'name slug')
     .populate('subCategoryId', 'name slug')
     .populate('subSubCategoryId', 'name slug');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Scheduler task not found', error: 'Task does not exist' });
    }

    res.json({ success: true, message: 'Scheduler task updated successfully', data: { task: updated } });
  } catch (error) {
    console.error('Update scheduler task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while updating scheduler task', error: 'Scheduler task update failed' });
  }
});

module.exports = router;


