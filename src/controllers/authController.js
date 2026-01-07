const User = require('../models/User');

// GET /api/auth/profile - Get or create user profile
const getOrCreateProfile = async (req, res) => {
  try {
    const { sub: auth0Id, email, name, picture } = req.auth;

    // Try to find existing user
    let user = await User.findOne({ auth0Id });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        auth0Id,
        email,
        name,
        picture: picture || ''
      });
      await user.save();
    } else {
      // Update user info if it has changed
      let updated = false;
      if (user.email !== email) {
        user.email = email;
        updated = true;
      }
      if (user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (picture && user.picture !== picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving or creating user profile',
      error: error.message
    });
  }
};

module.exports = {
  getOrCreateProfile
};
