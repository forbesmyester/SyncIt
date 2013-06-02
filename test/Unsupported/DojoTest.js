dojoConfig = {
  baseUrl: ".",
  async: 1,
  hasCache: {
    "host-node": 1,
    "dom": 0
  },
  packages: [{
    name: "dojo",
    location: "./vendor/dojo"
  },{
    name: "dijit",
    location: "./vendor/dijit"
  },{
    name: "dojox",
    location: "./vendor/dojox"
  },{
    name: "syncit",
    location: "js"
  }],
  deps: ['test/Unsupported/SyncItStore.js']
};

require('../../vendor/dojo/dojo.js');

