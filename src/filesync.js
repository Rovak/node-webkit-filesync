var fs = require('fs'),
    sys = require('sys'),
    url = require('url'),
    path = require('path'),
    util = require('util'),
    http = require('http'),
    events = require('events'),
    child_process = require('child_process');


function watchedFile(filename, id) {
  this.filename = filename;
  this.id = id;
}

function sync(options) {
  this.options = options || {};
  this.folder = options.folder || process.cwd();
}

function send_file(file, data, remoteUrl) {
  var me = this,
      requestUrl = url.parse(remoteUrl),
      post_options = {
        host: requestUrl.hostname,
        port: '80',
        path: requestUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length
        }
      };

  // Set up the request
  var post_req = http.request(post_options, function (res) {
    res.setEncoding('utf8');
    res.on('end', function() {
      me.emit('synced', {
        filename: file.filename,
        id: file.id
      });
    });
  });

  // post the data
  post_req.write(data);
  post_req.end();
}

sync.prototype = new events.EventEmitter();

sync.prototype.watchedFiles = [];

sync.prototype.id = 0;

/**
 * Stop watching the given filename
 * @param  {[type]} filename [description]
 * @return {[type]}          [description]
 */
sync.prototype.stopWatching = function (filename) {
  fs.unwatchFile(filename);

  // Remove the file from the watchlist
  var foundFile = this.watchedFiles.indexOf(filename);
  if (foundFile !== -1) {
    this.watchedFiles.splice(foundFile, 1);
  }
};

/**
 * Start watching the file for changes
 *
 * @param  {String} filename Full pathname to the file which must be watched
 */
sync.prototype.watchFile = function (file) {
  var me = this;
  fs.watch(file.filename, function (event, name) {
    me.sendFile(file, "http://localhost/node-webkit-filerunner/test/post.php");
    me.emit('send', {
      filename: file.filename,
      id: file.id,
      file: file
    });
  });
  this.watchedFiles.push(file.filename);
};

/**
 * Send file back to the server with a POST request
 *
 * @param  {[type]} filename  [description]
 * @param  {[type]} remoteUrl [description]
 * @return {[type]}           [description]
 */
sync.prototype.sendFile = function (file, remoteUrl) {

  var me = this;

  fs.readFile(file.filename, 'utf-8', function (err, data) {

    if (err) {
      me.emit('error', err);
      console.log("FATAL An error occurred trying to read in the file: " + err);
      return;
    }

    if (data) {
      send_file(file, data, remoteUrl);
    }
  });
};

/**
 * Download and add the file to the watchlist
 *
 * @param  {String} downloadUrl Remote URL where the file is located
 * @return {Void}
 */
sync.prototype.downloadAndSyncFile = function (downloadUrl) {

  var me = this,
      requestUrl = url.parse(downloadUrl),
      hostname = url.hostname,
      request,
      totalLength = 0;

  var options = {
    hostname: requestUrl.hostname,
    port: 80,
    path: requestUrl.path,
    method: 'GET'
  };

  request = http.request(options, function (res) {
    var download_filename = options.path.split("/").pop(),
      total_length = parseInt(res.headers['content-length'], 0),
      fileId = me.id++,
      filename = me.folder + download_filename,
      download_stream = fs.createWriteStream(filename, {
        flags: 'w+'
      });

    me.emit('start', {
      filename: download_filename,
      id: fileId
    });

    res.setEncoding(null); // binary
    res.on('data', function (chunk) {
      totalLength += chunk.length;
      download_stream.write(chunk, encoding = 'binary');
      me.emit('progress', {
        percentage: Math.round((totalLength / total_length) * 100),
        filename: download_filename,
        id: fileId
      });
    });
    res.on('end', function () {
      download_stream.end();
      me.emit('finished', {
        filename: download_filename,
        id: fileId
      });
      child_process.spawn('xdg-open', [filename]);

      // Small delay so a change event will not be fire immediatly
      setTimeout(function(){
        me.watchFile(new watchedFile(filename, fileId));
      }, 1500);
    });
  });

  request.end();
};

exports = module.exports = {
  create: function (options) {
    return new sync(options);
  }
};