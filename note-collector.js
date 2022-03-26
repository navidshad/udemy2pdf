chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

	if (msg.type == 'get-status') {
		sendResponse({
			status: 'active'
		});
	} else if (msg.type == 'get-notes') {
		const notes = collectNotes();
		sendResponse(notes)
	}
});

let lectures = {};

function collectNotes() {
	lectures = {};

	const s = {
		courseTitle: '.header--course-title--tHmMe > a',
		sectionTitle: '.lecture-bookmark-v2--section--383LP',
		lectureNote: '.lecture-bookmark-v2--bookmark-container--yCEMR',
		lectureTitle: '.udlite-text-sm',
		lectureNoteContent: '.rich-text-viewer--rich-text-viewer--19N-I'
	}

	// Get All lecture nodes
	let courseTitle = document.querySelector(s.courseTitle).textContent;
	let = lecturesNodes = document.querySelectorAll(s.lectureNote);

	for (let lectureIndex = 0; lectureIndex < lecturesNodes.length; lectureIndex++) {
		const LectureNode = lecturesNodes[lectureIndex];

		let SectionTitle = LectureNode.querySelector(s.sectionTitle).textContent
		let lectureTitle = LectureNode.querySelector(s.lectureTitle).textContent;
		let noteCOntent = LectureNode.querySelector(s.lectureNoteContent).innerHTML;

		if (lectures[SectionTitle] && lectures[SectionTitle][lectureTitle]) {
			lectures[SectionTitle][lectureTitle].push(noteCOntent);
		} else if (lectures[SectionTitle]) {
			lectures[SectionTitle][lectureTitle] = [noteCOntent]
		} else {
			lectures[SectionTitle] = {};
			lectures[SectionTitle][lectureTitle] = [noteCOntent]
		}
	}

	let result = {
		courseTitle,
		sections: lectures
	}
	
	console.log(result);

	return result;
}