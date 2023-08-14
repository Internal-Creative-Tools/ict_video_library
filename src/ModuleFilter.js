class ModuleFilter extends HTMLElement {
    constructor() {
        super();
        this.render();
        this.input_assets = this.querySelector('#assets');
        this.input_labels = this.querySelector('#labels');
        this.input_checkboxes = this.querySelectorAll('input[type="checkbox"]');
        this.selected = [];
        this.init_listener();
    }

    // listener 
    init_listener() {
        // listener code here to talk to app
        this.input_assets.addEventListener('change', (event) => {
            this.emit_listner('quantity', event.target.value);
        });
        this.input_labels.addEventListener('change', (event) => {
            this.emit_listner('labels', event.target.value);
        });
        this.input_checkboxes.forEach((check_btn) => {
            check_btn.addEventListener('change', (event) => {
                const value = event.target.value;
                const name = event.target.name;
                // get a list of all checked boxes
                // if (this.selected.includes(value)) {
                //     // remove from array
                //     this.selected = this.selected.filter(item => item !== value);
                // } else {
                //     // add to array
                //     this.selected.push(value);
                // }
                this.emit_listner(name, value)
            });
        });
        this.querySelector(".form__clear").addEventListener('click', () => {
            // reset DOM
            this.reset_DOM();
            // send reset request to APP
            this.emit_listner('reset', '');
        });
    }

    emit_listner(name, value) {
        const custom_event = new CustomEvent('inputUpdate', {
            detail: { value: value, key: name },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(custom_event);
    }

    reset_DOM() {
        this.selected = [];
        this.input_checkboxes.forEach((check_btn) => {
            check_btn.checked = false;
        });
        this.input_assets.value = "";
        this.input_labels.value = "";
    }

    set data(values) {
        // parse the data and aggregate
        this.populate_dropdown(values);
    }

    // * Risky but cleaner and dynamic way to populate dropdown
    populate_dropdown(values) {
        for (let key in values) {
            values[key].forEach((item) => {
                const option = document.createElement('option');
                option.value = item;
                option.innerText = item;
                this.querySelector(`#${key}`).appendChild(option);
            });
        }
    }

    get styles() {
        return /*html*/ `
        <style>
            #module__filter {
                border: 1px solid black;
                padding: 2rem;
                min-height: 687px;
            }
            #module__filter .filter__header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            }
            #module__filter .filter__header h5 {
                font-size: 21px;
                font-weight: 700;
            }
            #module__filter .filter__header span {
                font-size: 12px;
                font-weight: 400;
                cursor: pointer;
            }
            #module__filter .form__input {
                display: flex;
                flex-direction: column;
                margin-bottom: 1.25rem;
            }
            #module__filter .form__input.fixed__width {
                width: 263px;
            }
            #module__filter .form__input .form__input__flex {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            #module__filter .form__input .form__dropdown__container i {
                position: absolute;
                top: 50%;
                right: 14px;
                transform: translateY(-50%);
                pointer-events: none;
            }
            #module__filter .form__input .form__dropdown__container {
                position: relative;
            }
            #module__filter .form__input .form__row {
                margin-bottom: 0.5rem;
            }
            #module__filter .form__input .form__label {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 1rem;
            }
            #module__filter .form__input .dropdown__container {
                position: relative;
            }
            #module__filter .form__input .dropdown__container i {
                position: absolute;
                top: 12px;
                left: 230px;
            }
            #module__filter .form__input .input_sm {
                width: 70px;
                position: relative;
            }
         </style>   
        `;
    }

    get template() {
        return /*html*/`
        ${this.styles}
        <div id="module__filter">
            <div class="filter__header">
                <h5>Filter by</h5>
                <span class="form__clear">Clear</span>
            </div>
            <form>
                <div class="form__input">
                    <label class="form__label" for="duration">Duration</label>
                    <div class="form__row">
                        <input type="checkbox" name="duration" value="15">
                        <label>15 sec</label>
                    </div>
                    <div class="form__row"> 
                        <input type="checkbox" name="duration" value="30">
                        <label>30 sec</label>
                    </div>
                </div>
                <div class="form__input">
                    <label class="form__label" for="file_type">PSD or Mogrt</label>
                    <div class="form__row">
                        <input type="checkbox" name="file_type" value="psd">
                        <label>PSD</label>
                    </div>
                    <div class="form__row"> 
                        <input type="checkbox" name="file_type" value="mogrt">
                        <label>MOGRT</label>
                    </div>
                </div>
                <div class="form__input">
                    <label class="form__label" for="media_type">Image or Video</label>
                    <div class="form__row">
                        <input type="checkbox" name="media_type" value="image">
                        <label>Image</label>
                    </div>
                    <div class="form__row"> 
                        <input type="checkbox" name="media_type" value="video">
                        <label>Video</label>
                    </div>
                </div>
                <div class="form__input">
                     <label class="form__label" for="quantity">Number of Assets</label>
                    <div class="form__input__flex">
                        <span>Image/Video</span>
                        <div class="form__dropdown__container">
                            <select class="input input_sm" id="assets">
                                <option value="">Any</option>
                            </select>
                            <i class="fa-solid fa-caret-down"></i>
                        </div>
                    </div>
                </div>
                <div class="form__input fixed__width">
                    <label class="form__label" for="labels">Labels</label>
                    <div class="form__dropdown__container">
                        <select class="input" id="labels">
                            <option value="">Any</option>
                        </select>
                        <i class="fa-solid fa-caret-down"></i>
                    </div>
                </div>
            </form>
        </div>
        `;
    }

    render() {
        this.innerHTML = this.template;
    }
}

customElements.define('module-filter', ModuleFilter);