class App {

  //global
  app_data;
  form_data;
  all_labels = [];
  selected_labels = [];
  video_container;
  DOM;
   
  constructor(app_data) {
    this.app_data = app_data;
    this.form_data = {
      duration: '30',
      file_type: 'mogrt',
      media_type: 'video',
      quantity: 0,
      sort: 'new',
    };
    this.DOM =  {
      VIDEO_CONTAINER : ".content_container",
      MODULE_NAV : "module-video-nav",
    }

    this.video_container = document.querySelector(this.DOM.VIDEO_CONTAINER);

    this.init();
  }

  init() {
    this.clean_data();
    this.render_content();
    this.add_custom_listeners();
  }

  clean_data() {
    this.app_data.forEach((d) => {
      d.video_file = d.video_file.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      d.image = d.image.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      d.duration = d.duration.replace(/s/g, '');
      if (d.labels.length > 0) {
        d.labels = d.labels.replace(/\s/g, '').split(',');
        d.labels.forEach((label) => {
          if (!this.all_labels.includes(label)) {
            this.all_labels.push(label);
          }
        });
      }
    });

    this.all_labels.sort();
    document.querySelector(this.DOM.MODULE_NAV).setAttribute('labels', this.all_labels);
  }

  render_content() {
    this.video_container.innerHTML = '';
    const render_data = this.filter_data();

    if (render_data.length > 0) {
      render_data.forEach((video, idx) => {
        this.video_container.insertAdjacentHTML(
          'beforeend',
          `<module-video id="${idx}" video_title="${video.video_title}" video_src="${video.video_file}" duration="${video.duration}" assets="${video.num_assets}" href="${video.working_files}" ${video.image !== '' && `thumbnail="${video.image}"`}></module-video>`
        );
      });
    } else {
      this.video_container.innerHTML += `<div class="no-video">Sorry, No Video Matches Your Input</div>`;
    }
  }

  add_custom_listeners() {
    document.addEventListener('videoFormUpdate', (event) => {
      this.form_data = event.detail;
      this.render_content();
    });
    document.addEventListener('labelsUpdate', (event) => {
      this.selected_labels = [...Object.values(event.detail)];
      this.render_content();
    });
    document.addEventListener('videoPlayback', (event) => {
      const videoToIgnore = event.detail.video_id;
      document.querySelectorAll('video').forEach((video) => {
        if (video.id !== `video_${videoToIgnore}`) {
          video.pause();
        }
      });
    });
  }

  filter_data() {
    let data = this.app_data;

    data = data.filter((d) => d.duration === this.form_data.duration);
    data = data.filter((d) => d.file_type.toLowerCase() === this.form_data.file_type);
    data = data.filter((d) => d.asset_type.toLowerCase() === this.form_data.media_type);

    if (this.selected_labels.length > 0) {
      data = data.filter((d) => {
        let hasAllLabels = true;
        this.selected_labels.forEach((label) => {
          if (!d.labels.includes(label)) {
            hasAllLabels = false;
          }
        });
        return hasAllLabels;
      });
    }

    this.handle_num_assets(data);
    data = data.filter((d) => {
      const assets = this.form_data.quantity;
      return assets === '0' || assets === 'Any' || assets === 0 || assets === '' || d.num_assets === +assets;
    });

    this.sort_date(data);
    return data;
  }

  handle_num_assets(data) {
    const assets = [];
    data.forEach((video) => {
      if (!assets.includes(video.num_assets)) {
        assets.push(video.num_assets);
      }
    });

    if (assets.length > 0) {
      assets.sort((a, b) => a - b);
    }

    assets.unshift('Any');
    document.querySelector(this.DOM.MODULE_NAV).setAttribute('available_assets', assets);
  }

  sort_date(data) {
    const { sort } = this.form_data;

    switch (sort) {
      case 'new':
        data.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
        break;
      case 'old':
        data.sort((a, b) => new Date(a.date_added) - new Date(b.date_added));
        break;
      case 'updated':
        data.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
        break;
      default:
        break;
    }
  }
}
