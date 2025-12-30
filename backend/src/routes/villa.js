const express = require('express');
const router = express.Router();
const Villa = require('../models/Villa');

// Get all villas with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      includeInactive = 'false',
      includeUnpublished = 'false',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    // Filter by active status (unless admin explicitly includes inactive)
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    
    // Filter by published status (unless admin explicitly includes unpublished)
    if (includeUnpublished !== 'true') {
      query.isPublished = true;
    }
    
    // Search by name or location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Villa.countDocuments(query);

    // Get villas with pagination
    const villas = await Villa.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      villas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching villas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch villas',
      error: error.message
    });
  }
});

// Get single villa by ID
router.get('/:id', async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id).lean();
    
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    res.json({
      success: true,
      villa
    });

  } catch (error) {
    console.error('Error fetching villa:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch villa',
      error: error.message
    });
  }
});

// Create new villa
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      location,
      address,
      price,
      weekendPrice,
      seasonalPricing,
      extraGuestCharge,
      cleaningFee,
      securityDeposit,
      bedrooms,
      bathrooms,
      maxGuests,
      totalArea,
      builtYear,
      rooms,
      images,
      videos,
      virtualTourUrl,
      features,
      amenities,
      nearbyAttractions,
      houseRules,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petPolicy,
      smokingPolicy,
      partyPolicy,
      availability,
      blockedDates,
      minStayDuration,
      maxStayDuration,
      isActive,
      isPublished,
      isFeatured,
      slug,
      seoTitle,
      seoDescription,
      seoKeywords,
      lastModifiedBy,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !location || !bedrooms || !bathrooms || !maxGuests) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, location, bedrooms, bathrooms, and maxGuests are required'
      });
    }

    // Create villa data object
    const villaData = {
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription?.trim(),
      location: location.trim(),
      address,
      price: parseFloat(price),
      weekendPrice: weekendPrice ? parseFloat(weekendPrice) : undefined,
      seasonalPricing,
      extraGuestCharge: extraGuestCharge ? parseFloat(extraGuestCharge) : 0,
      cleaningFee: cleaningFee ? parseFloat(cleaningFee) : 0,
      securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      maxGuests: parseInt(maxGuests),
      totalArea: totalArea ? parseInt(totalArea) : undefined,
      builtYear: builtYear ? parseInt(builtYear) : undefined,
      rooms,
      images: images || [],
      swipeDeckImage: swipeDeckImage || (images && images[0]) || '',
      videos,
      virtualTourUrl,
      features: features || [],
      amenities: amenities || [],
      nearbyAttractions,
      houseRules: houseRules || [],
      checkInTime: checkInTime || '14:00',
      checkOutTime: checkOutTime || '12:00',
      cancellationPolicy,
      petPolicy,
      smokingPolicy,
      partyPolicy,
      availability: availability || 'available',
      blockedDates,
      minStayDuration: minStayDuration ? parseInt(minStayDuration) : 1,
      maxStayDuration: maxStayDuration ? parseInt(maxStayDuration) : undefined,
      isActive: isActive !== undefined ? isActive : true,
      isPublished: isPublished !== undefined ? isPublished : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      slug,
      seoTitle,
      seoDescription,
      seoKeywords,
      lastModifiedBy: lastModifiedBy || 'admin',
      notes
    };

    const villa = new Villa(villaData);
    const savedVilla = await villa.save();

    res.status(201).json({
      success: true,
      message: 'Villa created successfully',
      villa: savedVilla
    });

  } catch (error) {
    console.error('Error creating villa:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create villa',
      error: error.message
    });
  }
});

// Update villa
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      location,
      address,
      price,
      weekendPrice,
      seasonalPricing,
      extraGuestCharge,
      cleaningFee,
      securityDeposit,
      bedrooms,
      bathrooms,
      maxGuests,
      totalArea,
      builtYear,
      rooms,
      images,
      videos,
      virtualTourUrl,
      features,
      amenities,
      nearbyAttractions,
      houseRules,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petPolicy,
      smokingPolicy,
      partyPolicy,
      availability,
      blockedDates,
      minStayDuration,
      maxStayDuration,
      isActive,
      isPublished,
      isFeatured,
      slug,
      seoTitle,
      seoDescription,
      seoKeywords,
      lastModifiedBy,
      notes
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (address !== undefined) updateData.address = address;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (weekendPrice !== undefined) updateData.weekendPrice = parseFloat(weekendPrice);
    if (seasonalPricing !== undefined) updateData.seasonalPricing = seasonalPricing;
    if (extraGuestCharge !== undefined) updateData.extraGuestCharge = parseFloat(extraGuestCharge);
    if (cleaningFee !== undefined) updateData.cleaningFee = parseFloat(cleaningFee);
    if (securityDeposit !== undefined) updateData.securityDeposit = parseFloat(securityDeposit);
    if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms);
    if (maxGuests !== undefined) updateData.maxGuests = parseInt(maxGuests);
    if (totalArea !== undefined) updateData.totalArea = parseInt(totalArea);
    if (builtYear !== undefined) updateData.builtYear = parseInt(builtYear);
    if (rooms !== undefined) updateData.rooms = rooms;
    if (images !== undefined) updateData.images = images; // Accept as-is (strings or objects)
    if (videos !== undefined) updateData.videos = videos;
    if (virtualTourUrl !== undefined) updateData.virtualTourUrl = virtualTourUrl;
    if (features !== undefined) updateData.features = features;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (nearbyAttractions !== undefined) updateData.nearbyAttractions = nearbyAttractions;
    if (houseRules !== undefined) updateData.houseRules = houseRules;
    if (checkInTime !== undefined) updateData.checkInTime = checkInTime;
    if (checkOutTime !== undefined) updateData.checkOutTime = checkOutTime;
    if (cancellationPolicy !== undefined) updateData.cancellationPolicy = cancellationPolicy;
    if (petPolicy !== undefined) updateData.petPolicy = petPolicy;
    if (smokingPolicy !== undefined) updateData.smokingPolicy = smokingPolicy;
    if (partyPolicy !== undefined) updateData.partyPolicy = partyPolicy;
    if (availability !== undefined) updateData.availability = availability;
    if (blockedDates !== undefined) updateData.blockedDates = blockedDates;
    if (minStayDuration !== undefined) updateData.minStayDuration = parseInt(minStayDuration);
    if (maxStayDuration !== undefined) updateData.maxStayDuration = parseInt(maxStayDuration);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (slug !== undefined) updateData.slug = slug;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;
    if (lastModifiedBy !== undefined) updateData.lastModifiedBy = lastModifiedBy;
    if (notes !== undefined) updateData.notes = notes;

    const updatedVilla = await Villa.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVilla) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    res.json({
      success: true,
      message: 'Villa updated successfully',
      villa: updatedVilla
    });

  } catch (error) {
    console.error('Error updating villa:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update villa',
      error: error.message
    });
  }
});

// Delete villa
router.delete('/:id', async (req, res) => {
  try {
    const deletedVilla = await Villa.findByIdAndDelete(req.params.id);

    if (!deletedVilla) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    res.json({
      success: true,
      message: 'Villa deleted successfully',
      villa: deletedVilla
    });

  } catch (error) {
    console.error('Error deleting villa:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete villa',
      error: error.message
    });
  }
});

// Toggle villa active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id);

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    villa.isActive = !villa.isActive;
    await villa.save();

    res.json({
      success: true,
      message: `Villa ${villa.isActive ? 'activated' : 'deactivated'} successfully`,
      villa
    });

  } catch (error) {
    console.error('Error toggling villa status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle villa status',
      error: error.message
    });
  }
});

// Toggle villa published status
router.patch('/:id/toggle-published', async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id);

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    villa.isPublished = !villa.isPublished;
    await villa.save();

    res.json({
      success: true,
      message: `Villa ${villa.isPublished ? 'published' : 'unpublished'} successfully`,
      villa
    });

  } catch (error) {
    console.error('Error toggling villa published status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle villa published status',
      error: error.message
    });
  }
});

// Toggle villa featured status
router.patch('/:id/toggle-featured', async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id);

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found'
      });
    }

    villa.isFeatured = !villa.isFeatured;
    await villa.save();

    res.json({
      success: true,
      message: `Villa ${villa.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      villa
    });

  } catch (error) {
    console.error('Error toggling villa featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle villa featured status',
      error: error.message
    });
  }
});

module.exports = router;
