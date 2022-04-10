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

function convertTimeToSeconds(strTime) {
	let parts = strTime.split(':')

	parts.forEach((value, i) => {
		value = Number.parseInt(value);
		value = i == 0 ? value * 60 : value;
	})

	return parts[0] + parts[1];
}

function collectNotes() {
	lectures = {};

	const s = {
		courseTitle: '.header--course-title--tHmMe > a',
		lectureNote: '.lecture-bookmark-v2--row--1JALI',
		lectureTime: '.lecture-bookmark-duration--bookmark-timer--DMSFz > span',
		sectionTitle: '.lecture-bookmark-v2--section--383LP',
		lectureTitle: '.udlite-text-sm',
		lectureNoteContent: '[data-purpose=bookmark-body]'
	}

	// Get All lecture nodes
	let courseTitle = document.querySelector(s.courseTitle).textContent;
	let = LectureParentNodes = document.querySelectorAll(s.lectureNote);

	for (let lectureIndex = 0; lectureIndex < LectureParentNodes.length; lectureIndex++) {
		const LectureParentNode = LectureParentNodes[lectureIndex];

		let lectureTime = LectureParentNode.querySelector(s.lectureTime).textContent;
		lectureTime = convertTimeToSeconds(lectureTime);

		let SectionTitle = LectureParentNode.querySelector(s.sectionTitle).textContent
		let lectureTitle = LectureParentNode.querySelector(s.lectureTitle).textContent;
		let noteCOntent = LectureParentNode.querySelector(s.lectureNoteContent).innerHTML;

		if (lectures[SectionTitle] && lectures[SectionTitle][lectureTitle]) {

			lectures[SectionTitle][lectureTitle].push([lectureTime, noteCOntent]);

			let lectureNotes = lectures[SectionTitle][lectureTitle];

			// Sort by time
			lectureNotes.sort((a, b) => {
				if (a[0] < b[0]) return -1;
				else return 1;
			})

		} else if (lectures[SectionTitle]) {
			lectures[SectionTitle][lectureTitle] = [
				[lectureTime, noteCOntent]
			]
		} else {
			lectures[SectionTitle] = {};
			lectures[SectionTitle][lectureTitle] = [
				[lectureTime, noteCOntent]
			]
		}
	}

	// remove time
	Object.keys(lectures)
		.forEach(SectionTitle => {
			Object.keys(lectures[SectionTitle]).forEach(lectureTitle => {
				lectures[SectionTitle][lectureTitle] = lectures[SectionTitle][lectureTitle].map(lectureNote => lectureNote[1]);
			})
		})


	let result = {
		courseTitle,
		sections: lectures
	}

	console.log(result);

	return result;
}