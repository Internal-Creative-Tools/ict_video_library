// CONFIG FILE
// Use this file to add or handle configurations for your application

const CONFIG = {
  // add sheet information here such as Sheet ID and sheet Name
  sheet_id: PropertiesService.getScriptProperties().getProperties()['SHEET_ID'],
  sheet_name: 'Approved Library',
  // if your sheet DOES NOT have the column headers as the FIRST row (sometimes sheets will have a banner or information), you must proivde how many rows to SKIP until the headers are reached
  /*** Default value will be 0 ***/
  skip: 1,
  // set this to true if you want to use custom_keys for your objects
  /*** Default value is false ***/
  use_keys: true,
  // Sometimes, sheet headers have names like "Best Use Case" or "Avg # of ticket per week (Team)" that become difficult and cumbersome to use during development,
  // as such, we can modify the headers to whatever name(key) we'd like/ values on the left represent the true header names, values on the right represent the names we'd like to use/rename.
  /** NOTE that you must know the # of headers beforehand! You also must include hidden columns as well... **/
  custom_keys: {
    'Date Added': 'date_added',
    'Last Updated': 'last_updated',
    'Video File': 'video_file',
    'FW Title': 'video_title',
    'Thumbnail Image': 'image',
    'Working Files': 'working_files',
    'PSD/MOGRT': 'file_type',
    'Duration': 'duration',
    'Asset Type': 'asset_type',
    '# of Assets': 'num_assets',
    'Labels': 'labels',
    'Notes': 'notes',
  },
};
