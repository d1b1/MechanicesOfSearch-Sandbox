const fetch = require('node-fetch').default;
const _ = require('underscore')
const algoliasearch = require('algoliasearch');

// Config variables.
const TAKESHAPE_PROJECTID = process.env.TAKESHAPE_PROJECTID
const TAKESHAPE_KEY = process.env.TAKESHAPE_KEY

const ALGOLIA_APPID = process.env.ALGOLIA_APPID
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY

const client = algoliasearch(ALGOLIA_APPID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex('cheese');

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
		}
	}
}`

exports.handler = function(event, context, callback) {

	fetch(`https://api.takeshape.io/project/${TAKESHAPE_PROJECTID}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${TAKESHAPE_KEY}`
		},
		body: JSON.stringify({ query })
	}).then(res => {
		return res.json();
	}).then(res => {
			var items = res.data.getCheeseList.items
			var list = [];

			_.each(items, item => {
				var object = item
				item.objectID = item._id;
				if (item.photo) item.photoUrl = 'https://images.takeshape.io/' + item.photo.path;
				list.push(item)
			})

			index
			.addObjects(list)
			.then((data) => {
				console.log('Indexed', data);
				var count = data.objectIDs.length;

				callback(null, {
					statusCode: 200,
					body: `Rebuild all takeshape data to the index ${count}`
				});
			})
			.catch(err => {
				console.log('Got an Eror', err);
				callback(err, {
					statusCode: 500,
					body: err.message
				});
			});
	});

}
