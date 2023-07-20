/********************************************** */
/********************************************** */
////////// ARCHIVED - REFERENCE ONLY ////////////
/********************************************** */
/********************************************** */

// // global states
// let form_data = {
//   duration: '30',
//   file_type: 'mogrt',
//   media_type: 'video',
//   quantity: 0,
//   sort: 'new',
// };
// let all_labels = [];
// let all_asset_options = [];
// let selected_labels = []; // comes from nav component

// // DOM selectors
// const video_container = document.querySelector('.content_container');

// // initialize application on page load
// window.onload = () => init_app();

// // function that initializaes our application
// function init_app() {
//   //1. clean the data
//   APP_DATA.forEach((d) => {
//     // parse data
//     // make dorpbox links usable
//     d.video_file = d.video_file.replace(
//       'www.dropbox.com',
//       'dl.dropboxusercontent.com'
//     );
//     d.image = d.image.replace(
//       'www.dropbox.com',
//       'dl.dropboxusercontent.com'
//     );

//     // remove 's' from duration
//     d.duration = d.duration.replace(/s/g, '');

//     // addand parse labels
//     if (d.labels.length > 0) {
//       d.labels = d.labels.replace(/\s/g, '').split(',');

//       // add to array of possible labels
//       d.labels.forEach((label) => {
//         !all_labels.includes(label) && all_labels.push(label);
//       });
//     }
//   });
//   // sort the available labels alphabetically
//   all_labels.sort();

//   // need to update the dropdown
//   document.querySelector('module-video-nav').setAttribute('labels', all_labels);

//   //2. render the video cards based on filtered data
//   render_content();

//   //3. Add event listeners to our custom web components
//   document.addEventListener('videoFormUpdate', (event) => {
//     form_data = event.detail;
//     render_content();
//   });
//   document.addEventListener('labelsUpdate', (event) => {
//     selected_labels = [...Object.values(event.detail)];
//     render_content();
//   });
//   document.addEventListener('videoPlayback', (event) => {
//     const video_to_ignore = event.detail.video_id;

//     document.querySelectorAll('video').forEach((video) => {
//       // console.log(video.id);
//       // console.log(video.id);
//       // console.log(video.id);
//       if (video.id !== `video_${video_to_ignore}`) {
//         video.pause();
//       }
//     });
//   });
// }

// function render_content() {
//   // reset video content container
//   video_container.innerHTML = '';
//   const render_data = filter_data(APP_DATA);
//   // we have data we can render
//   if (render_data.length > 0) {
//     render_data.forEach((video, idx) => {
//       video_container.insertAdjacentHTML("beforeend", `
//             <module-video id="${idx}" video_title="${video.video_title}" video_src="${video.video_file}" duration="${video.duration}" assets="${video.num_assets}" href="${video.working_files}" ${video.image !== "" && `thumbnail="${video.image}"`}></module-video>
//         `);
//     });
//   } else {
//     // no data matches input fields
//     video_container.innerHTML += `
//       <div class="no-video">Sorry, No Video Matches Your Input</div>
//     `;
//   }
//   //handle_video_load();
// }

// function handle_num_assets(options) {
//   const assets = [];
//   options.forEach((video) => {
//   if(!assets.includes(video.num_assets)) {
//         assets.push(video.num_assets);
//       }
//   });
//     if (assets.length > 0) {
//       assets.sort((a,b) => a - b);
//     }
//     assets.unshift('Any');
//     // update number of available labels
//     document.querySelector('module-video-nav').setAttribute('available_assets', assets);
// }

// function filter_data(data) {
//   data = data.filter((d) => d.duration === form_data.duration);
//   data = data.filter((d) => d.file_type.toLowerCase() === form_data.file_type);
//   data = data.filter(
//     (d) => d.asset_type.toLowerCase() === form_data.media_type
//   );

//   if (selected_labels.length > 0) {
//     data = data.filter((d) => {
//       let has_all_labels = true;
//       // exclusive label selection
//       selected_labels.forEach((label) => {
//         if (!d.labels.includes(label)) has_all_labels = false;
//       });

//       return has_all_labels;
//     });
//   }
//   // TODO - we need to somehow capture the available options for number of assets before they get filtered for rendering
//   handle_num_assets(data);
//   data = data.filter((d) => {
//     const assets = form_data.quantity;
//     return assets === '0' || assets === 'Any' || assets === 0 || assets === '' || d.num_assets === +assets;
//   });

//   // sort data based on updates
//   handle_update_sort(data);
//   return data;
// }

// function handle_update_sort(data) {
//   const {sort} = form_data;
//   switch(sort) {
//     case 'new' :
//       // show newest first
//       data.sort((a, b) => {
//         const dateA = new Date(a.date_added);
//         const dateB = new Date(b.date_added);
//         return dateB - dateA;
//       });
//       break;
//     case 'old' :
//       // show oldest first
//       data.sort((a, b) => {
//         const dateA = new Date(a.date_added);
//         const dateB = new Date(b.date_added);
//         return dateA - dateB;
//       });
//       break;
//     case 'updated' :
//       // show last updated first
//       data.sort((a, b) => {
//         const dateA = new Date(a.last_updated);
//         const dateB = new Date(b.last_updated);
//         return dateA - dateB;
//       });
//       break;
//     default :
//       // do nothing
//       break;
//   }
// }
