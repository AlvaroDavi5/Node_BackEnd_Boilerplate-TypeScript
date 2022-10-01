import { useState, useEffect } from 'react'


/**
*   ! LOCAL STORAGE methods
*? setItem('item_key', "item_value")
*  * save item on localStorage
*? getItem('item_key')
*  * get item from localStorage
*? removeItem('item_key')
*  * remove item from localStorage
**/
function storeUserId(defaultId = 0) {
	// rendered on front-end
	const [user_id] = useState(null)

	// rendered on back-end
	useEffect(() => {
		localStorage.setItem('user_id', String(defaultId))
	},
		[user_id]
	)
}

function removeUserId() {
	const [user_id] = useState(null)

	useEffect(() => {
		localStorage.removeItem('user_id')
	},
		[user_id]
	)
}

function getStoredUserId() {
	const [value] = useState(null)

	useEffect(() => {
		localStorage.getItem('user_id')
	},
		[value]
	)

	return value
}

function storeUserToken(defaultToken='') {
	const [token] = useState(null)

	useEffect(() => {
		localStorage.setItem('user_token', String(defaultToken))
	},
		[token]
	)
}

function removeUserToken() {
	const [token] = useState(null)

	useEffect(() => {
		localStorage.removeItem('user_token')
	},
		[token]
	)
}

function getStoredUserToken() {
	const [value] = useState(null)

	useEffect(() => {
		localStorage.getItem('user_token')
	},
		[value]
	)

	return value
}


export { storeUserId, removeUserId, getStoredUserId, storeUserToken, removeUserToken, getStoredUserToken }
