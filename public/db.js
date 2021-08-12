let db;

//Create a new DB called Budget
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
  const db = e.target.result;
  db.createObjectStore("budgetStore", { autoIncrement: true });
  console.log("Upgrade needed")
};

request.onsuccess = function(e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(e) {
  console.log("Woops! " + e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["budgetStore"], "readwrite");
  const store = transaction.objectStore("budgetStore");
  store.add(record);
}

function checkDatabase() {
  console.log("Check DB initiated")
  
  const transaction = db.transaction(["budgetStore"], "readwrite");
  const currentStore = transaction.objectStore("budgetStore");
  const getAll = currentStore.getAll();

  //When sucessfull online again the items stored are bulk added 
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["budgetStore"], "readwrite");

        const store = transaction.objectStore("budgetStore");

      
        store.clear();
      });
    }
  };
}

// Listen for app coming back online
window.addeListener("online", checkDatabase);