const features = [
    'בתשלום',
    'שירותים',
    'מים לשתייה',
    'בקרבת מקור מים',
    'איסור מדורות',
    'חיבור לחשמל'];

class MultiSelect {
    constructor(options = features) {
        this.options = options;
        this.selected = [];
        this.highlighted = 0;

        this.elements = {
            container: document.getElementById('multiSelectContainer'),
            input: document.getElementById('multiSelectInput'),
            dropdown: document.getElementById('dropdownMenu'),
            form: document.getElementById('CampForm'),
            items: document.querySelectorAll('.dropdown-item')
        };

        if (this.elements.input.value !== '') {
            const startingValues = this.elements.input.value.split(",");
            for (const startingValue of startingValues) {
                this.select(startingValue);
            }
        }


        this.init();
    }

    init() {
        this.elements.input.addEventListener('input', () => this.filterOptions());
        this.elements.input.addEventListener('focus', () => this.showDropdown());
        this.elements.input.addEventListener('keydown', (e) => this.handleKeys(e));
        document.addEventListener('click', (e) => {
            if (!this.elements.container.contains(e.target)) this.hideDropdown();
        });
        this.elements.form.addEventListener('submit', (event) => {
            if (this.elements.form.checkValidity()) {
                this.elements.input.value = this.selected
            }
        })
    }

    handleKeys(e) {
        const visible = this.getVisible();
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                e.preventDefault();
                const direction = e.key === 'ArrowDown' ? 1 : -1;
                this.highlighted = Math.max(0, Math.min(this.highlighted + direction, visible.length - 1));
                this.renderDropdown();
                this.scrollToHighlighted();
                break;
            case 'Enter':
                e.preventDefault();
                if (visible[this.highlighted]) this.select(visible[this.highlighted]);
                break;
            case 'Backspace':
                if (!this.elements.input.value && this.selected.length)
                    this.remove(this.selected[this.selected.length - 1]);
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }

    getVisible() {
        const term = this.elements.input.value.toLowerCase();
        return this.options.filter(opt =>
            !this.selected.includes(opt) &&
            opt.toLowerCase().includes(term)
        );
    }

    filterOptions() {
        this.highlighted = 0;
        this.showDropdown();
    }

    renderDropdown() {
        const visible = this.getVisible();
        this.elements.dropdown.innerHTML = visible.length
            ? visible.map((opt, i) => `
                <div class="dropdown-item ${i === this.highlighted ? 'highlighted' : ''}" data-index="${i}" data-option="${opt}">
                    ${opt}
                </div>
            `).join('')
            : '<div class="dropdown-item">No matches found</div>';

        // Add event listeners to the rendered items
        this.elements.dropdown.querySelectorAll('.dropdown-item').forEach((item) => {
            item.addEventListener('mouseover', () => {
                if (this.highlighted !== parseInt(item.getAttribute('data-index'), 10)) {
                    this.highlighted = parseInt(item.getAttribute('data-index'), 10);
                    this.renderDropdown()
                }
            });

            item.addEventListener('click', (event) => {
                const option = item.getAttribute('data-option');
                if (option) this.select(option);
                event.stopPropagation(); // Prevent event bubbling
            });

        });

    }

    select(option) {
        if (!this.selected.includes(option)) {
            this.selected.push(option);
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.setAttribute('data-value', option);  // Add data attribute for easier removal
            tag.innerHTML = `
                    ${option}
                    <button type="button" class="remove-tag">&times;</button>
                `;
            tag.multiSelect = this;
            this.elements.container.insertBefore(tag, this.elements.container.lastElementChild);

            tag.addEventListener('click', () => this.remove(option))
        }
        this.elements.input.value = '';
        this.renderDropdown();
        this.elements.input.focus();
    }

    remove(option) {
        this.selected = this.selected.filter(item => item !== option);
        const tag = this.elements.container.querySelector(`.tag[data-value="${option}"]`);
        if (tag) {
            tag.remove();
        }
        this.filterOptions();
        this.elements.input.focus();
    }

    showDropdown() {
        this.elements.dropdown.style.display = 'block';
        this.renderDropdown();
    }

    hideDropdown() {
        this.elements.dropdown.style.display = 'none';
        this.highlighted = 0;
    }

    scrollToHighlighted() {
        const highlighted = this.elements.dropdown.querySelector('.highlighted');
        if (highlighted) highlighted.scrollIntoView({ block: 'nearest' });
    }
}

document.addEventListener('DOMContentLoaded', () => new MultiSelect());
