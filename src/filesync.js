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

sync.prototype.watchFile = function(filename) {
  var me = this;
  fs.watch(filename, function(event, name) {
    if (filename) {
      sys.puts("changed found: " + filename + ", sending data");
      me.sendFile(filename, "http://localhost/node-webkit-filerunner/test/post.php");
    }
  });
};

sync.prototype.sendFile = function(filename, remoteUrl) {

  function send_file(data, remoteUrl) {
    var requestUrl = url.parse(remoteUrl);
    var post_options = {
        host: requestUrl.hostname,
        port: '80',
        path: requestUrl.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };

    sys.puts("sending data " + JSON.stringify(post_options));

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
    });

    // post the data
    post_req.write(data);
    post_req.end();
  }

  sys.puts("reading " + filename);
  fs.readFile(filename, 'utf-8', function (err, data) {

    if (err) {
      console.log("FATAL An error occurred trying to read in the file: " + err);
      return;
    }
    if(data) {
      sys.puts("asfas");
      send_file(data, remoteUrl);
    }
  });
};

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
      me.watchFile(filename);
    });
  });

  request.end();
};

exports = module.exports = new sync();