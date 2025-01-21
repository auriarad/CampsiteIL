document.addEventListener("DOMContentLoaded", () => {
    const photosContainer = document.getElementById("photos");
    const images = photosContainer.querySelectorAll("#photos img");
    const numImages = images.length;

    // Dynamically calculate columns (2-4)
    const columnCount = Math.max(Math.min(Math.ceil(numImages / 2), 4), 2);

    // Apply column count
    if (numImages < 3) {
        photosContainer.setAttribute('style', 'column-count: 1 !important');
        for (img of images) {
            img.style.width = '48%';
        }
    }
    else {
        photosContainer.style.columnCount = columnCount;

    }
});
