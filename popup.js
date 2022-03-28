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

function removeVideoNumber(title) {
	let parts = title.split('. ');

	parts.splice(0, 1);

	return parts.join()
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
		})
		.then(onNotesCollected)
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
					fontSize: 6,
					color: 'gray',
				},
				{
					text: 'Udemy 2 pdf',
					alignment: 'right',
					fontSize: 6,
					color: 'gray',
				}
			]
		},

		styles: {

		},

		content: [
			{
				text: courseTitle,
				margin: [0, 50, 0, 70],
				alignment: 'center',
				color: '#a435f0',
				fontSize: 24,
				bold: true,
			},
			{
				fontSize: 8,
				pageBreak: 'before',
				toc: {
					id: 'mainToc',
					title: {
						text: 'Table of contents',
						alignment: 'center',
						fontSize: 14,
						margine: [0,0,0,30]
					},
				},
			}
		],
	}


	Object.keys(sections).forEach(sectionTitle => {
		docDefinition.content.push({
			text: removeVideoNumber(sectionTitle),
			alignment: 'center',
			pageBreak: 'before',
			margin: [0, 50, 0, 10],
			fontSize: 18,
			bold: true,
			tocItem: ['mainToc']
		})

		Object.keys(sections[sectionTitle]).forEach(lectureTitle => {
			docDefinition.content.push({
				text: removeVideoNumber(lectureTitle),
				pageBreak: 'before',
				fontSize: 14,
				margin: 0,
				bold: true,
				color: 'blue',
				tocItem: ['mainToc']
			})

			sections[sectionTitle][lectureTitle].map(note => {

				let lectureNoteForPdf = htmlToPdfmake(
					note, {
						defaultStyles: {
							p: {
								fontSize: 10,
								color: '#303030',
								margin: 0,
								lineHeight:1.2
							},
							strong: {
								fontSize: 12,
							}
						}
					}
				);

				docDefinition.content.push({
					layout: 'noBorders',
					margin: [0, 10],
					table: {
						body: [
							[lectureNoteForPdf]
						]
					}
				})
			})
		})
	})

	pdfMake.createPdf(docDefinition).download(courseTitle + '.pdf');
}