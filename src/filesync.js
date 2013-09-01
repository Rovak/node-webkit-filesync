var fs = require('fs'),
  sys = require('sys'),
  url = require('url'),
  path = require('path'),
  util = require('util'),
  http = require('http'),
  events = require('events'),
  child_process = require('child_process'),
  sync = function() {};

sync.prototype = new events.EventEmitter();

sync.prototype.folder = process.cwd();

sync.prototype.downloadAndSyncFile = function(downloadUrl) {

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

  request = http.request(options, function(res) {
    var download_filename = options.path.split("/").pop(),
      total_length = parseInt(res.headers['content-length'], 0),
      filename = '/var/www/node-webkit-filerunner/' + download_filename,
      download_stream = fs.createWriteStream(filename, { flags: 'w+' });

    me.emit('start', downloadUrl);

    res.setEncoding(null); // binary
    res.on('data', function(chunk) {
      totalLength += chunk.length;
      download_stream.write(chunk, encoding = 'binary');
      me.emit('progress', Math.round((totalLength / total_length) * 100));
    });
    res.on("end", function() {
      download_stream.end();
      me.emit('finished', {
        localFile: filename
      });
      child_process.spawn('xdg-open', [filename]);
    });
  });

  request.end();
};

exports = module.exports = new sync();