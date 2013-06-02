define(['dojo/store/Memory', 'dojo/store/Observable', 'dbind/bind', 'dbind/navigation'], function(Memory, Observable, bind, navigation){
	contactStore = new Observable(new Memory({data:[
		{id:1, firstName: 'Jimi', lastName:'Hendrix', email:'jimi@hendrix.com'},
		{id:2, firstName: 'Janis', lastName:'Joplin', email:'janis@fulltilt.com'},		
		{id:3, firstName: 'Jim', lastName:'Morrison', email:'jm@thedoors.com'},		
		{id:4, firstName: 'Kurt', lastName:'Cobain', email:'cobain@nirvana.org'},		
		{id:5, firstName: 'Amy', lastName:'Winehouse', email:'amy@wh.com'},			
	]}));
	contacts = bind({});
	contacts.set('list', contactStore.query({}));
	contacts.set('select', function(item){
		contacts.set('selected', item);
	});
	contacts.set('selected', {firstName: '', lastName: '', id:''});
	contacts.set('save', function(selected){
		contactStore.put(selected);
	});
	var nextId = 3;
	contacts.set('create', function(selected){
		contacts.set('selected', {firstName:'', lastName: '', email: '', id: nextId++});
	});
	navigation(contacts.get('selected'), {
		store: contactStore
	});
	return contacts;
});