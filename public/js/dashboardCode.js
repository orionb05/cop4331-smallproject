document.addEventListener("DOMContentLoaded", function () {
//

  if(!localStorage.getItem("userId")){
    window.location.href = "index.html";
  }

  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", function() {

    // Clear stored login info
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");

    // Redirect to login page
    window.location.href = "index.html";

  });
 // 
  
  let contacts = [];

  let selected = null;
  let isNew = false;
  let newest = true;

  // Explicitly grab ALL elements
  const list = document.getElementById("list");
  const editor = document.getElementById("editor");
  const searchInput = document.getElementById("search");

  
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  const addBtn = document.getElementById("addBtn");
  const saveBtn = document.getElementById("saveBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");
  const sortBtn = document.getElementById("sortBtn");

  //
  function loadContacts() {
    const userId = localStorage.getItem("userId");

    fetch("../LAMPAPI/GetContacts.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {

      if(data.results)
      {
        contacts = data.results.map(c => ({
          id: c.ID,
          name: c.FirstName + " " + c.LastName,
          email: c.Email,
          phone: c.Phone,
          date: c.ID,
          favorite: c.Favorite === 1 || c.Favorite === "1"
        }));
      }
      else
      {
        contacts = [];
      }

    render();
  })
  .catch(error => {
    console.error("Error loading contacts:", error);
  });
}
  //
  
  function render() {
    list.innerHTML = "";

    let filtered = contacts.filter(c =>
      c.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    filtered.sort((a,b)=> newest ? b.date - a.date : a.date - b.date);

    filtered.forEach(c => {
      const div = document.createElement("div");
      div.className = "contact" + (c === selected ? " active" : "");
      
      const infoDiv = document.createElement("div");
      infoDiv.className = "contact-info";
      infoDiv.innerHTML = `<strong>${c.name}</strong><br>${c.email || ""}`;
      infoDiv.onclick = () => selectContact(c);
      
      const favBtn = document.createElement("button");
      favBtn.className = "favorite-btn";
      favBtn.textContent = c.favorite ? "★" : "☆";
      favBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(c);
      };
      
      div.appendChild(infoDiv);
      div.appendChild(favBtn);
      list.appendChild(div);
    });
  }

  function toggleFavorite(c) {
    const endpoint = c.favorite ? "../LAMPAPI/RemoveFavorite.php" : "../LAMPAPI/AddFavorite.php";
    
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contactId: c.id
      })
    })
    .then(response => response.json())
    .then(data => {
      if(data.status === "success") {
        c.favorite = !c.favorite;
        render();
      } else {
        alert("Error updating favorite status");
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
  }

  function selectContact(c) {
    selected = c;
    isNew = false;
    editor.classList.remove("hidden");
    nameInput.value = c.name || "";
    emailInput.value = c.email || "";
    phoneInput.value = c.phone || "";
    favoriteBtn.textContent = c.favorite ? "★ Favorite" : "Favorite";
    render();
  }

  addBtn.addEventListener("click", function() {
    isNew = true;
    selected = null;
    editor.classList.remove("hidden");
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
  });

  saveBtn.addEventListener("click", function() {
    const contactName = nameInput.value.trim();
    if (!contactName) {
      alert("Name is required");
      return;
    }

    if (isNew) {

  const userId = localStorage.getItem("userId");

  // Split full name into first and last
  const nameParts = contactName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  fetch("../LAMPAPI/AddContact.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      FirstName: firstName,
      LastName: lastName,
      Phone: phoneInput.value.trim(),
      Email: emailInput.value.trim(),
      UserID: userId
    })
  })
  .then(response => response.json())
  .then(data => {

    if(data.status === "success")
    {
      isNew = false;
      editor.classList.add("hidden");
      loadContacts();  // reload from database
    }
    else
    {
      alert("Error adding contact");
    }

  })
  .catch(error => {
    console.error("Error:", error);
  });

}
    else if (selected) {
      const nameParts = contactName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      fetch("../LAMPAPI/UpdateContacts.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newFirstName: firstName,
          newLastName: lastName,
          newPhoneNum: phoneInput.value.trim(),
          newEmail: emailInput.value.trim(),
          id: selected.id
        })
      })
      .then(response => response.json())
      .then(data => {

        if(data.error === "")
        {
          // Update UI instantly
          selected.name = contactName;
          selected.email = emailInput.value.trim();
          selected.phone = phoneInput.value.trim();

          render();
          }
        else
        {
          alert("Error updating contact");
        }

      })
      .catch(error => {
        console.error("Update error:", error);
      });
    }

    
  });

  deleteBtn.addEventListener("click", function() {

    if (!selected) return;

      fetch("../LAMPAPI/DeleteContact.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ID: selected.id
        })
      })
      .then(response => response.json())
      .then(data => {

        if(data.status === "success")
        {
          selected = null;
          editor.classList.add("hidden");

          loadContacts();  // Reload contacts from database
        }
        else
        {
          alert("Error deleting contact");
        }

      })
      .catch(error => {
        console.error("Delete error:", error);
      });

  });

  favoriteBtn.addEventListener("click", function() {
    if (!selected) return;
    toggleFavorite(selected);
  });

  sortBtn.addEventListener("click", function() {
    newest = !newest;
    sortBtn.textContent = newest ? "Newest ?" : "Oldest ?";
    render();
  });

  searchInput.addEventListener("input", render);

  loadContacts();

});