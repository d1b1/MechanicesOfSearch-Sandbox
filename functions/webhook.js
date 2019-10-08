const fetch = require('node-fetch').default;
const _ = require('underscore')
const algoliasearch = require('algoliasearch');

const TAKESHAPE_PROJECTID = process.env.TAKESHAPE_PROJECTID
const TAKESHAPE_KEY = process.env.TAKESHAPE_KEY
const ALGOLIA_APPID = process.env.ALGOLIA_APPID
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY

const client = algoliasearch(ALGOLIA_APPID, ALGOLIA_ADMIN_KEY);

// 	{
//   "action": "content:create",
//   "meta": {
//     "projectId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
//     "userId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
//   },
//   "data": {
//     "contentId": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
//     "contentTypeName": "article",
//     "isSingleton": false
//   }
// }

exports.handler = function(event, context, callback) {
	
		if (event.httpMethod !== "POST") {
	    return { statusCode: 405, body: "Method Not Allowed" };
	  }

		// Get the Body data.
		var body = JSON.parse(event.body)
		console.log('Action', body.action, 'Body', body);

		const index = client.initIndex(body.data.contentTypeName);

		// If the action is to delete, then we do it now and stop the code.
		if (body.action === "content:delete") {
			index.deleteObject(body.data.contentId, () => {
				callback(null, {
					statusCode: 200,
					body: "Removed Index item"
				});

				return;
			})
		}

		const query = ` {
			getCheese(_id: "${body.data.contentId}") {
				_id
				name
				source
				characteristics {
					milk
					texture
					style
				}
			}
		}`;

		fetch(`https://api.takeshape.io/project/${TAKESHAPE_PROJECTID}/graphql`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${TAKESHAPE_KEY}`
			},
			body: JSON.stringify({ query })
		}).then(res => {
			return res.json();
		}).then(json => {

			var obj = json.data.getCheese;
			obj.objectID = obj._id

			index.addObject(obj, () => {
				console.log(`Indexed ${body.data.contentTypeName} id: ${body.data.contentId} `)

		    callback(null, {
			    statusCode: 200,
			    body: "Webhook Handler"
		    });

			})
		})

}
