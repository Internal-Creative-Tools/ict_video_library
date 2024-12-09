class App {
  //global
  app_data;
  form_data;
  all_labels = [];
  all_asset_options = [];
  selected_labels = [];
  video_container;
  DOM;
   
  constructor(app_data) {
    this.app_data = app_data;

    this.form_data = {
      duration: [],
      file_type: [],
      media_type: [],
      quantity: 0,
      sort: 'new',
      labels: '',
    };
    this.DOM =  {
      VIDEO_CONTAINER : ".content_container",
      MODULE_NAV : "module-video-nav",
    }

    this.video_container = document.querySelector(this.DOM.VIDEO_CONTAINER);
    this.sort_container = document.querySelector("select#sort");

    this.init();
  }

  init() {
    this.clean_data();
    this.render_content();
    this.add_custom_listeners();
  }

  clean_data() {
    const supported_video_ext = [".mp4",".wmv",".avi",".mov",".mkv",".flv",".webm",".3gp",".mpg",".mpeg",".m4v",".rmvb",".vob",".m2ts",".ts",".divx",".ogv",".asf",".rm"];

    // remove data sets that don't have supporting extensions
    this.app_data = this.app_data.filter((d) => {
      const input_string = d.video_file.toLowerCase();

      return supported_video_ext.some(ext => input_string.includes(ext));
    });

    this.app_data.forEach((d) => {
      // remove notes column unused
      delete d.notes
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
          if (!this.all_asset_options.includes(d.num_assets)) {
            this.all_asset_options.push(d.num_assets);
          }
      }
    });

      // remove data sets that have empty values 
      this.app_data = this.app_data.filter((d) => {
        for (let key in d) {
          if (d[key] === "" || d[key] === [] || d[key] === null) {
            return false;
          }
        }
        return true;
      })


   this.all_labels.sort();

   this.all_asset_options.sort((a,b) => a- b );

    //! need to replace, pass data to module
    document.querySelector('module-filter').data = {
      labels: this.all_labels,
      assets: this.all_asset_options
    }
    //document.querySelector(this.DOM.MODULE_NAV).setAttribute('labels', this.all_labels);
  }

  render_content() {
    this.video_container.innerHTML = '';
    const render_data = this.filter_data();


    if (render_data.length > 0) {
      render_data.forEach((d, idx) => {
        const module = document.createElement('module-video');
        d.id = idx;
        module.data = d;
        this.video_container.appendChild(module);
      });
    } else {
      this.video_container.innerHTML += `<div class="no-video">Sorry, No Video Matches Your Input</div>`;
    }
  }

  add_custom_listeners() {
    this.sort_container.addEventListener('change', (event) => {
      this.form_data.sort = event.target.value;
      this.sort_date(this.app_data);
      this.render_content();
    });
    document.addEventListener('videoFormUpdate', (event) => {
      this.form_data = event.detail;
      this.render_content();
    });
    document.addEventListener('labelsUpdate', (event) => {
      this.selected_labels = [...Object.values(event.detail)];
      this.render_content();
    });
    document.addEventListener('inputUpdate', (event) => {
      const {key, value} = event.detail;

      if (key === "reset") {
        // return to stop execution
        return this.reset();
      }

      let field = this.form_data[key];
      
      if (Array.isArray(field)) {
           if (field.includes(value)) {
                    // remove from array
                field = field.filter(item => item !== value);
                this.form_data[key] = field;
            } else {
                // add to array
                field.push(value);
            }
      } else  {
        this.form_data[key] = value;
      }
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

  reset() {
    this.page = 1;
    this.form_data = {
      duration: [],
      file_type: [],
      media_type: [],
      quantity: 0,
      sort: 'new',
      labels: '',
    };
    this.render_content();
  }

  filter_data() {
    let data = this.app_data;
    const {duration, file_type, labels, media_type, quantity, sort} = this.form_data;
    data = data.filter((d) => {
      if (duration.length === 0) return true;
            return duration.includes(d.duration);
    });
 
    data = data.filter((d) => {
      if (file_type.length === 0) return true;
            return file_type.includes(d.file_type.toLowerCase());
    });

    data = data.filter((d) => {
      if (media_type.length === 0) return true;
            return media_type.includes(d.asset_type.toLowerCase());
    });

    data = data.filter((d) => labels.length === 0 ? true : d.labels.includes(labels));

    data = data.filter((d) => 
      quantity === "" || quantity === 0 ? true : d.num_assets === +quantity
    );

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
