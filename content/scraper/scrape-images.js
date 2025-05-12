// Script to scrape images from web pages

// Function to scrape images from a specific selector
function scrapeImages(selector) {
    const images = document.querySelectorAll(selector);
    return Array.from(images).map(img => img.src);
}

// Function to filter and remove duplicate images
function filterImages(images) {
    const uniqueImages = new Set(images);
    return Array.from(uniqueImages);
}

// Function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions
export { scrapeImages, filterImages, delay };