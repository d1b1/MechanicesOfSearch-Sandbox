var key = '1c372ec850af4f1180db4290bba0850b';
var projectID = '733a9f1a-977f-4637-bc04-8ad63d8ac13a';
const fetch = require('node-fetch')

const query = `
{
	getLookups(_id: "b661330a-cd8d-4e57-8b46-a6b37c3d89c6") {
		_id
		query
	}
}
`;


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
	console.log(json)
});
