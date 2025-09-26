// Migration script to update existing stories to new viewer format
const mongoose = require('mongoose');
require('dotenv').config();

const { Story } = require('../models/Story.js');

async function migrateStoryViewers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://pithiyapratik13:%40123456789@cluster12.bmre8jf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster12");
    console.log('✅ Connected to MongoDB');

    // Find all stories with old viewer format
    const stories = await Story.find({});
    let updatedCount = 0;

    for (let story of stories) {
      let needsUpdate = false;
      const newViewers = [];

      // Check if viewers need migration
      for (let viewer of story.viewers) {
        if (typeof viewer === 'string' || (viewer._id && !viewer.userId)) {
          // Old format - convert to new format
          newViewers.push({
            userId: viewer._id || viewer,
            viewedAt: story.createdAt // Use story creation date as fallback
          });
          needsUpdate = true;
        } else if (viewer.userId) {
          // Already new format
          newViewers.push(viewer);
        }
      }

      if (needsUpdate) {
        story.viewers = newViewers;
        story.viewCount = newViewers.length;
        story.isActive = true; // Set default value
        await story.save();
        updatedCount++;
        console.log(`✅ Updated story ${story._id} - ${newViewers.length} viewers`);
      }
    }

    console.log(`✅ Migration completed! Updated ${updatedCount} stories`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateStoryViewers();
}

module.exports = migrateStoryViewers;