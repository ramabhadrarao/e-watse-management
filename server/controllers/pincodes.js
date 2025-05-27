import Pincode from '../models/Pincode.js';
import { asyncHandler } from '../middleware/async.js';
import { ErrorResponse } from '../utils/errorResponse.js';

// @desc    Check pincode serviceability
// @route   GET /api/pincodes/check/:pincode
// @access  Public
export const checkPincode = asyncHandler(async (req, res, next) => {
  const { pincode } = req.params;

  // Validate pincode format
  if (!/^[0-9]{6}$/.test(pincode)) {
    return next(new ErrorResponse('Invalid pincode format', 400));
  }

  const pincodeData = await Pincode.findOne({ pincode })
    .populate('assignedPickupBoys', 'firstName lastName phone');

  if (!pincodeData) {
    return res.status(200).json({
      success: true,
      serviceable: false,
      message: 'Service not available in this area'
    });
  }

  res.status(200).json({
    success: true,
    serviceable: pincodeData.isServiceable,
    data: {
      pincode: pincodeData.pincode,
      city: pincodeData.city,
      state: pincodeData.state,
      area: pincodeData.area,
      pickupCharges: pincodeData.pickupCharges,
      minimumOrderValue: pincodeData.minimumOrderValue,
      estimatedPickupTime: pincodeData.estimatedPickupTime,
      availablePickupBoys: pincodeData.assignedPickupBoys.length
    }
  });
});

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Private/Admin/Manager
export const getPincodes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, city, state, serviceable } = req.query;

  let query = Pincode.find();

  // Filter by city
  if (city) {
    query = query.where({ city: new RegExp(city, 'i') });
  }

  // Filter by state
  if (state) {
    query = query.where({ state: new RegExp(state, 'i') });
  }

  // Filter by serviceability
  if (serviceable !== undefined) {
    query = query.where({ isServiceable: serviceable === 'true' });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Pincode.countDocuments(query.getQuery());

  query = query.skip(startIndex).limit(limit).sort({ state: 1, city: 1, pincode: 1 });

  const pincodes = await query.populate('assignedPickupBoys', 'firstName lastName phone');

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: pincodes.length,
    pagination,
    data: pincodes
  });
});

// @desc    Create new pincode
// @route   POST /api/pincodes
// @access  Private/Admin
export const createPincode = asyncHandler(async (req, res, next) => {
  // Check if pincode already exists
  const existingPincode = await Pincode.findOne({ pincode: req.body.pincode });
  if (existingPincode) {
    return next(new ErrorResponse('Pincode already exists', 400));
  }

  const pincode = await Pincode.create(req.body);

  res.status(201).json({
    success: true,
    data: pincode
  });
});

// @desc    Update pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
export const updatePincode = asyncHandler(async (req, res, next) => {
  let pincode = await Pincode.findById(req.params.id);

  if (!pincode) {
    return next(new ErrorResponse(`Pincode not found with id of ${req.params.id}`, 404));
  }

  pincode = await Pincode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: pincode
  });
});

// @desc    Delete pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
export const deletePincode = asyncHandler(async (req, res, next) => {
  const pincode = await Pincode.findById(req.params.id);

  if (!pincode) {
    return next(new ErrorResponse(`Pincode not found with id of ${req.params.id}`, 404));
  }

  await pincode.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Assign pickup boy to pincode
// @route   PUT /api/pincodes/:id/assign
// @access  Private/Admin/Manager
export const assignPickupBoy = asyncHandler(async (req, res, next) => {
  const { pickupBoyId } = req.body;

  const pincode = await Pincode.findById(req.params.id);
  if (!pincode) {
    return next(new ErrorResponse(`Pincode not found with id of ${req.params.id}`, 404));
  }

  // Check if pickup boy is already assigned
  if (pincode.assignedPickupBoys.includes(pickupBoyId)) {
    return next(new ErrorResponse('Pickup boy already assigned to this pincode', 400));
  }

  pincode.assignedPickupBoys.push(pickupBoyId);
  await pincode.save();

  await pincode.populate('assignedPickupBoys', 'firstName lastName phone');

  res.status(200).json({
    success: true,
    data: pincode
  });
});

// @desc    Remove pickup boy from pincode
// @route   DELETE /api/pincodes/:id/assign/:pickupBoyId
// @access  Private/Admin/Manager
export const removePickupBoy = asyncHandler(async (req, res, next) => {
  const { pickupBoyId } = req.params;

  const pincode = await Pincode.findById(req.params.id);
  if (!pincode) {
    return next(new ErrorResponse(`Pincode not found with id of ${req.params.id}`, 404));
  }

  pincode.assignedPickupBoys = pincode.assignedPickupBoys.filter(
    id => id.toString() !== pickupBoyId
  );
  
  await pincode.save();
  await pincode.populate('assignedPickupBoys', 'firstName lastName phone');

  res.status(200).json({
    success: true,
    data: pincode
  });
});