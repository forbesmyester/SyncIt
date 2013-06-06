# SyncIt

## What is it for? 

SyncIt is a library to enable you to easily add synchronization to your (offline / phonegap) web Apps. This may be for allowing multiple users / devices to work offline or because the app has a live editing session with other users. 

## What does it do?

SyncIt is designed to do the following things:

 * Tracking versions of data.
 * Knowing which data is synchronized.
 * Keeping a list of data which still needs to be synchronized.
 * Supplying the App with all data required to handle version conflicts when they occur.

## What does it not do?

As important as what it does, is what it does not do. I have tried to make SyncIt as unintrusive as possible but still easy to use, so it does not:

 * Force you to use any specific server or server API though it does have it's own data format.
 * Make you use jQuery, Dojo or anything else, it's pure portable JS.
 * SyncIt will not manage your connection to the server or tell you when you are connected.
 * Subordinate your code to SyncIt. You can put data into it and you can get data out of it, but it will happen when you want it to happen.

## How does it work?

SyncIt has two areas where it stores data, one is called the [Store](#store) and the other called the [Queue](#queue). The Store stores everything which has been sent to or has come from the [Server](#server) and therefore is guarenteed not to be rolled back. The Queue on the other had will store data which at that moment is time, is only local.

![SyncIt: Overall Structure](bin/README/img/overall-diagram.png)

Both these areas store data against a [Dataset](#dataset) and a [Datakey](#datakey). A Dataset is somewhat like a table in [MySql](http://www.mysql.com/) or a collection in [MongoDB](http://www.mongodb.org/) and the Datakey is like a primary key, so you could have a data structure like the folling:

Dataset | Datakey | Data
--------|---------|----
Cars    | Subaru  | { "Color": "Red", "Owner": "Alice" }
Cars    | Ford    | { "Color": "Red", "Owner": "Simon" }
Cars    | Honda   | { "Color": "Red", "Owner": "Alice" }
Person  | Simon   | { "Role: "Programmer", "Age": 37 }
Person  | Alice   | { "Role: "Lawyer", "Age": 32 }

The data that is in the Store are called [Jrec](#jrec) whereas the data in the Queue are called [Queueitem](#queueitem). When data is being read from SyncIt it will first read the Jrec from the Store and then read through every Queueitem for that Dataset and Datakey to give you the data which will be committed should no [Conflict](#conflict) occur. The table below illustrates an example reading process for Car/Subaru, the result is `{ "Seats": "Leather", "Likes": 1 }`.

Dataset | Datakey | Location | Version | [Operation](#operation) | [Update](#update) | Read Value
--------|---------|----------|---------|-----------|---------------------------------|---------------
Cars    | Subaru  | Store    | 2       |           | { "Color": "Red" }              | { "Color": "Red" }
Cars    | Subaru  | Queue    | 3       | Set       | { "Seats": "Leather" }          | { "Seats": "Leather" }
Cars    | Subaru  | Queue    | 4       | Update    | { "$inc { "Likes": 1 } }        | { "Seats": "Leather", "Likes": 1 }


The App should download (or be pushed) Queueitem from the Server and then [Feed](#feed) them into SyncIt. Feeding is similar to a [Subversion](http://subversion.apache.org/) `update` or a [Mercurial](http://mercurial.selenic.com/) / [git](http://git-scm.com/) `pull` and `merge` process and as such includes the capabilty of handling conflict resolution.

![Feeding with no conflicts: Writes to the store AFTER checking the Jrec version and that the Queue is empty (for the same Dataset / Datakey).](bin/README/img/no-conflict-feed.png)

The App can access outstanding Queueitem for the purpose of uploading them to the server, so once all Queueitem on the Server have been Fed the App can try and push the outstanding local Queueitem to the Server. At this point the Queueitem will either be rejected (because someone/something else has pushed in the meantime) or accepted. If it is accepted there is a single API call to [Apply](#apply) the Queueitem in the Queue to the Store. Once all Queueitem have been applied the App is fully synchronized with the server and the Queue is empty.

## Is there a demo

There sure is. It's located [here](http://forbesmyester.github.io/SyncIt/demo/index.html).

## Have you got API Documentation?

There is a (reasonably) complete set of [API Docs](http://forbesmyester.github.io/SyncIt/docs/SyncIt.js.html).

## Lets take a closer look at an example how this may work in real life.

### James changes data while offline

User James is sat on the the underground using an application developed using SyncIt. He is trying to decide what car to buy and the App performs the following change while out of mobile coverage.

    jamesSyncIt.set(
        'cars',
        'Subaru',
        { color: 'blue' }
        function(err) { if (err === SyncIt_Constant.Error.OK) {  success(); } }
    );

User  | Dataset | Datakey | Store | Queueitem Update
------|---------|---------|-------|-----------
James | Cars    | Subaru  |       | { color: 'blue' }

The data from this operation is now stored in a queue of pending changes to be sent to the server but can be read by the App in the normal way, by calling `jamesSyncIt.get('cars','Subaru',function(err,data) { ... })`.

James is happy because he is making progress on deciding on his next car.

### James reconnects to the Internet

Later, when James exits the underground the App detects that it can connect and makes the following API call:

    jamesSyncIt.getFirst(function(err,queueitem) {
        if (err !== SyncIt_Constant.Error.OK) {
            // throw?
        }
        xhr(
            'http://server/' + queueitem.s + '/' + queueitem.k,
            {
                method: 'PATCH',
                ...
            }
        ).then(
            function() {
                // data now stored on server
				jamesSyncIt.apply(function(err) {
					...
				});
            },
            function(err) {
                // something went wrong... throw err?
            }
        );
    });

User  | Dataset | Datakey | Store                                  | Queueitem
------|---------|---------|----------------------------------------|-----------
James | Cars    | Subaru  | { color: 'blue' } (v1)

At this point the data is now stored on the server and the App has recorded the fact by moving the data from the queue to the store.

The reason this is two steps as apposed to the one commit step for Subversion is that I viewed the communication with the server to be something that should be incredibly easy to change and tweak by the App developer.

### Emily receives the update and responds

His wife, Emily is using the same App and either through a push notification or polling gets James's update from the server which calls:

    emilySyncIt.feed(
        [Queueitem], // The update from James
        function( ... ) { ... }, // Conflict Resolution - We'll get to this soon
        function(err) { ... }
    );

User  | Dataset | Datakey | Store                                  | Queueitem
------|---------|---------|----------------------------------------|-----------
James | Cars    | Subaru  | { color: 'blue' } (v1)               |
Emily | Cars    | Subaru  | { color: 'blue' } (v1)               |

This will add the change to the local store, assuming that there are no local changes for the same data, which we will get to later.

Emily does not like the idea of thier car being a Subaru and makes the following changes:

    emilySyncIt.set(
        'cars',
        'Subaru',
        { color: 'blue', style: 'a bit too boy racer for Emily' }
    );

User  | Dataset | Datakey | Store                                  | Queueitem
------|---------|---------|----------------------------------------|-----------
James | Cars    | Subaru  | { color: 'blue' } (v1)                 |
Emily | Cars    | Subaru  | { color: 'blue', style: 'a bit too boy racer for Emily' } (v2)

Because she is still in the park and has good mobile coverage that change is uploaded to the server and then applied immediately using `emilySyncIt.getFirst()` and `emilySyncIt.apply()` seen earlier for James.

### Both users make edits and conflict resolution is used.

James is again out of mobile coverage and is completely unaware of Emily's change but has discovered that Subaru's are four wheel drive...

    jamesSyncIt.update(
        'cars',
        'Subaru',
        { $set: { pluspoints: ['has 4WD'] }, $inc { votes: 1 } },
        function(err) { if (err === SyncIt_Constant.Error.OK) {  success(); } }
    );

User  | Dataset | Datakey | Store                                  | Queueitem                                                     | Reads
------|---------|---------|----------------------------------------|---------------------------------------------------------------|------------
James | Cars    | Subaru  | { color: 'blue' } (v1)                 | { $set: { pluspoints: ['has 4WD'] }, $inc { votes: 1 } } (v2) | { color: 'blue', pluspoints: 'has 4WD', votes: 1 }
Emily | Cars    | Subaru  | { color: 'blue', style: 'a bit too boy racer for Emily' } (v2) | | { color: 'blue', style: 'a bit too boy racer for Emily' }

Now both users have made changes to the same data structure, but Emily's change has already been sent to the server.

James reconnects to the Internet and the changes are downloaded, at this point his client (and SyncIt) have enough information to detect a version conflict.

What is the correct course of action that James's App should take in this situation? First of all it has to detect that a conflict has actually occured but it must also be capable of resolving that conflict, probably automatically, but potentially with user intervention.

Internally SyncIt stores everything including a Modifier and a Version. The data structure looks something like the following:

    {
        s: "cars", // dataset
        k: "Subaru", // datakey
        b: 1, // what version this Queueitem is based on (so this is version 2)
        m: "james", // the user/device that made the change
        o: "update", // the operation that was performed
        t: 1369345483365, // timestamp when the operation was performed
        u: { // the data for the operation
            "$set": { "pluspoints": ["has 4WD"] },
            "$inc" { "votes": 1 }
        } 
    }

So conflicts are possible to detect by comparing versions.

The second part of the solution is that `SyncIt.feed()` includes a callback parameter for a conflict resolution function.

    SyncIt.feed(feedQueueItems,resolutionFunction,feedDone)

The reason for conflict resolution being a callback function I feel it would be impossible for SyncIt to dictate and could be part of your core application logic. So the code/data for feeding data into SyncIt could end up looking something like the following:

    SyncIt.feed(
        [{ 
            // The data which has been recieved from other parties via a server
            "s": "cars",
            "k": "Subaru",
            "u": { color:'blue', style:'a bit too boy racer for Emily' },
            "o": "set", "b": 1, "m": "emily", "t": 1369345483321
        }],
        function(dataset, datakey, stored, localChanges, remoteChanges, resolved) {
            
            // This is a super basic, perhaps too basic, example of a conflict
            // resolution function that will apply the local update on top of 
            // the remote update if it has a later timestamp
            
            if (
                localChanges[localChanges.length - 1].t >
                    remoteChanges[remoteChanges.length - 1].t
            ) {
                // James made the last change, so blindly take it!
                return resolved(
                    true,
                    [remoteChanges[remoteChanges.length - 1]]
                );
            }
            
            // Emily made the last change, so we will throw away our changes
            return resolved(true,[]);
        },
        function(err,remoteUpdatesNotFed) {
            if (err === SyncIt_Constant.Error.OK) {
                return success();
            }
            // err explains the reason for the error
            // remoteUpdatesNotFed includes the update that are on the server 
            // which we could not feed due to the error.
        }
    );

User  | Dataset | Datakey | Store                                  | Queueitem                                                     | Reads
------|---------|---------|----------------------------------------|---------------------------------------------------------------|------------
James | Cars    | Subaru  | { color: 'blue', style: 'a bit too boy racer for Emily' } (v2) | { $set: { pluspoints: ['has 4WD'] }, $inc { votes: 1 } } (v3) | { color: 'blue', style: 'a bit too boy racer for Emily', pluspoints: 'has 4WD', votes: 1 }
Emily | Cars    | Subaru  | { color: 'blue', style: 'a bit too boy racer for Emily' } (v2) | | { color: 'blue', style: 'a bit too boy racer for Emily' }

At this point Emily's change is stored in the Store with a locally Queueitem in the Queue for James adding the fact it is four wheel drive and with James's vote. If James still has mobile coverate after downloading the change that change can be immediately sent to the server and then applied locally.

## Todo

I need to do the following:

 * Public Facing
    * Add a license to all files (It'll be MIT/BSD)
    * Auto Build of GitHub pages
    * Add scrollbars to the help sections in the Demo (use the scrollwheel in the meantime!)
    * Make demo work in FireFox and IE
 * Client SyncIt
    * localStorage for SyncIt (Store)
    * Add Async wrappers for Store & Persist
 * Server SyncIt
    * Create a real SyncItServer based on SyncItTestServer, it should be pretty easy, because SyncItTestServer is pretty abstracted.
    * I want to make ServerPersist for both MongoDB and DynamoDB.
 * Next Steps
    * Use this in a real project with a Browser and mobile (Phonegap based) clients.
    * Add SyncIt.purge() methods to free space from SyncIt.

## Dictionary

Below you will find a dictionary for words used in SyncIt.

#### Store
The Store will hold data that is on the Server. It cannot be modified directly, though Applying Queueitem will change it.

#### Queue
A series of Queueitem are held in the Queue.

#### Server
The Server is not part of the SyncIt project, which is a client to it, however the concept is that SyncIt will get Fed updates from the Server and will have it's Queueitem pushed into the Server. Once a Queueitem is pushed to the Server it should be Applied locally.

#### Dataset
The Dataset holds a collection of Datakey, which themselves hold Data.

#### Datakey
A Datakey is a single (well two if you consider the Queue and Store) location where data is stored.

#### Conflict
Conflicts occur when Feeding data for which there is local Queueitem for the same Dataset / Datakey. This will fire the conflict resolution callback.

#### Apply
To update a Jrec stored at a Dataset / Datakey Queueitem are applied to it. The Application of Queueitem cannot be undone by SyncIt so should be done after the Queueitem has been successfully sent to the server.

#### Feed
Feeding is the process of taking Queueitem from the Server and attempting to Apply them to the local Store. If there are Queueitem for any of the Dataset / Datakey which are being fed, Feeding will stop and a Conflict will occur.

#### Queueitem
Queueitems are patches to Jrec. Queueitem come from one of two places, from the Server or locally. If they come from the Server they are Fed, otherwise they are either Applied or removed during Conflict.

##### Operation
Queueitem perform an operation with an Update to modify a Jrec. Examples of Operations are "set", "update" and "remove".

##### Update
For "set" and "update" modifications, the data take the update as to control how the data is modified.

##### Basedonversion
All Queueitem are based on a Jrec version unless there is no Jrec version in which case it is 0. If you have two Queueitem for the same Dataset / Datakey the second Queueitem will have a Basedonversion one higher than the first.

##### Modificationtime
The time at which the Queueitem was created.

##### Modifier
This uniquely identifies a client. If you are using this library from multiple device synchronization the modifier should not be only tied to the User, but tied to the User and Device combination.

#### Jrec
A Jrec is what data is called within the Store. Jrec should be data which is confirmed to be on the Server. Jrec can only be change by Feeding or Applying Queueitem. Jrec hold most metadata which is part of Queueitem but have two specific pieces which do not directly belong to Queueitem.

##### Version
The first Version for a Dataset / Datakey is 1. Subsequent Apply or Feed will increment this version.

##### Info
Data which is stored in a Jrec is called Info. This is the result of Queueitem Update. 

#### Errorcode
When errors occur in SyncIt they will issue Errorcode back, it is usually the first parameter of callbacks.
