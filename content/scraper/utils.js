// Utility functions for filtering images, deduplication, delays, etc.

// Function to filter images based on certain criteria
function filterImages(images, criteria) {
  return images.filter(image => {
    // Apply filtering logic based on criteria
    return criteria(image);
  });
}

// Function to remove duplicate images
function deduplicateImages(images) {
  const uniqueImages = [];
  const imageSet = new Set();

  images.forEach(image => {
    if (!imageSet.has(image.src)) {
      uniqueImages.push(image);
      imageSet.add(image.src);
    }
  });

  return uniqueImages;
}

// Function to introduce a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { filterImages, deduplicateImages, delay };