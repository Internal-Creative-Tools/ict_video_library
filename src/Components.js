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
    this.MAX_LABEL_HEIGHT = 26;
  }


  connectedCallback() {
    // Get the play and pause buttons using their IDs
    const playButton = this.querySelector('#play');
    const pauseButton = this.querySelector('#pause');
    const video = this.querySelector('video');
    const card_labels = this.querySelector('.card_labels');
    const img_height_ref = this.querySelector(".card_image").clientHeight;
    const offset = 2;
    let set_height_flag = false;

    if (this._video_src.length < 1) {
      this._missing_src = true;
    } else {
      // to avoid too many loading animations, only load video on play
      video.dataset.src = this._video_src;
    }

    // Add event listener for play button click
    playButton.addEventListener('click', () => {
      //! The video height will auto adjust after video load, 
      //! we need to prevent this by forcing its height to be the same as the thumbnail image
      if (!set_height_flag) {
        set_height_flag = true;
        video.style.height = `${img_height_ref - offset}px`;
      }
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
      this.querySelector('.module_card .card_time').innerText = `0:${ time ? String(time).padStart(2, '0') : this._duration}`;
    });

    this.querySelector('.card_labels .label_cursor').addEventListener('click', function() {
      this.classList.toggle('active');
      card_labels.classList.toggle('active');
    });

     this.check_overflow();
  }

  set data (value) {
    this._video_src = value.video_file || '';
    this._thumbnail = value.image || '';
    this._duration = +value.duration || '';
    this._href = value.working_files|| '';
    this.id = value.id || '';
    this._labels = value.labels || '';
    this._video_title = value.video_title || false;

    this.render();
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
    const loader = this.querySelector('module-loader #module__loader');
    loader.style.display = "flex";
    video.addEventListener('loadeddata', function() {
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
      thumbnail.style.opacity = 0;
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

  render_labels() {
    let html = '';
    this._labels.forEach((label) => {
      html += `<div class="label">${label}</div>`
    });
    return html;
  }

  check_overflow() {
    const labels_container = this.querySelector('.card_labels');
    const height = labels_container.scrollHeight;
    if (height <= this.MAX_LABEL_HEIGHT) {
      // hide dropdown
      this.querySelector('.card_labels .label_cursor').classList.add('hidden');
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
                object-fit: fill;
            }
            ${module} .icon {
                color: black;
                background-color: white; 
                border-radius: 50%;
                font-size: 2rem;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: none;
                transition: var(--transition);
                z-index: 2;
                width: 60px;
                height: 60px;
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
                position: relative;
                height: auto;
                cursor: pointer;
                transition: var(--transition);
                max-height: 204px;
                overflow: hidden;
            }
            ${module} .card_thumbnail:hover::before {
                content: "";
                width: 100%;
                height: 99%;
                position: absolute;
                top: 0;
                left: 0;
                background-color: rgba(0,0,0,0.3);
                z-index: 1;
            }
            ${module} .card_thumbnail:hover .icon:not(.hidden) {
                display: flex;
                justify-content: center;
                align-items: center;
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
                font-size: 12px;
                font-weight: 400;
                max-height: 1.5rem;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
            }
            ${module} .card_link a {
                flex: 1;
                text-align: right;
                font-size: 12px;
                font-weight: 400;
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
            }
            ${module} .card_link .no_title {
              color: gray;
            }
            ${module} .card_labels {
              display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;
              margin-top: 1rem;
              overflow: hidden;
              height: 100%;
              max-height: 26px;
              padding-right: 1.5rem;
              position: relative;
            }
            ${module} .card_labels.active {
              max-height: 100%;
            }
            ${module} .card_labels .label_cursor {
              position: absolute;
              right: 0px;
              top: 0px;
              transition: all ease 300ms;
              cursor: pointer;
            }
            ${module} .card_labels .label_cursor.hidden {
              display: none;
            }
            ${module} .card_labels .label_cursor.active {
              transform: rotate(180deg);
            }
            ${module} .card_labels .label {
              padding: 4px 8px;
              background-color: #D9D9D9;
              font-size: 12px;
              font-weight: 400;
              border-radius: 8px;
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
            <div class="card_labels">
              <div class="label_cursor">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9" fill="none">
                  <path id="Arrow 6" d="M7.29289 8.70711C7.68342 9.09763 8.31658 9.09763 8.70711 8.70711L15.0711 2.34315C15.4616 1.95262 15.4616 1.31946 15.0711 0.928932C14.6805 0.538408 14.0474 0.538408 13.6569 0.928932L8 6.58579L2.34315 0.928932C1.95262 0.538408 1.31946 0.538408 0.928932 0.928932C0.538408 1.31946 0.538408 1.95262 0.928932 2.34315L7.29289 8.70711ZM7 7L7 8L9 8L9 7L7 7Z" fill="#424B5A"/>
                </svg>
              </div>
              ${this.render_labels()}
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
      width: 100%;
      height: 100%;
      display: none;
      position: absolute;
      background-color: rgba(0,0,0,0.6);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    #module__loader div {
      width: 2%;
      height: 11%;
      background: #FFF;
      position: absolute;
      left: 49%;
      top: 43%;
      opacity: 0;
      -webkit-border-radius: 50px;
      -webkit-box-shadow: 0 0 3px rgba(0,0,0,0.2);
      -webkit-animation: fade 1s linear infinite;
    }

    @-webkit-keyframes fade {
      from {opacity: 1;}
      to {opacity: 0.25;}
    }

    #module__loader div.bar1 {
      -webkit-transform:rotate(0deg) translate(0, -130%);
      -webkit-animation-delay: 0s;
    }    

    #module__loader div.bar2 {
      -webkit-transform:rotate(30deg) translate(0, -130%); 
      -webkit-animation-delay: -0.9167s;
    }

    #module__loader div.bar3 {
      -webkit-transform:rotate(60deg) translate(0, -130%); 
      -webkit-animation-delay: -0.833s;
    }
    #module__loader div.bar4 {
      -webkit-transform:rotate(90deg) translate(0, -130%); 
      -webkit-animation-delay: -0.7497s;
    }
    #module__loader div.bar5 {
      -webkit-transform:rotate(120deg) translate(0, -130%); 
      -webkit-animation-delay: -0.667s;
    }
    #module__loader div.bar6 {
      -webkit-transform:rotate(150deg) translate(0, -130%); 
      -webkit-animation-delay: -0.5837s;
    }
    #module__loader div.bar7 {
      -webkit-transform:rotate(180deg) translate(0, -130%); 
      -webkit-animation-delay: -0.5s;
    }
    #module__loader div.bar8 {
      -webkit-transform:rotate(210deg) translate(0, -130%); 
      -webkit-animation-delay: -0.4167s;
    }
    #module__loader div.bar9 {
      -webkit-transform:rotate(240deg) translate(0, -130%); 
      -webkit-animation-delay: -0.333s;
    }
    #module__loader div.bar10 {
      -webkit-transform:rotate(270deg) translate(0, -130%); 
      -webkit-animation-delay: -0.2497s;
    }
    #module__loader div.bar11 {
      -webkit-transform:rotate(300deg) translate(0, -130%); 
      -webkit-animation-delay: -0.167s;
    }
    #module__loader div.bar12 {
      -webkit-transform:rotate(330deg) translate(0, -130%); 
      -webkit-animation-delay: -0.0833s;
    }

    </style>
    `
  }

  get template() {
    return /*html*/`
    ${this.styles}
      <div id="module__loader">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
        <div class="bar4"></div>
        <div class="bar5"></div>
        <div class="bar6"></div>
        <div class="bar7"></div>
        <div class="bar8"></div>
        <div class="bar9"></div>
        <div class="bar10"></div>
        <div class="bar11"></div>
        <div class="bar12"></div>
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
