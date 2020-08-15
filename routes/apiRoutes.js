const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const { notes } = require('../db/db.json');


function findById(id, notesArray) {
  let noteID = parseInt(id);
  const result = notesArray.filter(note => note.id === noteID)[0];
  return result;
}

// Write new note
function createNewNote(body, notesArray) {
  const note = body;
  notesArray.push(note);
  fs.writeFileSync(
    path.join(__dirname, '../db/db.json'),
    JSON.stringify({ notes: notesArray }, null, 2)
  );

  return body;
}

function validateNote(note) {
  if (!note.title || typeof note.title !== 'string') {
    return false;
  }
  if (!note.text || typeof note.text !== 'string') {
    return false;
  }
  return true;
}

// Delete note, logic to re-assign ids on delete
function deleteNote(id, notesArray) {
  let noteID = parseInt(id);
  for (let i = 0; i < notes.length; i++) {
      if (noteID === notes[i].id) {
        notes.splice(i,1);
        if (notes.length > 0) {
          notes[0].id = 0;
          for (let j = 1; j < notes.length; j++) {
            notes[j].id = notes[j-1].id + 1;
          }  
        }
        fs.writeFileSync(
          path.join(__dirname, '../db/db.json'),
          JSON.stringify({ notes: notesArray }, null, 2)
        );
      }
  }
  return notes;
};

router.get('/notes', (req, res) => {
    res.json(notes);
  });
// Find by id must use path /api/notes in 
router.get('/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// Write API route
router.post('/notes', (req, res) => {
  if (notes === undefined || notes.length == 0) {
    req.body.id = 0;
  } else {
    req.body.id = notes.length;
  };

  if (!validateNote(req.body)) {
    res.status(400).send('The note is not properly formatted.');
  } else {
    const note = createNewNote(req.body, notes);
    res.json(note);
  }
});

// Delete API route
router.delete('/notes/:id', (req, res) => {
  deleteNote(req.params.id, notes);
  res.json(notes);
});


module.exports  = router;