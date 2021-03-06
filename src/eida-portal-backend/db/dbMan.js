var loki = require('lokijs');
var mem = new loki.LokiMemoryAdapter();
var adapter = new loki.LokiPartitioningAdapter(mem);
// var adapter = new loki.LokiFsAdapter('loki');

module.exports = class DbMan {
    constructor() {
        this.db = new loki(
            'epb-db.json',
            {
                autoload: true,
                autosave: true,
                autosaveInterval: 60000,
                adapter: adapter
            }
        );
    }

    initDb() {
        let cols = [
            'networks',
            'stations',
            'channels'
        ]

        for (let a of cols) {
            var c = this.db.getCollection(a);
            if (!c) {
                c = this.db.addCollection(a);
            }
        }
    }

    loadDb(callback) {
        this.db.loadDatabase({}, function() {
            callback(this.db);
        }.bind(this));
    }

    loadCollection(colName, callback) {
        this.db.loadDatabase({}, function () {
            var _collection = this.getCollection(colName);
    
            if (!_collection) {
                console.log("Collection %s does not exit. Creating ...", colName);
                _collection = this.addCollection(colName);
            }
    
            callback(_collection);
        }.bind(this.db));
    }

    clrCollection(name) {
        this.loadCollection(
            name,
            function(name){
                name.clear();
            }
        );
    }

    recreateCollection(name) {
        this.loadDb(function(ctx) {
            ctx.removeCollection(name);
            ctx.addCollection(name);
        });
    }
}
