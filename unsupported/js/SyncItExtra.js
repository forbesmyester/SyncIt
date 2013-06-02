/*jshint smarttabs:true */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(
            require('../js/SyncIt.js')
        );
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['syncit/SyncIt'], factory);
    } else {
        // Browser globals (root is window)
        root.SyncItExtra = factory(expect,SyncItLib);
    }
})(this, function (SyncItLib) {

// =============================================================================

// ## SyncItBuffered

/**
 * ### new SyncItBuffered()
 * 
 * A simple wrapper around SyncIt which manages an ordered set of updates
 * and passes them one by one to SyncItDirect when it is unlocked.
 * 
 * NOTE: This has been tested, but only by changing some of the SyncIt tests and
 * via SyncItAutoApply... there is currently no real tests for it!
 * 
 * @param {SyncIt} syncIt
 */
var SyncItBuffered = function(syncIt) {
    this._syncIt = syncIt;
    this._updateQueue = [];
    this.cls = 'Buf';
    
    var inst = this;
    setInterval(function() {
        if (inst._syncIt.isLocked()) {
            return false;
        }
        if (!inst._updateQueue.length) {
            return false;
        }
        var info = inst._updateQueue.shift();
        return inst._syncIt[info.op].apply(inst._syncIt,info.args);
    },100);
};
(function() {
    var updateQueueOperations = ['feed','feedone', 'set', 'updateonefield', 'remove', 'apply'],
        delegatedOperations = ['listen', 'removeAllListeners', 'removeListener',
            'listenForAddedToQueue', 'get', 'getFull', 'getDatasetNames',
            'getDatakeysInDataset', 'listenForApplied','getQueueitem'],
        i = 0;
        
    var getDelegatedOperationFunction = function(functionName) {
        return function() {
            return this._syncIt[functionName].apply(this._syncIt,arguments);
        };
    };
    
    for (i=0; i<delegatedOperations.length; i++) {
        SyncItBuffered.prototype[delegatedOperations[i]] = getDelegatedOperationFunction(
            delegatedOperations[i]
        );
    }
    
    var getUpdateQueueOperationFunction = function(functionName) {
        return function() {
            this._updateQueue.push({ op:functionName, args:arguments });
        };
    };
    
    for (i=0; i<updateQueueOperations.length; i++) {
        SyncItBuffered.prototype[updateQueueOperations[i]] = getUpdateQueueOperationFunction(
            updateQueueOperations[i]
        );
    }
})();


// ## SyncItAutoApply

/**
 * ### new SyncItAutoApply()
 * 
 * A simple wrapper around SyncIt is designed for server environments where the
 * Queue will be directly applied.
 * 
 * Differences from SyncIt:
 * 
 *  * There is no `apply()` function as this is called automatically.
 *  * The callbacks from the functions which add to the Queue will have thier callbacks not return until after the Queueitem has been applied.
 *  * There is no feed function, because that should not happen on a feed.
 */
var SyncItAutoApply = function(syncIt) {
    this._syncIt = new SyncItBuffered(syncIt);
    this.cls = 'AutoApply';
    this.todo = [];
    var tryToApply = function() {
        var inst = this;
        if (!inst.todo.length) {
            return;
        }
        this._syncIt.apply(function(err,queueitem,jrec) {
            var index = -1;
            for (var i=0;i<inst.todo.length;i++) {
                if (
                    (inst.todo[i].dataset === queueitem.dataset) &&
                    (inst.todo[i].datakey === queueitem.datakey) &&
                    (inst.todo[i].basedonversion === queueitem.basedonversion)
                ) {
                    index = i;
                }
            }
            if (index === -1) { throw new Error('SyncItAutoApply: Could not find callback'); }
            if (err === 0) {
                inst.todo.splice(index,1);
            }
        });
    };
    var inst = this;
    this._syncIt.listenForAddedToQueue(function(dataset,datakey,queueitem) {
        inst.todo.push(queueitem);
        tryToApply.call(inst);
    });
};
(function() {
    var returningFunctions = ['getModifier','isLocked','listenForApplied',
        'get', 'getFull', 'getDatasetNames','getDatakeysInDataset',
        'getQueueitem'];
    var i = 0;
    
    var getReturningFunction = function(functionName) {
        return function() {
            return this._syncIt[functionName].apply(this._syncIt,arguments);
        };
    };
    
    for (i=0; i<returningFunctions.length; i++) {
        SyncItAutoApply.prototype[returningFunctions[i]] = getReturningFunction(
            returningFunctions[i]
        );
    }
    
    var getHandlerForQueueAddingFunction = function(whenAddedToQueue) {
        var inst = this;
        return function(err,dataset,datakey,queueitem) {
            if (err !== 0) {
                return whenAddedToQueue.apply(this,Array.prototype.slice.call(arguments));
            }
            whenAddedToQueue.call(inst._syncIt,err,dataset,datakey,queueitem);
        };
    };
    
    SyncItAutoApply.prototype.feed = function(queueitems,resolutionFunction,done) {
        var inst = this;
        return this._syncIt.feed(
            queueitems,
            resolutionFunction,
            function(err) {
                done.call(inst,err);
            }
        );
    };
    
    SyncItAutoApply.prototype.set = function(dataset, datakey, update, whenAddedToQueue) {
        var inst = this;
        return this._syncIt.set(
            dataset, 
            datakey, 
            update, 
            getHandlerForQueueAddingFunction.call(inst,whenAddedToQueue)
        );
    };
    
    SyncItAutoApply.prototype.updateonefield = function(dataset, datakey, fieldpath, fielddata, whenAddedToQueue) {
        var inst = this;
        return this._syncIt.updateonefield(
            dataset, 
            datakey, 
            fieldpath, 
            fielddata, 
            getHandlerForQueueAddingFunction.call(inst,whenAddedToQueue)
        );
    };
    
    SyncItAutoApply.prototype.feedone = function(operation, dataset, datakey, update, modifier, basedonversion, modificationtime, whenAddedToQueue) {
        var inst = this;
        return this._syncIt.feed(
            operation,
            dataset,
            datakey,
            update,
            modifier,
            basedonversion,
            modificationtime,
            getHandlerForQueueAddingFunction.call(inst,whenAddedToQueue)
        );
    };
    
    SyncItAutoApply.prototype.remove = function(dataset, datakey, whenAddedToQueue) {
        var inst = this;
        return this._syncIt.remove(
            dataset, 
            datakey, 
            getHandlerForQueueAddingFunction.call(inst,whenAddedToQueue)
        );
    };
    
})();

return {
    SyncItBuffered: SyncItBuffered,
    SyncItAutoApply: SyncItAutoApply
};

});
