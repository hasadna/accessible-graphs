let app;
let db;
let state;
let currentContactId = null;
let currentContactName = null;
// Possible viewType values:
const ENTITY_TABLE = 'ENTITY_TABLE';
const EDIT_ENTITY = 'EDIT_ENTITY';
const TIMELINE_ENTITY = 'TIMELINE_ENTITY';
const NEW_CONTACT_FORM = 'NEW_ConTACT_FORM';
function run() {
  let prodConfig = {
    apiKey: "AIzaSyAIqw87uhiX-YlQPJSOXLJlRtzF9gSo6KU",
    authDomain: "sensory-interface-prod.firebaseapp.com",
    projectId: "sensory-interface-prod",
  };
  const devConfig = {
    apiKey: "AIzaSyC5rmfKlS4hnmPcUOs9tHfvTQw6_8XqT0Q",
    authDomain: "sensory-interface-dev.firebaseapp.com",
    databaseURL: "https://sensory-interface-dev.firebaseio.com",
    projectId: "sensory-interface-dev",
    storageBucket: "sensory-interface-dev.appspot.com",
    messagingSenderId: "642262600007",
    appId: "1:642262600007:web:af395261e278958eba2462"
  };
  if (isOnProd()) {
    app = firebase.initializeApp(prodConfig);
  } else {
    app = firebase.initializeApp(devConfig);
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in').textContent = 'Sign out';
      // [END_EXCLUDE]
      loadData();
      let iframe = document.getElementsByTagName('iframe')[0];
      if (iframe) {
        iframe.style = 'display: none;';
      }
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in').textContent = 'Sign in with Google';
      // [END_EXCLUDE]
    }
  });
  document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
}

window.onload = function () {
  run();
  document.getElementById('backup').addEventListener('click', backup);
};

function toggleSignIn() {
  if (!firebase.auth().currentUser) {
    // [START createprovider]
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START signin]
    firebase.auth().signInWithPopup(provider).then(function (result) {
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential') {
        alert('You have already signed up with a different auth provider for that email.');
        // If you are using multiple auth providers on your app you should handle linking
        // the user's accounts here.
      } else {
        console.error(error);
      }
      // [END_EXCLUDE]
    });
    // [END signin]
  } else {
    // [START signout]
    firebase.auth().signOut();
    document.getElementById('entity_table').innerHTML = '';
    hideDiv('add_contact_button_container');
    hideDiv('entity_table');
    hideDiv('backup_button_container');

    // [END signout]
  }
}

function loadData() {
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
    showDiv('backup_button_container');
    showDiv('sign_in_container');
    hideDiv('add_contact_form');
    hideDiv('timeline_entity');
    document.getElementById('newContact').focus();
  } else if (state.viewType === EDIT_ENTITY) {
    // Clears previous single-entity view, if applicable.
    document.getElementById("edit_entity").innerHTML = '';
    renderSingleEntityEditor(state.entityId);

    hideDiv('entity_table');
    hideDiv('add_contact_form');
    hideDiv('add_contact_button_container');
    hideDiv('timeline_entity');
    showDiv('edit_entity');
  } else if (state.viewType === NEW_CONTACT_FORM) {
    hideDiv('edit_entity');
    hideDiv('entity_table');
    hideDiv('add_contact_button_container');
    hideDiv('sign_in_container');
    hideDiv('backup_button_container');
    hideDiv('timeline_entity');
    showDiv('add_contact_form');
  } else if (state.viewType === TIMELINE_ENTITY) {
    hideDiv('edit_entity');
    hideDiv('entity_table');
    hideDiv('add_contact_button_container');
    hideDiv('sign_in_container');
    hideDiv('backup_button_container');
    showDiv('timeline_entity');
    document.getElementById('timeline_entity').innerHTML = '';
    showContactTimeline(state.entityId);
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
  document.getElementById('contactFormHeading').innerHTML = 'Add new contact';
}

async function addContact(event) {
  if (event) {
    event.preventDefault();
  }
  let doc = getDocFromForm();
  doc['Timeline'] = '[]';
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

const fields = ["Name", "Next Action", "Do Date", "Status", "Timeline", "Email", "Mobile Phone", "Office Phone", "Address", "Description", "Website", "Type", "Edit"];
const timestampFields = ["Do Date"];

function getCellElement(field, entity) {
  if (field === 'Edit') {
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(`Edit contact card for ${currentContactName}`));
    a.href = `javascript:editSingleEntity('${entity.id}')`;
    return a;
  } else if (field === 'Timeline') {
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(`Show Timeline for ${currentContactName}`));
    a.href = `javascript:showTimeline('${entity.id}')`;
    return a;
  } else if (field === 'Email') {
    let a = document.createElement('a');
    a.appendChild(document.createTextNode(entity.get('Email')));
    a.href = `mailto:${entity.get('Email')}`;
    return a;
  } else if (field === 'Website') {
    let website = entity.get('Website');
    let a = document.createElement('a');
    let textNode = document.createTextNode(website);
    a.appendChild(textNode);
    a.href = website;
    return website !== '' ? a : textNode;
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
      currentContactName = entity.get('Name');
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
  currentContactId = id;
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

function showTimeline(id) {
  document.getElementById('timeline_entity').innerHTML = '';
  state = { 'viewType': TIMELINE_ENTITY, 'entityId': id };
  render(state);
  history.pushState(state, null, '');
  currentContactId = id;
}

async function getTimelineData(id) {
  try {
    let doc = await db.collection("contacts").doc(id).get();
    if (doc.exists) {
      return doc;
    } else {
      // doc.data() will be undefined in this case
      console.log(`No document with ID ${id}`);
    }
  } catch (error) {
    console.log(`Error getting document with ID ${id}:`, error);
  }
}

async function showContactTimeline(id) {
  let doc = await getTimelineData(id);
  let timelineContainer = document.getElementById('timeline_entity');
  let timeLineHeading = document.createElement('h1');
  timeLineHeading.innerHTML = `Showing timeline for ${doc.get('Name')}`;
  timelineContainer.appendChild(timeLineHeading);
  let timelineInfo = doc.get('Timeline');
  let items = JSON.parse(timelineInfo);
  items.forEach((item) => {
    let dateDiv = document.createElement('div');
    dateDiv.id = item.date;
    timelineContainer.appendChild(dateDiv);
    let dateHeading = document.createElement('h2');
    dateHeading.innerHTML = item.date;
    dateDiv.appendChild(dateHeading);
    item.elements.forEach((element) => {
      let time = document.createElement('h3');
      time.innerHTML = element.time;
      dateDiv.appendChild(time);
      let body = document.createElement('div');
      let converter = new showdown.Converter();
      body.innerHTML = converter.makeHtml(element.body);
      body.setAttribute('data-markdown', element.body);
      body.setAttribute('dir', 'auto');
      dateDiv.appendChild(body);
      let editButton = document.createElement('button');
      editButton.id = 'editTimelineItem';
      editButton.innerHTML = 'Edit item';
      editButton.addEventListener('click', editTimelineItem);
      dateDiv.appendChild(editButton);
    });
  });
  let newItemHeading = document.createElement('h2');
  newItemHeading.innerHTML = 'Add new item to timeline';
  timelineContainer.appendChild(newItemHeading);
  let newItemInput = document.createElement('textarea');
  newItemInput.id = 'newItemInput';
  timelineContainer.appendChild(newItemInput);
  let addButton = document.createElement('button');
  addButton.innerHTML = 'Add item to timeline';
  addButton.addEventListener('click', addNewItem);
  timelineContainer.appendChild(addButton);
  let doneButton = document.createElement('button');
  doneButton.innerHTML = 'Done';
  doneButton.addEventListener('click', backToHome);
  timelineContainer.appendChild(doneButton);
}

async function addNewItem(event) {
  let docRef = db.collection("contacts").doc(currentContactId);
  try {
    let doc = await docRef.get();
    if (doc.exists) {
      let newTimelineElement = { "time": getCurrentTime(), "body": document.getElementById('newItemInput').value };
      let currentDate = new Date().toDateString();
      let items = addItemToDoc(doc, newTimelineElement, currentDate);
      updateDoc(items);
    } else {
      // doc.data() will be undefined in this case
      console.log(`No document with ID ${id}`);
    }
  } catch (error) {
    console.log(`Error getting document with ID ${id}:`, error);
  }
}

function backToHome(event) {
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
}

function addItemToDoc(doc, newTimelineElement, date) {
  let timelineInfo = doc.get('Timeline');
  let items = JSON.parse(timelineInfo);
  for (let i = 0; i < items.length; i++) {
    if (items[i].date !== date) {
      continue;
    }
    let elements = items[i].elements;
    for (let j = 0; j < elements.length; j++) {
      if (elements[j].time !== newTimelineElement.time) {
        continue;
      }
      elements[j].body = newTimelineElement.body;
      return items;
    }
    items[i].elements.push(newTimelineElement);
    return items;
  }
  items.push({ 'date': date, elements: [newTimelineElement] });
  return items;
}

async function updateDoc(timelineItems) {
  let newTimelineInfo = JSON.stringify(timelineItems);
  let docRef = db.collection("contacts").doc(currentContactId);
  try {
    await docRef.update({ 'Timeline': newTimelineInfo });
    console.log("Document successfully written!");
    showTimeline(currentContactId);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

function editTimelineItem(event) {
  let editButton = event.target;
  editButton.style = 'display: none;';
  let bodyDiv = editButton.previousSibling;
  bodyDiv.style = 'display: none;';
  let bodyHtml = bodyDiv.innerHTML;
  let bodyMarkdown = bodyDiv.getAttribute('data-markdown');
  let editInput = document.createElement('textarea');
  editInput.id = 'editInput';
  editInput.value = bodyMarkdown;
  insertAfter(editInput, editButton);
  editInput.focus();
  let saveButton = document.createElement('button');
  saveButton.id = 'saveChanges';
  saveButton.innerHTML = 'Save';
  saveButton.addEventListener('click', saveChanges);
  insertAfter(saveButton, editInput);
  let cancelButton = document.createElement('button');
  cancelButton.id = 'discardChanges';
  cancelButton.innerHTML = 'Cancel';
  cancelButton.addEventListener('click', discardChanges);
  insertAfter(cancelButton, saveButton);
}

async function saveChanges(event) {
  let saveButton = event.target;
  let markdown = saveButton.previousSibling.value;
  let time = saveButton.previousSibling.previousSibling.previousSibling.previousSibling.innerHTML;
  let date = saveButton.parentNode.id;
  let newTimelineElement = { "time": time, "body": markdown };
  let docRef = db.collection("contacts").doc(currentContactId);
  try {
    let doc = await docRef.get();
    if (doc.exists) {
      let items = addItemToDoc(doc, newTimelineElement, date);
      await updateDoc(items);
    } else {
      // doc.data() will be undefined in this case
      console.log(`No document with ID ${id}`);
    }
  } catch (error) {
    console.log(`Error getting document with ID ${id}:`, error);
  }
}

function discardChanges(event) {
  let cancelButton = event.target;
  removeEditControls(cancelButton);
}

function removeEditControls(cancelButton) {
  let bodyDiv = cancelButton.previousSibling.previousSibling.previousSibling.previousSibling;
  bodyDiv.style = 'display: block;';
  let editButton = cancelButton.previousSibling.previousSibling.previousSibling;
  cancelButton.previousSibling.previousSibling.remove();
  cancelButton.previousSibling.remove();
  cancelButton.remove();
  editButton.style = 'display: block;';
  editButton.focus();
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function getCurrentTime() {
  let date = new Date();
  return `${date.getHours()}:${date.getMinutes()}`;
}

function showContactFormForEdit(doc) {
  showNewContactForm();
  document.getElementById('contactFormHeading').innerHTML = `Edit contact card for ${doc.get('Name')}`;
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
    await db.collection("contacts").doc(currentContactId).update(doc);
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
    await db.collection("contacts").doc(    currentContactId).delete();
    console.log("Document successfully deleted!");
    window.location.reload();
  } catch (error) {
    console.error("Error removing document: ", error);
  }
  state = { 'viewType': 'ENTITY_TABLE' };
  history.replaceState(state, null, '');
  render(state);
}

async function backup() {
  let querySnapshot = await db.collection("contacts").get();
  let data = await querySnapshot.docs.map(doc => doc.data());
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  let currentDate = new Date().toDateString();
  downloadAnchorNode.setAttribute("download", `backup - ${currentDate}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

const productionDomains = [
  'sensory-interface-prod.firebaseapp.com',
  'accessiblegraphs.org',
  'sensoryinterface.com'
]

function isOnProd() {
  if (productionDomains.includes(location.hostname)) {
    return true;
  } else {
    return false;
  }
}
