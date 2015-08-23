/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

var WebSocketServer = require('ws').Server;

var clients = [];

function attachToServer(server, path) {
  var wss = new WebSocketServer({
    server: server,
    path: path
  });

  wss.on('connection', function(ws) {
    clients.push(ws);

    var allClientsExcept = function(ws) {
      return clients.filter(function(cn) { return cn !== ws; });
    };

    ws.onerror = function() {
      clients = allClientsExcept(ws);
    };

    ws.onclose = function() {
      clients = allClientsExcept(ws);
    };

    ws.on('message', function(message) {
      allClientsExcept(ws).forEach(function(cn) {
        try {
          // Sometimes this call throws 'not opened'
          cn.send(message);
        } catch(e) {
          console.warn('WARN: ' + e.message);
        }
      });
    });
  });
}

function isDebuggerConnected() {
  // Debugger is connected if the app and at least one browser are connected
  return clients.length >= 2;
}

module.exports = {
  attachToServer: attachToServer,
  isDebuggerConnected: isDebuggerConnected,
};  
