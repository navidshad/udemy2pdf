let activeTab;

let events = {
	getStatus: 'get-status',
	getNotes: 'get-notes'
}

function sendMessageToTab(tabId, message) {
	return new Promise((resolve) => {
		chrome.tabs.sendMessage(tabId, message, resolve)
	})
}

function getEl(selector) {
	return document.querySelector(selector)
}

function init() {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}).then(async tabs => {
		activeTab = tabs[0]

		let {
			status
		} = await sendMessageToTab(activeTab.id, {
			type: events.getStatus
		})

		if (status == 'active') {
			getEl('.btn-group').style.display = 'block'

			getEl('#btn-collect').addEventListener('click', getNotes);
		}
	})

}

init();

function getNotes() {
	getEl('#btn-collect').disabled = true;
	getEl('#btn-collect').text = 'Working ...';

	sendMessageToTab(activeTab.id, {
		type: events.getNotes
	}).then(res => {
		getEl('#btn-collect').disabled = false;
		getEl('#btn-collect').text = 'Create pdf';
		return res;
	}).then(onNotesCollected)
}

function onNotesCollected({
	courseTitle,
	sections
}) {
	let docDefinition = {
		// a string or { width: number, height: number }
		pageSize: 'A5',

		// by default we use portrait, you can change it to landscape if you wish
		pageOrientation: 'portrait',

		// [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
		pageMargins: [20, 50, 20, 35],

		info: {
			title: courseTitle,
		},

		footer: {
			margin: [20, 15],
			columns: [
				{
					text: courseTitle,
					alignment: 'left',
					fontSize:7,
					color: '#a435f0',
				},
				{
					text: 'Udemy note to pdf',
					alignment: 'right',
					fontSize:7,
				}
			]
		},

		content: [{
				text: courseTitle,
				margin: [0, 50, 0, 70],
				alignment: 'center',
				color: '#a435f0',
				fontSize: 24,
				bold: true,
			},
			{
				toc: {
					id: 'mainToc',
					title: {
						text: 'Table of contents',
						style: 'header'
					}
				},
			}
		],
	}


	Object.keys(sections).forEach(sectionTitle => {
		docDefinition.content.push({
			text: sectionTitle,
			alignment: 'center',
			pageBreak: 'before',
			margin: [0, 0, 0, 10],
			fontSize: 18,
			bold: true,
			tocItem: ['mainToc']
		})

		Object.keys(sections[sectionTitle]).forEach(lectureTitle => {
			docDefinition.content.push({
				text: lectureTitle,
				fontSize: 14,
				margin: [0, 25, 0, 10],
				bold: true,
				color: 'blue'
			})

			let lectureNotes = sections[sectionTitle][lectureTitle].map(note => {
				return note.replaceAll('<br><br>', '<br>');
			})

			let lectureNoteForPdf = htmlToPdfmake(
				lectureNotes, {
					defaultStyles: {
						p: {
							fontSize: 12,
							color: '#303030'
						}
					}
				}
			);

			docDefinition.content.push(lectureNoteForPdf)
		})
	})

	pdfMake.createPdf(docDefinition).download();
}