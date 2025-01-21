const container = document.getElementById('camps-container');
const limit = 8;
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let featuresList = ''

const updateHandeler = () => {
    container.innerHTML = '';
    currentPage = 1;
    hasMore = true;
    fetchCamps();
};

//DropdownSelector class
class DropdownSelector {
    constructor(updateHandeler, selectorType, inverted) {
        this.updateHandeler = updateHandeler;
        this.checkboxes = document.querySelectorAll(`${selectorType} input[type="checkbox"]`);
        this.dropdownItems = document.querySelectorAll(`${selectorType} .dropdown-item`);
        this.selected = [];
        this.inverted = inverted;

        // Initialize event listeners
        this.init();
    }

    updateSelected() {
        this.selected = [];
        this.checkboxes.forEach(checkbox => {
            if (checkbox.checked !== this.inverted) {
                this.selected.push(checkbox.value);
            }
        });
        this.updateHandeler();
    }

    selectAll() {
        const allChecked = Array.from(this.checkboxes).every(cb => cb.checked);
        this.checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        this.updateSelected();
    }

    init() {
        this.checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelected());
        });

        this.dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
}

//features selector
const featuresDropdown = new DropdownSelector(
    updateHandeler,
    '.features-select',
    true
);

//region selector
const regionDropdown = new DropdownSelector(
    updateHandeler,
    '.location-select',
    false
);

//search
let searched = '';
const searchBox = document.querySelector('#searchBox')
searchBox.addEventListener('input', () => {
    searched = searchBox.value;
    updateHandeler();
});


//fetch
async function fetchCamps() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    document.getElementById('loading').style.display = 'block';
    try {
        const response = await fetch(`/campsites/api?search=${searched}&filter=${featuresDropdown.selected}&regions=${regionDropdown.selected}&page=${currentPage}&limit=${limit}`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            });
        const data = await response.json();
        hasMore = data.hasMore;
        featuresList = data.featuresList;
        currentPage++;
        data.campsites.forEach(camp => {
            container.insertAdjacentHTML('beforeend', createCampCard(camp));
        });

        // Initialize new Bootstrap carousels
        data.campsites.forEach(camp => {
            if (camp.imgs && camp.imgs.length > 1) {
                new bootstrap.Carousel(document.getElementById(`carousel${camp._id}`));
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('footer');

    if (!container) {
        console.error('Footer element not found!');
        return;
    }

    const observer = new IntersectionObserver(callback, {
        root: null,        // intersect with the viewport
        rootMargin: '0px', // no margin when computing intersections
        threshold: 0.1,    // Trigger when 10% of the element is visible
    });

    observer.observe(container); // Start observing the footer element

    function callback(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                fetchCamps(); // Call your fetch function
            }
        }
    }
});


function createCampCard(camp) {

    const hasMultipleImages = camp.imgs && camp.imgs.length > 1;
    const defaultImage = "https://res.cloudinary.com/dqvhkjjyh/image/upload/v1737065143/No_image_available.svg_kzx4v9.png";

    const carouselItems = camp.imgs && camp.imgs.length
        ? camp.imgs.map((img, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''} showCarouselImg">
                <img src="${img.url}" class="" alt="${camp.title} תמונה">
            </div>
        `).join('')
        : `<div class="carousel-item active showCarouselImg">
            <img src="${defaultImage}" class="" alt="${camp.title} תמונה">
           </div>`;

    const carouselControls = hasMultipleImages ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#carousel${camp._id}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carousel${camp._id}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
    ` : '';

    const features = camp.features ? camp.features.map((feature) =>
        `<span class="badge rounded-pill feature${featuresList.indexOf(feature)}">
        ${feature}
        </span>`
    ) : '';

    return `
        <div class="card mb-2 mb-3">
            <div class="row">
                <div class="col-md-4">
                    <div id="carousel${camp._id}" class="carousel slide">
                        <div class="carousel-inner imgCarousel">
                            ${carouselItems}
                        </div>
                        ${carouselControls}
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card-body h-100 d-flex flex-column">
                        <div class="d-flex flex-row justify-content-between">
                            <h4 class="card-title">${camp.title}</h4>
                            <p class="card-text">
                                <i class="svgLocation"></i>
                                ${camp.region}
                            </p>
                        </div>
                        <div class="d-none d-lg-block">
                        ${features.toString().replaceAll(',', '')}
                        </div>
                        <a class="btn moreInfo mt-auto" href="/campsites/${camp._id}">לעוד מידע</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}


