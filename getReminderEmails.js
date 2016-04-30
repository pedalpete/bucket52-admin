var fs = require('fs');
var json2csv = require('json2csv');
var memWeek = process.argv[2];
console.log('memwee', memWeek);
function createFileArray(file) {
	var content = fs.readFileSync(file, 'utf-8');
	var arr = content.split('\n').slice(0, -1); //have to remvoe the last empty line
	var parsed = arr.map(function(i) {
		return JSON.parse(i);
	});
	return parsed;
}
//var email = createFileArray('emails.json');
var users = createFileArray('./data/users.json');
var memories = createFileArray('./data/memories.json');

//get a list of users with memories
var withMemories = memories.filter(function(mem) {
	 return (mem.week === memWeek);
}).map(function(mem) {
	return mem.owner;
});

console.log('already filled out', withMemories.length);

var usersToEmail = users.map(function(e){
	if (withMemories.indexOf(e._id) === -1) e.reminder_week = memWeek;
	else e.reminder_week = null;
	return e;
});

function getEmail(u) {
	if (u.emails) return { 
		email: u.emails[0].address,
		reminder_week: u.reminder_week
		};
	var fb = u.services.facebook;
	if (fb.email === undefined) return;
	return {
		email: fb.email,
		first_name: fb.first_name,
		reminder_week: u.reminder_week
	};
}
var reminders = usersToEmail.map(getEmail);
fs.writeFile('emailObj.json', JSON.stringify(reminders), 'utf-8');
json2csv({data: reminders, fields: ['email', 'reminder_week', 'first_name']},
	function(err, csv) {
		fs.writeFile('reminderList.csv', csv, 'utf-8');
	}
)
console.log(reminders.length);
