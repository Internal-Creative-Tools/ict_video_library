//**** Video Card Component ****/
class VideoCard extends HTMLElement {
  _default_thumbnail = "https://drive.google.com/uc?export=download&id=1X7sid7-UY5XEjG-EsfUXYjbkuqP6yVt4";
  _broken_thumbnail = "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";
  _video_src = '';
  _thumbnail = '';
  _video_title;
  _duration = '';
  _href = '';
  _missing_src = false;
  has_played = false;
  id;

  constructor() {
    super();
    this._video_src = this.getAttribute('video_src') || '';
    this._thumbnail = this.getAttribute("thumbnail") || '';
    this._duration = +this.getAttribute('duration') || '';
    this._href = this.getAttribute('href') || '';
    this.id = this.getAttribute('id') || '';
    this._video_title = this.getAttribute('video_title') || false;
    this.render();
  }

  connectedCallback() {
    // Get the play and pause buttons using their IDs
    const playButton = this.querySelector('#play');
    const pauseButton = this.querySelector('#pause');
    const video = this.querySelector('video');

    if (this._video_src.length < 1) {
      this._missing_src = true;
    } else {
      // to avoid too many loading animations, only load video on play
      video.dataset.src = this._video_src;
    }

    // Add event listener for play button click
    playButton.addEventListener('click', () => {
      // set has played to true to remove thumbnail
      this.remove_thumbnail();
      this.play(video);
    });

    // Add event listener for pause button click
    pauseButton.addEventListener('click', () => {
      this.pause(video);
    });
    video.addEventListener('play', () => {
      this.toggle_buttons();
    });
    video.addEventListener('pause', () => {
      this.toggle_buttons();
    });
    video.addEventListener('timeupdate', () => {
      const time = Math.round(video.duration) - Math.round(video.currentTime);
      //console.log(time === true);
      this.querySelector('.module_card .card_time').innerText = `0:${ time ? String(time).padStart(2, '0') : this._duration}`;
    });
    // video.addEventListener('loadeddata', () => {
    //   this.querySelector('.module_card module-loader').style.display = "none";
    // })
  }

  play(video) {
    // hide play button and unhide pause button
    const videoSrc = video.dataset.src;
    if (videoSrc && !this.has_played) {
      video.src = videoSrc;
      video.load();
      this.handle_loading(video);
      this.has_played = true;
    }
    video.play();
    // pause all other instances of video playing
    // dispatch event here
    const id = this.id;
    const custom_event = new CustomEvent('videoPlayback', {
      detail: { video_id: id },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(custom_event);
  }
  pause(video) {
    video.pause();
  }

  // handles the loading animation and behavior on video player
  handle_loading(video) {
    const loader = this.querySelector('.module_card module-loader #module__loader');
    loader.style.display = "flex";
    video.addEventListener('loadeddata', () => {
      loader.style.display = "none";
    })
  }

  // toggles the playback buttons for the module
  toggle_buttons() {
    this.querySelector('#pause').classList.toggle('hidden');
    this.querySelector('#play').classList.toggle('hidden');
  }

  // removes video thumbnail after initla playback
  remove_thumbnail() {
    const thumbnail = this.querySelector("img.card_image");
    if (thumbnail !== null) {
      thumbnail.remove();
    }
  }

  // determines whther to use provided thumbail or a fallback thumbnail
  handle_thumbnmail() {
    if (this._thumbnail.length <= 1) {
      if (this._video_src.length > 0) {
        // we have a video but not thumbnail
        this._thumbnail = this._default_thumbnail;
      } else {
        this._thumbnail = this._broken_thumbnail;
      }
    }
  }

  get styles() {
    const module = `.module_card#module_card_${this.id}`;
    return /*html*/ `
        <style> 
            ${module}.module_card {
              position: relative;
            }
            ${module} video {
                width: 100%;
                height: auto;
                max-height: 100%;
                border-radius: 15px;
            }
            ${module} .icon {
                color: white;
                font-size: 4rem;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: none;
                transition: var(--transition);

            }
            ${module} a {
                color: black;
                text-decoration: none;
            }
            ${module} a.disabled {
                color: gray;
                pointer-events: none;
                cursor: not-allowed;
            }
            ${module} .card_thumbnail {
                border-radius: 15px;
                position: relative;
                height: 100%;
                cursor: pointer;
            }
            ${module} .card_thumbnail:hover .icon:not(.hidden) {
                display: block;
            }
            ${module} .card_thumbnail .card_time {
                color: white;
                background-color: black;
                border-radius: 5px;
                position: absolute;
                bottom: 10px;
                right: 10px;
                font-size: 12px;
                padding: 2px 8px;
            }
            ${module} .card_link {
                margin-top: 0.5rem;
                display: flex;
                justify-content: space-between;
            }
            ${module} .card_link span {
                flex: 2;
                overflow: hidden;
                max-height: 1.5rem;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
            }
            ${module} .card_link a {
                flex: 1;
                text-align: right;
            }
            ${module} .card_link i {
                margin-right: 0.5rem;
            }
            ${module} .card_thumbnail .card_image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 15px;
            }
            ${module} .card_link .no_title {
              color: gray;
            }
            ${module} .card_thumbnail.disabled {
              cursor: not-allowed;
            }
            ${module} .card_thumbnail.disabled::after {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                font-weight: 700;
                height: 100%;
                content: 'Invalid Video';
                color: #e1e1e1;
                display: flex;
                z-index: 5;
                justify-content: center;
                align-items: center;
            }
            ${module} .card_thumbnail.disabled i {
              display: none;
            }
            ${module} .card_thumbnail.disabled:hover .icon {
              display: none;
            }
            ${module} .card_thumbnail.disabled img {
              filter: brightness(0.3); 
            }
            ${module} .card_thumbnail.disabled .card_time {
              display: none;
            }
        </style>
        `;
  }

  get template() {
    return /*html*/ `
        ${this.styles}
         <div class="module_card" id="module_card_${this.id}">
            <div class="card_thumbnail ${this._video_src.length < 1 ? 'disabled' : ""}">
                <video id="video_${this.id}"></video>
                <img class="card_image" src="${this._thumbnail}" alt="video thumbnail placeholer" />
                <div class="card_time">0:${this._duration}</div>
                <i id="pause" class="fa-solid fa-pause icon hidden"></i>
                <i id="play" class="fa-solid fa-play icon"></i>
                <module-loader></module-loader>
            </div>
            <div class="card_link">
                ${this._video_title ? `<span>${this._video_title}</span>` : "<span class='no_title'>Untitled</span>"}
                <a href="${this._href}" class="${this._href.length < 1 ? 'disabled' : ''}" target="_blank"><i class="fa-solid fa-link"></i>Dropbox</a>
            </div>
        </div>
        `;
  }

  render() {
    this.handle_thumbnmail();
    this.innerHTML = this.template;
  }
}

/*** Video Nav component ***/
class VideoNav extends HTMLElement {
  form_data = {
    sort: 'new',
    duration: '30',
    file_type: 'mogrt',
    media_type: 'video',
    quantity: '',
  };
  dropdown_input;
  current_duration;
  timer = null;
  all_labels = [];
  selected_labels = [];
  _available_assets = [];
  constructor() {
    super();
  }

  // adds listener to all user inputs
  connectedCallback() {
    this.render();
    this.init_form_listeners();
  }

  init_form_listeners() {
    this.dropdown_input = this.querySelector('.app_nav .dropdown-input');
    const pills_container = this.querySelector('.app_nav .nav-pills');
    // Get the parent element
    const navElement = this.querySelector('.app_nav');

    // Add event listener for change event on the parent element
    navElement.addEventListener('change', (event) => {
      // Check if the target element that triggered the event is within the navElement
      if (
        event.target.closest('.app_nav') &&
        !event.target.parentElement.classList.contains('dropdown-label')
      ) {
        //console.log("An input change was detected!")
        // Access the target element and its value
        const targetElement = event.target;
        const targetValue = targetElement.value;

        // Implement your logic here based on the target element and its value
        this.form_data[targetElement.name] = targetValue;

        const form_data = this.form_data; // need this format as trying to pass this.var_name is not supoorted
        // const custom_event = new CustomEvent('videoFormUpdate', {
        //   detail: { ...form_data },
        //   bubbles: true,
        //   composed: true,
        // });

        this.querySelector('input#quantity').placeholder = form_data.quantity;
        this.dispatchEvent(this.custom_event('videoFormUpdate', {...form_data}));
      }
    });

    // event listner to hide each nav section on click
    this.querySelectorAll('.collapsible').forEach((el) => {
      el.addEventListener('click', function () {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.style.display === 'block') {
          content.style.display = 'none';
        } else {
          content.style.display = 'block';
        }
      });
    });

    // hide the nav dropdown when user clickes in input text field for labels
    this.dropdown_input.addEventListener('click', () => {
      this.querySelector('.app_nav .dropdown-list').classList.remove('hidden');
    });

    // add's an input listener to user typed input
    this.dropdown_input.addEventListener('input', (e) => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const query = e.target.value;
        // need this to remove the re-introduction of removed labels
        const current_options = this.all_labels.filter(
          (item) => !this.selected_labels.includes(item)
        );
        const valid_labels = current_options.filter((d) =>
          d.toLowerCase().includes(query.toLowerCase())
        );
        this.update_labels_list(valid_labels);
      }, 300);
      // get the valid labels
    });

    // open font dropdown when clicking input field, closes when clocking font item ot outside element
    this.addEventListener('click', (e) => {
      const dropdown = this.querySelector('.app_nav .dropdown-list');
      if (e.target.closest('.dropdown-label')) return;
      if (!dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
      }
    });

    // use event delegation to handle label dropdown for <li> and <i>
    this.querySelector('.app_nav .content.labels').addEventListener(
      'click',
      (event) => {
        if (event.target.tagName === 'LI') {
          const selected = event.target.getAttribute('data-id');
          this.selected_labels.push(selected);
          // remove the slected item from the available input
          this.update_labels_list(
            this.all_labels.filter(
              (item) => !this.selected_labels.includes(item)
            )
          );
          this.dropdown_input.value = '';

          // add a pill to the labels section
          pills_container.innerHTML += `
            <div class="nav-pill">
              <span>${selected}</span>
              <i data-id="${selected}" class="fa-solid fa-circle-xmark"></i>
            <div>`;

          // dispatch the event to the main application
          const selected_labels = this.selected_labels;
          // const custom_event = new CustomEvent('labelsUpdate', {
          //   detail: { ...selected_labels },
          //   bubbles: true,
          //   composed: true,
          // });
          this.dispatchEvent(this.custom_event('labelsUpdate', {...selected_labels}));
        }
        if (event.target.tagName === 'I') {
          const removed_label = event.target.getAttribute('data-id');
          // remove pill
          event.target.parentElement.remove();
          // updated selected labes array
          this.selected_labels = this.selected_labels.filter(
            (label) => label !== removed_label
          );

          this.update_labels_list(
            this.all_labels.filter(
              (item) => !this.selected_labels.includes(item)
            )
          );

          // dispatch the event to the main application
          const selected_labels = this.selected_labels;
          // const custom_event = new CustomEvent('labelsUpdate', {
          //   detail: { ...selected_labels },
          //   bubbles: true,
          //   composed: true,
          // });
          this.dispatchEvent(this.custom_event('labelsUpdate', { ...selected_labels}));
        }
      }
    );
  }

  update_labels_list(labels) {
    const ul = this.querySelector('ul');
    ul.innerHTML = '';
    labels.forEach((label) => {
      ul.innerHTML += `
      <li data-id="${label}">${label}</li>
    `;
    });
  }

  init_list_listeners() {
    const li = this.querySelectorAll('.app_nav .dropdown-list li');
    if (li.length > 0) {
      li.forEach((el) =>
        el.addEventListener('click', () => {
          //console.log("you clik me")
          this.querySelector('.app_nav .dropdown-list').classList.add('hidden');
          this.dropdown_input.value = el.innerText;
        })
      );
    }
  }

  render_asset_dropdown(values) {
    this.querySelector('input#quantity').value = "";
    const input_asset = this.querySelector('#quantity_list');
    input_asset.innerHTML = "";
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      input_asset.appendChild(option);
    })
  }

   custom_event(event_name, details) {
    return new CustomEvent(event_name, {
      detail: details,
      bubbles: true,
      composed: true,
    })
  }

  attributeChangedCallback(attributeName, oldValue, newValue) {
    // Add your logic here based on the attribute changes
    if (attributeName === 'labels') {
      this.all_labels = newValue.split(',');
      this.update_labels_list(this.all_labels);
      this.init_list_listeners();
    } 
    if (attributeName === 'available_assets') {
      this._available_assets = newValue.split(',');
      this.render_asset_dropdown(this._available_assets);
    }
  }

  static get observedAttributes() {
    // Specify the list of attributes to observe for changes
    return ['labels', 'available_assets'];
  }

  get styles() {
    return /*html*/ `
      <style>
        li {
          list-style: none;
        }
       .app_nav {
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      }
       .app_nav .collapsible {
        background-color: #ededed;
        color: black;
        cursor: pointer;
        padding: 0.5rem 1rem;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 18px;
        text-transform: uppercase;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid lightgray;
      }
      .app_nav .content {
        padding: 0 18px;
        display: none;
        padding: 1rem;
      }
      .app_nav .nav_sort,
      .app_nav .dropdown-input {
        height: 2rem;
        padding: 0 1rem;
        border-radius: 15px;
        width: 100%;
        font-size: 16px;
        border: 1px solid black;
      }
      .app_nav .nav_input-content {
        margin-bottom: 1rem;
      }
      .app_nav .content .dropdown-label {
        position: relative;
      }
      .app_nav .content .dropdown-list {
        position: absolute;
        top: 32px;
        left: 0;
        max-height: 150px;
        width: 276px;
        z-index: 99;
        display: block;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        background-color: white;
        overflow: hidden;
        overflow-y: scroll;
      }
      .app_nav .content .dropdown-list.hidden {
        display: none;
      }
      .app_nav .content .dropdown-list li {
        padding: 0.25rem 0.75rem;
        cursor: pointer;
      }
      .app_nav .content .dropdown-list li:hover {
        background-color: #e8e7e7;
      }
      .app_nav .nav-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 1rem;
      }
      .app_nav .nav-pills .nav-pill {
        font-size: 14px;
        background-color: lightgray;
        padding: 4px 8px;
        border-radius: 12px;
      }
      .app_nav .nav-pills .nav-pill i {
        margin-left: 4px;
        cursor: pointer;
      }
      .app_nav .collapsible.active i {
        transform: rotate(180deg);
      }
      .app_nav .collapsible i {
        transform: rotate(0);
        transition: all ease 300ms;
      }
      .app_nav .nav_input-content #quantity {
        width: 60px;
        margin-left: 0.5rem;
      }
    </style>`;
  }

  get template() {
    return /*html*/ `
      ${this.styles}
      <nav class="app_nav">
        <button type="button" class="collapsible input-callback">
          <div>Sort By</div>
          <i class="fa-solid fa-caret-up"></i>
        </button>
        <div class="content" style="display: block">
          <!-- dropdown here -->
          <select name="sort" id="sort" class="nav_sort">
            <option value="new">Newest to Oldest</option>
            <option value="old">Oldest to Newest</option>
            <option value="updated">Last Updated</option>
          </select>
        </div>
        <button type="button" class="collapsible input-callback">
          <div>Filter By</div>
          <i class="fa-solid fa-caret-up"></i>
        </button>
        <div class="content" style="display: block">
          <div class="nav_input-content">
            <!-- duration setting -->
            <h3>Duration</h3>
            <div>
              <input type="radio" name="duration" value="15" />
              <label for="duration">15s</label>
            </div>
            <div>
              <input type="radio" name="duration" value="30" checked />
              <label for="duration">30s</label>
            </div>
          </div>
          <div class="nav_input-content">
            <!-- file type -->
            <h3>PSD or MOGRT</h3>
            <div>
              <input type="radio" name="file_type" value="psd" />
              <label for="file_type">PSD</label>
            </div>
            <div>
              <input type="radio" name="file_type" value="mogrt" checked />
              <label for="file_type">MOGRT</label>
            </div>
          </div>
          <div class="nav_input-content">
            <!-- media type -->
            <h3>Image or Video</h3>
            <div>
              <input type="radio" name="media_type" value="image" />
              <label for="media_type">Image</label>
            </div>
            <div>
              <input type="radio" name="media_type" value="video" checked />
              <label for="media_type">Video</label>
            </div>
          </div>
          <div class="nav_input-content">
            <h3>Number of Assets</h3>
            <div>
              <label for="quantity">Image/Video</label>
              <input list="quantity_list" id="quantity" name="quantity" placeholder="Select">
              <datalist id="quantity_list"></datalist>
            </div>
          </div>
        </div>
        <button type="button" class="collapsible">
          <div>Labels</div>
          <i class="fa-solid fa-caret-up"></i>
        </button>
        <div class="content labels" style="display: block">
          <div class="nav-pills"></div>
          <div class="dropdown-label">
            <input
              type="text"
              name="labels"
              id="labels"
              class="dropdown-input"
              placeholder="Search"
            />
            <ul class="dropdown-list hidden"></ul>
          </div>
        </div>
      </nav>    
    `;
  }

  render() {
    this.innerHTML = this.template;
  }
}

class Loader extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get styles() {
    return /*html*/ `
    <style>
    #module__loader {
      background-color: #000000b0;
      display: none;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      z-index: 50;
      top: 0;
      left: 0;
      position: absolute;
      border-radius: 15px;
    }

    #module__loader svg {
      transform: scale(3);
    }
    </style>
    `
  }

  get template() {
    return /*html*/`
    ${this.styles}
      <div id="module__loader" title="7">
        <svg version="1.1" id="Layer_1" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background: new 0 0 50 50" xml:space="preserve">
          <rect x="0" y="10" width="4" height="10" fill="#f54036" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
            <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
            <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
          </rect>
          <rect x="8" y="10" width="4" height="10" fill="#236dab" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
            <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
            <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
          </rect>
          <rect x="16" y="10" width="4" height="10" fill="#07293a" opacity="0.2">
            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
            <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
            <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
          </rect>
        </svg>
      </div>
    `
  }

  render() {
    this.innerHTML = this.template;
  }
}

// Define all components here
customElements.define('module-loader', Loader);
customElements.define('module-video', VideoCard);
customElements.define('module-video-nav', VideoNav);
