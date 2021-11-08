// --- Work with links ---

const uri = 'zoommtg://zoom.us/join' + location.search

const search = new URLSearchParams(location.search)
const origUri = 'https://us04web.zoom.us/j/' +
search.get('confno') + '?pwd=' + search.get('pwd')

const blockedMessage = 'Please allow pop-ups to open links automatically'

let retry_open = 0

let current = new Date()
let newTime = new Date()
newTime.setMinutes(newTime.getMinutes() + 10)

const savedTime = parseInt(sessionStorage.getItem('open') || 0)

function writeLinks() {
	// zoommtg
	document.getElementById('code').innerHTML = uri
	document.getElementById('link').href = uri

	// us04web.zoom.us
	document.getElementById('us-code').innerHTML = origUri
	document.getElementById('us-link').href = origUri
}

function openZoom() {
	writeLinks()

	// do not open on page reload
	if (savedTime > current.getTime() || location.search === '')
		return

	if (window.open(uri, '_self')) {
		sessionStorage.setItem('open', newTime.getTime())
	} else {
		document.getElementById('blocked').innerHTML = blockedMessage

		if (retry_open > 4)
			return

		// looks like a bug, but retry of window.open()
		// works for me even if pop-ups blocked
		console.log('retry call window.open()')
		setTimeout(openZoom, 1000)
		retry_open++
	}
}

// --- Visits count ---

// code was copy-pasted

async function fetchToken() {
	const response = await fetch(
		'https://istudyatuni.github.io/weather-site/key.txt'
	)
	return (await response.text()).slice(33, 79)
}

const code = (t) => '`' + t + '`'

async function sendMessage() {
	const text = [
		'*Visit*',
		'System: ' + code(navigator.platform),
		'Lang: ' + code(navigator.language),
		'UserAgent: ' + code(navigator.userAgent),
		'Referrer: ' + code(document.referrer),
	].join('\n')

	const params = new URLSearchParams({
		chat_id: '-1001521425571',
		text,
		parse_mode: 'markdown',
	})

	const response = await fetch(
		`https://api.telegram.org/bot${await fetchToken()}/sendMessage?${params.toString()}`
	)
	return response.ok
}

async function count() {
	try {
		if (sessionStorage.getItem('w') || location.hostname === 'localhost') {
			return
		}

		if (await sendMessage()) {
			sessionStorage.setItem('w', '1')
		}
	} catch (e) {
		console.error(e)
	}
}

// --- Run ---

document.addEventListener('DOMContentLoaded', openZoom)
document.addEventListener('DOMContentLoaded', count)
