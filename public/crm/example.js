
// Old functions from the example code
function addDocument() {
  console.log("addDocument");
  db.collection("users").add({
    first: "Ada",
    last: "Lovelace",
    born: 1815
  })
    .then(function (docRef) {
      console.log("addDocument: Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("addDocument: Error adding document: ", error);
    });
}
function setDocument() {
  console.log("setDocument");
  db.collection("cities").doc("LA").set({
    name: "Los Angeles",
    state: "CA",
    country: "USA"
  })
    .then(function () {
      console.log("setDocument: Document successfully written!");
    })
    .catch(function (error) {
      console.error("setDocument: Error writing document: ", error);
    });
}

function deleteDocument() {
  console.log("deleteDocument");
  db.collection("cities").doc("DC").delete().then(function () {
    console.log("deleteDocument: Document successfully deleted!");
  }).catch(function (error) {
    console.error("deleteDocument: Error removing document: ", error);
  });
}