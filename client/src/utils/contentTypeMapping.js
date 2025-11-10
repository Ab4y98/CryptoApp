// Map content types to their corresponding dashboard sections
export const CONTENT_TYPE_MAPPING = {
  'Market News': 'news',
  'Charts': 'prices',
  'Social': 'insight',
  'Fun': 'meme',
};

// Check if a content type should be shown
export const shouldShowContent = (contentType, userPreferences) => {
  if (!userPreferences || !userPreferences.contentTypes) {
    return true; // Show all by default if no preferences
  }
  return userPreferences.contentTypes.includes(contentType);
};

