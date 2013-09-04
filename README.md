node-webkit-filesync
====================

Download and locally run a file with the default program, synchronize back when file is saved

## Requirements

The module is developed for [node-webkit](https://github.com/rogerwang/node-webkit) and the examples assumes you
are running the code in a webpage loaded within node-webkit

## Getting started

Create a new filesynchronizer

```js
var filesync = require('./filesync').create({
  folder: '/var/www/node-webkit-filerunner/folder/'
});
```

Hook into the events, this example keeps a simple list with the synchronized files within a div, the list will be 
updated when any events or actions take place

```js
filesync.on('sync_start', function(data) {
  var tag = '<li id="file-' + data.id + '">New File</li>';
  $('#status ul').append(tag);
});
filesync.on('sync_progress', function(data) {
  $('#file-' + data.id).html('Progress: ' + data.percentage);
});
filesync.on('sync_finished', function(data) {
  $('#file-' + data.id).html('Finished download!');
});
filesync.on('send_start', function(data) {
  $('#file-' + data.id).html('Syncing');
});
filesync.on('send_done', function(data) {
  $('#file-' + data.id).html('Scyned');
});
```

Finally download a file and start syncing

```js
filesync.downloadAndSyncFile("http://website/file.txt");
```

Any changes to the file will be detected and send back to the server using a `PUT` method.
