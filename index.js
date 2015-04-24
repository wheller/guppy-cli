'use strict';

require('shelljs/global');
var fs = require('vinyl-fs');
var map = require('map-stream');
var path = require('path');

var hooks = [
  'applypatch-msg',
  'commit-msg',
  'post-applypatch',
  'post-checkout',
  'post-commit',
  'post-merge',
  'post-receive',
  'post-rewrite',
  'post-update',
  'pre-applypatch',
  'pre-auto-gc',
  'pre-commit',
  'pre-push',
  'pre-rebase',
  'pre-receive',
  'prepare-commit-msg',
  'update'
];

module.exports.install = install;

function install(hook, dest, cb) {
  cb = cb || dest;

  if (!cb) throw new Error('Callback must be supplied.');
  if (typeof cb !== 'function') throw new Error('Callback must be a function.');

  if (hooks.indexOf(hook) === -1) cb(new Error('Invalid hook name.'));

  dest = (typeof dest === 'function' ? null : dest ||
    exec('git rev-parse --show-toplevel')
      .output.slice(0, -1) + '/.git/hooks/');

  var destHook = path.join(dest, hook);
  if (test('-f', destHook)) {
    var bakDest = destHook + '.guppy';

    if (!test('-f', bakDest)) {
      mv(destHook, bakDest);
    }
  }

  return fs.src('./scripts/hookfile')
    .pipe(map(function(file, next) {
      file.path = file.path.replace('hookfile', hook);
      next(null, file);
    }))
    .pipe(fs.dest(dest))
    .on('end', function () {
      cb(null, destHook);
    });
}