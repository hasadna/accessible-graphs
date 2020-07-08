let db;
let state;
let currentIdUnderEditing = null;
// Possible viewType values:
const ENTITY_TABLE = 'ENTITY_TABLE';
const EDIT_ENTITY = 'EDIT_ENTITY';
const NEW_CONTACT_FORM = 'NEW_ConTACT_FORM';
function run() {
  let config = {
    apiKey: "AIzaSyAIqw87uhiX-YlQPJSOXLJlRtzF9gSo6KU",
    authDomain: "sensory-interface-prod.firebaseapp.com",
    projectId: "sensory-interface-prod",
  };
  let app = firebase.initializeApp(config);
  db = firebase.firestore(app);
  renderEntityTable();
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
}

function render(state) {
  document.getElementsByTagName('form')[0].reset();
  if (state.viewType === ENTITY_TABLE) {
    showDiv('entity_table');
    showDiv('add_contact_button_container');
    hideDiv('edit_entity');
    hideDiv('add_contact_form');
    document.getElementById('newContact').focus();
  } else if (state.viewType === EDIT_ENTITY) {
    // Clears previous single-entity view, if applicable.
    document.getElementById("edit_entity").innerHTML = '';
    renderSingleEntityEditor(state.entityId);

    hideDiv('entity_table');
    hideDiv('add_contact_form');
    hideDiv('add_contact_button_container');
    showDiv('edit_entity');
  } else if (state.viewType === NEW_CONTACT_FORM) {
    hideDiv('edit_entity');
    hideDiv('entity_table');
    hideDiv('add_contact_button_container');
    showDiv('add_contact_form');
  }
}

window.onpopstate = function (event) {
  if (event.state) {
    state = event.state;
  }
  render(state);
};

function showNewContactForm() {
  state = { 'viewType': NEW_CONTACT_FORM };
  history.replaceState(state, null, '');
  render(state);
  addListenerToForm(addContact);
  removeListenerFromForm(updateContact);
  showDiv('new_contact_buttons');
  hideDiv('update_contact_buttons');
}

async function addContact(event) {
  if (event) {
    event.preventDefault();
  }
  let doc = getDocFromForm();
  try {
    let docRef = await db.collection("contacts").add(doc);
    console.log("Document written with ID: ", docRef.id);
    window.location.reload();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
  return true;
}

function getDocFromForm() {
  let doc = {};
  let inputs = document.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === 'date') {
      doc[inputs[i].name] = firebase.firestore.Timestamp.fromDate(new Date(inputs[i].value));
    } else {
      doc[inputs[i].name] = inputs[i].value;
    }
  }
  let selects = document.getElementsByTagName('select');
  for (let i = 0; i < selects.length; i++) {
    doc[selects[i].name] = selects[i].value;
  }
  return doc;
}

function discardContact() {
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
}

function addTableRow(keys, value_fn, is_header) {
  let tr = document.createElement('tr');
  keys.forEach((key) => {
    let cell = document.createElement(is_header ? 'th' : 'td');
    if (is_header) {
      cell.scope = "col";
    }
    cell.appendChild(value_fn(key));
    tr.appendChild(cell);
  });
  return tr;
}

const fields = ["Name", "Next Action", "Do Date", "Status", "Comment", "Email", "Mobile Phone", "Office Phone", "Address", "Description", "Website", "Type", "Edit"];
const timestampFields = ["Do Date"];

function getCellElement(field, entity) {
  if (field === 'Edit') {
    a = document.createElement('a');
    a.appendChild(document.createTextNode(`Edit`));
    a.href = `javascript:editSingleEntity('${entity.id}')`;
    return a;
  } else if (timestampFields.includes(field)) {
    return document.createTextNode(entity.get(field).toDate().toDateString());
  } else {
    return document.createTextNode(entity.get(field));
  }
}

function renderEntityTable() {
  let entity_table = document.getElementById('entity_table');
  let table = document.createElement('table');
  let caption = document.createElement('caption');
  caption.appendChild(document.createTextNode('Contacts'));
  table.appendChild(caption);
  let tbody = document.createElement('tbody');
  entity_table.appendChild(table);
  table.appendChild(tbody);
  tbody.appendChild(addTableRow(fields, (name) => document.createTextNode(name), true));
  db.collection("contacts").get().then((querySnapshot) => {
    querySnapshot.forEach((entity) => {
      tbody.appendChild(addTableRow(fields, (field) => getCellElement(field, entity), false));
    });
  });
}

function showDiv(id) {
  let div = document.getElementById(id);
  div.setAttribute("style", "display:block");
}

function hideDiv(id) {
  let div = document.getElementById(id);
  div.setAttribute("style", "display:none");
}

function editSingleEntity(id) {
  state = { 'viewType': EDIT_ENTITY, 'entityId': id };
  render(state)
  history.pushState(state, null, '');
  currentIdUnderEditing = id;
}

function renderSingleEntityEditor(id) {
  let docRef = db.collection("contacts").doc(id);
  docRef.get().then(function (doc) {
    if (doc.exists) {
      showContactFormForEdit(doc);
    } else {
      // doc.data() will be undefined in this case
      console.log(`No document with ID ${id}`);
    }
  }).catch(function (error) {
    console.log(`Error getting document with ID ${id}:`, error);
  });
}

function showContactFormForEdit(doc) {
  showNewContactForm();
  hideDiv('new_contact_buttons');
  showDiv('update_contact_buttons');
  addListenerToForm(updateContact);
  removeListenerFromForm(addContact);
  let removeButton = document.getElementById('removeContact');
  removeButton.addEventListener('click', removeContact);
  let data = doc.data();
  let inputs = document.getElementsByTagName('input');
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === 'date') {
      inputs[i].value = convertToShortISO(data[inputs[i].name]);
    } else {
      inputs[i].value = data[inputs[i].name];
    }
  }
  let selects = document.getElementsByTagName('select');
  for (let i = 0; i < selects.length; i++) {
    selects[i].value = data[selects[i].name];
  }
}

function convertToShortISO(timeStamp) {
  let date = timeStamp.toDate();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }
  return year + '-' + month + '-' + day;
}

async function updateContact(event) {
  // TODO: Try to combine this function and addContact()
  if (event) {
    event.preventDefault();
  }
  let doc = getDocFromForm();
  try {
    await db.collection("contacts").doc(currentIdUnderEditing).set(doc);
    console.log("Document successfully written!");
    window.location.reload();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
  return true;
}


function addListenerToForm(listner) {
  let form = document.getElementsByTagName('form')[0];
  form.addEventListener('submit', listner);
}

function removeListenerFromForm(listner) {
  let form = document.getElementsByTagName('form')[0];
  form.removeEventListener('submit', listner);
}

async function removeContact(event) {
  if (event) {
    event.preventDefault();
  }
  let name = document.getElementById('name').value;
  let message = `Are you sure you want to remove ${name} from the system?`;
  if (!confirm(message)) {
    return false;
  }
  try {
    await db.collection("contacts").doc(currentIdUnderEditing).delete();
    console.log("Document successfully deleted!");
    window.location.reload();
  } catch (error) {
    console.error("Error removing document: ", error);
  }
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
}