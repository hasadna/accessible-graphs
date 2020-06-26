let db;
let state;
// Possible viewType values:
const ENTITY_TABLE = 'ENTITY_TABLE';
const EDIT_ENTITY = 'EDIT_ENTITY';
function run() {
  let config = {
    apiKey: "AIzaSyAIqw87uhiX-YlQPJSOXLJlRtzF9gSo6KU",
    authDomain: "sensory-interface-prod.firebaseapp.com",
    projectId: "sensory-interface-prod",
  };
  let app = firebase.initializeApp(config);
  db = firebase.firestore(app);
  renderEntityTable();
  state = {'viewType': 'ENTITY_TABLE'};
  history.replaceState(state, null, '');
  render(state);
}

function render(state) {
  if (state.viewType === ENTITY_TABLE) {
    showDiv('entity_table');
    hideDiv('edit_entity');
  } else if (state.viewType === EDIT_ENTITY) {
    // Clears previous single-entity view, if applicable.
    document.getElementById("edit_entity").innerHTML = '';
    renderSingleEntityEditor(state.entityId);

    hideDiv('entity_table');
    showDiv('edit_entity');
  }
}

window.onpopstate = function (event) {
  if (event.state) { 
    state = event.state; 
  }
  render(state);
};

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

const fields = ["Edit", "Type", "Name", "Email", "Description", "Next Action", "Take action by", "Comment"];
const timestampFields = ["Take action by"];

function getCellElement(field, entity) {
  if (field === 'Edit') {
    a = document.createElement('a');
    a.appendChild(document.createTextNode(`Edit`));
    a.href = `javascript:editSingleEntity('${entity.id}')`;
    return a;
  } else if (timestampFields.includes(field)) {
    return document.createTextNode(entity.get(field).toDate());
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
  entity_table = document.getElementById(id);
  entity_table.setAttribute("style", "display:block");
}

function hideDiv(id) {
  entity_table = document.getElementById(id);
  entity_table.setAttribute("style", "display:none");
}

function editSingleEntity(id) {
  state = {'viewType': EDIT_ENTITY, 'entityId': id};
  render(state)
  history.pushState(state, null, '');
}

function renderSingleEntityEditor(id) {
  let docRef = db.collection("contacts").doc(id);
  docRef.get().then(function(doc) {
    if (doc.exists) {
        renderSingleEntityTable(doc);
    } else {
        // doc.data() will be undefined in this case
        console.log(`No document with ID ${id}`);
    }
  }).catch(function(error) {
      console.log(`Error getting document with ID ${id}:`, error);
  });
}


function renderSingleEntityTable(entity) {
  let entity_table = document.getElementById('edit_entity');
  let table = document.createElement('table');
  let tbody = document.createElement('tbody');
  entity_table.appendChild(table);
  table.appendChild(tbody);
  fields.forEach((field) => {
    if (field === 'Edit') {
      return;
    }
    let tr = document.createElement('tr');
    let th = document.createElement('th');
    th.scope = "row";
    th.appendChild(document.createTextNode(field));
    tr.appendChild(th);
    let td = document.createElement('td');
    td.appendChild(getCellElement(field, entity));
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
}

