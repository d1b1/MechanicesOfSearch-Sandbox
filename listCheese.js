var key = '1c372ec850af4f1180db4290bba0850b';
var projectID = '733a9f1a-977f-4637-bc04-8ad63d8ac13a';
const fetch = require('node-fetch')
const _ = require('underscore')

var query = `{
 getCheeseList {
		items {
			_id
			name
			characteristics {
	      aged
	      covering
	      flavors
	      milk
	      rennetType
	      standardsAndProcessing
	      style
	      texture
	    }
	    description
	    labelOrPhoto {
	      _id
	      caption
	      credit
	      description
	      filename
	      mimeType
	      path
	      sourceUrl
	      title
	      uploadStatus
	    }

		}
	}
}`

var appID = 'OBBTFVLBPT'
var adminKey = 'c7d544340ed7864d6255f9a38ba7a74e';
const algoliasearch = require('algoliasearch');
const client = algoliasearch(appID, adminKey);
const index = client.initIndex('cheese');

fetch(`https://api.takeshape.io/project/${projectID}/graphql`, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${key}`
	},
	body: JSON.stringify({query})
}).then(res => {
	return res.json();
}).then(json => {
	var items = json.data.getCheeseList.items
	console.log('here', items);

	_.each(items, item => {
		var object = item
		item.objectID = item._id;
		if (item.photo)
			item.photoUrl = 'https://images.takeshape.io/' + item.photo.path;

		index
			.addObject(object)
			.then((data) => {
				console.log('here', data);
			})
			.catch(err => {
				console.log(err);
			});
	})
});
