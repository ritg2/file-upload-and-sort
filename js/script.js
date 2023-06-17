const input = document.getElementById("file");
const fileList = document.querySelector(".container");
const sort = document.getElementById("sort");

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const dbName = "TestDB";

let fileArray = [];

getArray();

function createDB(object) {
  const request = indexedDB.open(dbName, 1);

  request.onerror = (e) => {
    console.error(e.target.error);
  };

  request.onsuccess = () => {
    const db = request.result;

    const transaction = db.transaction("files", "readwrite");

    const store = transaction.objectStore("files");

    store.put(object);

    transaction.oncomplete = function () {
      db.close();
    };
  };
}

function getArray() {
  const request = indexedDB.open(dbName, 1);

  request.onerror = (e) => {
    console.log("carryon");
    console.error(e.target.error);
  };

  request.onupgradeneeded = () => {
    const db = request.result;

    const store = db.createObjectStore("files", { keyPath: "id" });
    store.createIndex("name", "name", { unique: false });
    store.createIndex("size", "size", { unique: false });
    store.createIndex("type", "type", { unique: false });
    store.createIndex("date", "date", { unique: false });
    store.createIndex("content", "content", { unique: false });
  };

  request.onsuccess = () => {
    const db = request.result;

    const transaction = db.transaction("files", "readwrite");

    const store = transaction.objectStore("files");

    const getFiles = store.getAll();

    getFiles.onerror = (e) => {
      console.log(e.target.error);
    };

    getFiles.onsuccess = () => {
      fileArray = getFiles.result;
      renderFiles();
    };

    transaction.oncomplete = function () {
      db.close();
    };
  };
}

function uniqueID() {
  return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
}

input.addEventListener("change", (e) => {
  let file = e.target.files[0];

  if (!file) return;

  if (file.type === "application/pdf") {
    let fileObject = {
      id: uniqueID(),
      name: file.name,
      size: file.size,
      type: file.type,
      date: Date.now(),
    };

    let reader = new FileReader();
    reader.onload = (e) => {
      let data = e.target.result;
      let fileData = new Blob([data], { type: "application/pdf" });

      fileObject.content = fileData;

      input.value = "";

      createDB(fileObject);
      getArray();
    };

    reader.readAsArrayBuffer(file);
  }
});

function renderFiles() {
  sortFiles();
  if (!fileArray.length) {
    fileList.textContent = "No files uploaded";
    return;
  }
  let x = "";
  fileArray.forEach((file, index) => {
    x += `
    <div>             
       <span class = "text">
       <img src="pngwing.com.png"/>
        <p 
        onclick="viewFile(${index})" 
        class= "p"
        >
          ${file.name}
        </p>
       </span>
       <span class = "size">
          ${(file.size / 1000000).toFixed(2) + "mb"}
       </span>
       <button onclick="deleteFile(${
         file.id
       })"><span class="remove">REMOVE</span><span class="x">×</span></button>                   
    </div>`;
  });

  fileList.innerHTML = x;
}

function viewFile(index) {
  let fileUrl = URL.createObjectURL(fileArray[index].content);
  window.open(fileUrl, "_blank");
}

function deleteFile(id) {
  const request = indexedDB.open(dbName, 1);

  request.onerror = (e) => {
    console.error(e.target.error);
  };

  request.onsuccess = () => {
    const db = request.result;

    const transaction = db.transaction("files", "readwrite");

    const store = transaction.objectStore("files");

    const deleteFile = store.delete(id);

    deleteFile.oncomplete = () => {
      console.log("removed");
    };

    transaction.oncomplete = function () {
      db.close();
    };
  };
  getArray();
}

sort.addEventListener("change", renderFiles);

function sortFiles() {
  switch (sort.value) {
    case "A-Z":
      fileArray.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
      });
      break;
    case "Z-A":
      fileArray.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return 1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return -1;
        return 0;
      });
      break;
    case "Size":
      fileArray.sort((a, b) => {
        if (a.size < b.size) return -1;
        if (a.size > b.size) return 1;
        return 0;
      });
      break;
    case "Newest":
      fileArray.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
      });
    default:
      fileArray.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });
  }
}
