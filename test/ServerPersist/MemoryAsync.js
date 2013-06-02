/*jshint smarttabs:true */
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../../node_modules/expect.js/expect.js'),
			require('../../js/Constant.js'),
			require('../../js/ServerPersist/MemoryAsync.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/Constant',
				'syncit/ServerPersist/MemoryAsync'
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt_Constant,
			root.SyncIt_ServerPersist_MemoryAsync
		);
	}
})(this, function (
	expect,
	SyncIt_Constant,
	SyncIt_ServerPersist_MemoryAsync
) {
	describe ("ServerPersist_MemoryAsync",function() {
		var sPMA = new SyncIt_ServerPersist_MemoryAsync();
		
		it('can be pushed to',function(done) {
			sPMA.push(
				{
					s: 'cars',
					k: 'ford',
					o: 'set',
					u: {
						price:'affordable',
						size:'mixed',
						speed: 'medium',
						drive: 'usually front'
					},
					m: 'ben',
					b: 0,
					t: new Date().getTime() - 1000
				},
				function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					sPMA.push(
						{
							s: 'cars',
							k: 'ford',
							o: 'set',
							u: {
								price:'affordable',
								size:'mixed',
								speed: 'medium',
								drive: 'usually front'
							},
							m: 'ben',
							b: 1,
							t: new Date().getTime() - 1000
						},
						function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							done();
						}
					);
				}
			);
		});
		
		it('will detect already pushed',function(done) {
			sPMA.push(
				{
					s: 'cars',
					k: 'ford',
					o: 'set',
					u: {
						price:'affordable',
						size:'mixed',
						speed: 'medium'
					},
					m: 'ben',
					b: 1,
					t: new Date().getTime() - 1000
				},
				function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.TRYING_TO_ADD_ALREADY_ADDED_QUEUEITEM);
					done();
				}
			);
		});
		
		it('will detect version errors',function(done) {
			sPMA.push(
				{
					s: 'cars',
					k: 'ford',
					o: 'set',
					u: {
						price:'affordable',
						size:'mixed',
						speed: 'medium',
						drive: 'usually front'
					},
					m: 'jon',
					b: 0,
					t: new Date().getTime() - 1000
				},
				function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.TRYING_TO_ADD_QUEUEITEM_BASED_ON_OLD_VERSION);
					done();
				}
			);
		});
		
		it('will stop updates of deleted',function(done) {
			sPMA.push(
				{
					s: 'cars',
					k: 'bmw',
					o: 'set',
					u: {
						price:'somewhat high'
					},
					m: 'jon',
					b: 0,
					t: new Date().getTime()
				},
				function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					sPMA.push(
						{
							s: 'cars',
							k: 'bmw',
							o: 'remove',
							m: 'jon',
							b: 1,
							t: new Date().getTime()
						},
						function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							sPMA.push(
								{
									s: 'cars',
									k: 'bmw',
									o: 'remove',
									m: 'jon',
									b: 2,
									t: new Date().getTime()
								},
								function(err) {
									expect(err).to.equal(SyncIt_Constant.Error.DATA_ALREADY_REMOVED);
									done();
								}
							);
						}
					);
				}
			);
		});		
		
		describe('when getting stored values',function(done) {
			
			it('will retrieve with OK if found',function(done) {
				sPMA.getValue(
					'cars',
					'ford',
					function(err,jrec) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(jrec.i.drive).to.eql('usually front');
						done();
					}
				);
			});
			
			it('will error if it not found',function(done) {
				sPMA.getValue(
					'cars',
					'chevrolet',
					function(err,jrec) {
						expect(err).to.equal(SyncIt_Constant.Error.NO_DATA_FOUND);
						done();
					}
				);
			});
		});
		
		describe('when getting the queue',function(done) {
			
			it('will retrieve with OK if found from start',function(done) {
				sPMA.getQueueitem(
					'cars',
					null,
					function(err,queueitems) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(queueitems.length).to.equal(4);
						expect(queueitems[0].s).to.equal('cars');
						done();
					}
				);
			});
			
			it('will retrieve with OK if found from middle',function(done) {
				sPMA.getQueueitem(
					'cars',
					'cars.ford@1',
					function(err,queueitems) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(queueitems.length).to.equal(3);
						expect(queueitems[0].s).to.equal('cars');
						done();
					}
				);
			});
			
			it('will handle out of bounds fromPosition',function(done) {
				sPMA.getQueueitem(
					'cars',
					5,
					function(err,queueitems) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(queueitems.length).to.equal(0);
						done();
					}
				);
			});
			
			it('will retrieve with OK if not found with zero records',function(done) {
				sPMA.getQueueitem(
					'boats',
					null,
					function(err,queueitems) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(queueitems.length).to.equal(0);
						done();
					}
				);
			});
			
		});
		
		it('can list datasets',function(done) {
			sPMA.getDatasetNames(function(err,dsn) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				expect(dsn.length).to.equal(1);
				expect(dsn[0]).to.equal('cars');
				done();
			});
		});
		
	});
	
});