const uri = 'zoommtg://zoom.us/join' + location.search

const search = new URLSearchParams(location.search)
const origUri = 'https://us04web.zoom.us/j/' +
search.get('confno') + '?pwd=' + search.get('pwd')

const blockedMessage = 'Please allow pop-ups to open links automatically'

const timeouts = []
let retry_open = 0

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
	if (sessionStorage.getItem('open') === '1' || location.search === '')
		return

	if (window.open(uri)) {
		sessionStorage.setItem('open', '1')
		const i = setTimeout(() => {
			sessionStorage.removeItem('open')
		}, 10 * 1000)

		timeouts.push(i)
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

document.addEventListener('DOMContentLoaded', openZoom)
document.addEventListener('unload', () => {
	timeouts.forEach(t => clearTimeout(t))
})
