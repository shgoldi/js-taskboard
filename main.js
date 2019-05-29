// index.html global code section
	
var notesObj = { notes: [] }; // notes is an array of objects. each object inside it describes a note
							
// ===============================================================================================

// load json string from local storage
function loadStorage() {
	if (localStorage.getItem("notes")) { // load only if notes has something in it...
		var notes_str = localStorage.getItem("notes");
		notesObj = JSON.parse(notes_str);
		for (var j=0; j < notesObj.notes.length; j++) {
			displayNote(notesObj.notes[j]); // call function to display each existing note
		}
		console.log("*** notes data has been loaded successfully from local storage! ***");
	} else {
		console.log("*** local storage is currently empty! ***");
	}
}

// ===============================================================================================

// validate user input for task's text and due-date. if validation passed, call function to save the new task (by adding a task 
// object), and display its note on the corkboard. also, update local storage accordingly, and call function to clear all input 
// fields for the next new task. however, if validation failed, i.e. the field's element is empty, then display a relevant 
// message to the user, and focus the user on the missing input field. also, checked whether the task's due date entered by the 
// user is in the future or not-see next function for further details
function addTaskFromClick() {
	var noteObj = {}; // create task object
	
	var tsk_txt = document.getElementById("task-text").value;
	var tsk_dt = document.getElementById("task-due-date").value;
	
	if (tsk_txt === "") {
		alert("New Task is a mandatory field!");
		document.getElementById("task-text").focus();
	} else {
			if (tsk_dt === "") {
				alert("Due Date is a mandatory field!");
				document.getElementById("task-due-date").focus();
			} else {
					if (!isDueDateInFuture(tsk_dt)) {
							alert("Due Date must be in the future!");
							document.getElementById("task-due-date").focus();
					} else {
						var tsk_tm = document.getElementById("task-due-time").value;				
						var curr_date_time = new Date();

						// assign properties to task object
						noteObj.txt = tsk_txt;
						noteObj.date = tsk_dt; // date will later on be formatted to the requested format display
						noteObj.time = tsk_tm;
						
						// id property will later be used to uniquely identify a note prior to its deletion, if & when done by the user
						noteObj.id = curr_date_time.getTime().toString();

						displayNote(noteObj); // calling function to display current note. its object is passed as argument to function
						
						console.log("*** new note created: ***");
						
						notesObj.notes.push(noteObj); // update notes array with the new note object
						localStorage.setItem("notes", JSON.stringify(notesObj)); // update local storage
						console.log("*** local storage updated! ***");
						
						clearInputFields(); // clear all input fields filled by the user
					}
			}
	}
}

// ===============================================================================================

// clarification: a date in the past means here YESTERDAY OR BEFORE. checking the date selected by the user in relation to the 
// reference point: start of today, meaning MIDNIGHT->00:00 . didn't extend the calculation to hours resolution. for instance, 
// the system would let the user to input today with time 02:00PM, though the current time is actually today with time 03:00PM
function isDueDateInFuture(input_date) {
    var selectedDate = new Date(input_date).getTime();
	var today_at_midnight = new Date().setHours(0,0,0,0); // zeroing for today at midnight (see clarification above)
	if (selectedDate < today_at_midnight) {
		return false;
	}
	return true;
 }

// ===============================================================================================

// display the note on the corkboard, with the current note object as a parameter. this function is called in two cases: 
// 1. the user created a new task following a mouse click on button. 2. loading a note from local storage
function displayNote(noteDataObj) {

	var notes_c = document.getElementById("notes-container"); // the notes container	
	
	var note_div = document.createElement("div"); // create a new div element, of a single note

	notes_c.appendChild(note_div); // apply note div on the notes container
	
	note_div.className = "note"; // adding class of css properties to note div
	note_div.id = noteDataObj.id; // adding identification for the note div
	
	/* image originally taken from: */ // nt_img.src = "http://www.clker.com/cliparts/d/R/v/M/J/N/posted-not-with-pin-th.png";
	note_div.style.backgroundImage = "url('http://www.clker.com/cliparts/d/R/v/M/J/N/posted-not-with-pin-th.png')";
	note_div.style.backgroundSize = "cover";
	note_div.classList.add("fade-in"); // by applying this class the note will be added with fade-in css3 effect properties
		
	var icon = document.createElement("span"); // creating bootstrap's glyphicon remove span element
	icon.className = "glyphicon glyphicon-remove";
	icon.classList.add("delete-note-icon");
	icon.classList.add("hidden"); // hidden class by default
	
	note_div.addEventListener("mouseover", function() { // change properties upon mouseover event on note
		icon.classList.remove("hidden");
		icon.classList.add("visible");
		icon.style.cursor = "pointer";
	});
	
	note_div.addEventListener("mouseout", function() { // change properties upon mouseout event on note
		icon.classList.remove("visible");
		icon.classList.add("hidden");
		icon.style.cursor = "default";
	});
	
	note_div.appendChild(icon); // apply icon on note div

	var txt_area = document.createElement("textarea"); // create textarea element for note textual content (task)
	txt_area.innerHTML = noteDataObj.txt; // get text property from note object into the textarea element
	txt_area.className = "note-txtarea fade-in";
	txt_area.readOnly = "true";
	txt_area.rows = 7;	
	note_div.appendChild(txt_area); // apply textarea on note div
	
	var timestamp_str = document.createElement("p"); // create p element for date and time
	timestamp_str.className = "timestamp";
	timestamp_str.classList.add("fade-in");
	
	// call function to reformat date to the requested DD/MM/YYYY format (date property of note object is a parameter to the function)
	var formatted_date = reformatDate(noteDataObj.date);
	timestamp_str.innerHTML = formatted_date + "<br/>" + noteDataObj.time;
	
	note_div.appendChild(timestamp_str); // apply timestamp (date+time) on note div
	
	icon.addEventListener("click", function() {
		// upon clicking on the glyphicon a comparison is being made between the note to be removed (has its glyphicon clicked) 
		// to each of the notes elements exist in the notes array, till it's being found. the comparison is between id-s 
		// represented by timestamp saved upon note creation. once a match is found, that note element will be removed from the 
		// notes array. then, the corresponding note div element will also be removed, from the notes container. finally, the 
		// local storage will be updated as well				
										var idOfNoteToBeRemoved = note_div.id;
										var found = false;
										for (var k=0; k < notesObj.notes.length && !found; k++) {
											var curr_note_id = notesObj.notes[k].id;
											console.log("*** current checked: " + curr_note_id + " ***");
											console.log("*** looking for: " + idOfNoteToBeRemoved + " ***");
											if (curr_note_id === idOfNoteToBeRemoved) {
												console.log("*** found it! ***");
												notesObj.notes.splice(k,1); // once found, remove the "k"-th note from the array
												found = true; // stop looking for it, found already
											}
										}
										document.getElementById("notes-container").removeChild(note_div);
										// remove the corresponding note div element from the notes container
										console.log("*** removed note! ***");
										localStorage.setItem("notes", JSON.stringify(notesObj)); // save updated json to local storage
										console.log("*** updated local storage! ***");
									});
					
}

// ===============================================================================================

// clear input fields filled by the user
function clearInputFields() {
	document.getElementById("task-text").value = "";
	document.getElementById("task-due-date").value = "";
	document.getElementById("task-due-time").value = "";
	
	updateRequiredFieldsDisplay(); // show/hide "required" indication (asterisk) and handle labels
}

// ===============================================================================================

// show/hide "required" indication (asterisk) and handle labels
function updateRequiredFieldsDisplay() {
	var tt = document.getElementById("task-text").value;
	var tdd = document.getElementById("task-due-date").value;
	if ( (tt != "") && (tdd != "") ) { // the two required fields are not empty, so hide required display
		document.getElementById("s2").style.display = 'none';
		document.getElementById("s1").style.display = 'none';
		document.getElementById("s3").style.display = 'none';
		document.getElementById("tsk-due-time-lbl").classList.add('tune-right');
	} else {
		// at least one of the two input elements, either the task's text or the task's due date, or both, are empty
		document.getElementById("s2").style.display = 'inline';
		if ( (tt == "") && (tdd != "") ) {
			document.getElementById("s1").style.display = 'inline';
			document.getElementById("s3").style.display = 'none';
			document.getElementById("tsk-due-time-lbl").classList.add('tune-right');
		} else if ( (tdd == "") && (tt != "") ) {
			document.getElementById("s1").style.display = 'none';
			document.getElementById("s3").style.display = 'inline';
			document.getElementById("tsk-due-time-lbl").classList.remove('tune-right');
		} else if ( (tdd == "") && (tt == "") ) {
			document.getElementById("s1").style.display = 'inline';
			document.getElementById("s3").style.display = 'inline';
			document.getElementById("tsk-due-time-lbl").classList.remove('tune-right');
		}
	}
}

// ===============================================================================================

// reformat date to format: DD/MM/YYYY
function reformatDate(task_input_date) {
	function validatePrefixZero(date_elem) { return (date_elem < 10) ? '0' + date_elem : date_elem; } // consider case of prefix zero
	var d = new Date(task_input_date);
	return [validatePrefixZero(d.getDate()), validatePrefixZero(d.getMonth()+1), d.getFullYear()].join('/');
}

// ===============================================================================================

// clear notes data from local storage
function clearStorage() {		
	if (localStorage.getItem("notes")) { // first check if there's any data in the local storage...
		// display a warning for the user. if confirmed, clear the local storage, and also clear all notes from the corkboard
		var clearActionsSelected = confirm("WAIT!\nLOCAL STORAGE WILL BE CLEARED,\nAND ALL NOTES, IF ANY, WILL BE DELETED!\nTHESE ACTIONS CANNOT BE UNDONE!\nARE YOU SURE?");
		if (clearActionsSelected) {
			localStorage.removeItem("notes"); // clear the local storage
			console.log("*** notes data cleared from local storage! ***");
			clearAllNotes(); // clear all notes from the corkboard
			clearInputFields(); // clear input fields filled by the user
		}
	} else {
		alert("Local Storage is already cleared...");
	}
}

// ===============================================================================================

// clear all existing notes, if there are any
function clearAllNotes() {
	var notes_container = document.getElementById("notes-container");
	if ( notes_container.hasChildNodes() ) { // first check if there are any notes to delete...
		while (notes_container.firstChild) {
			notes_container.removeChild(notes_container.firstChild); // if so, remove them one by one
		}
		notesObj = { notes: [] }; // initialize the array of notes
		console.log("notes array cleared from any values!");
	} else {
		console.log("there are no notes to delete!");
	}
}