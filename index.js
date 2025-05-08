// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2504-FTB-EB-WEB-FT"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];
let formInput = {
  name: "",
  description: "",
  date: "",
  location: "",
};

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

async function createParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-type": "application/json; charset=UTF-8" },
      body: JSON.stringify(party),
    });
    const result = await response.json();
    // console.log(result);
    // console.log(result.success);
    // if (result.success == true) {
    //   console.log("Submitted Successfully!");
    // } else {
    //   console.log("Houston, we have a problem...");
    // }
    getParties();
  } catch (e) {
    console.error(e);
  }
}

async function removeParty(partyId) {
  try {
    await fetch(API + "/events" + "/" + partyId, {
      method: "DELETE",
    });
    selectedParty = undefined;
    await getParties();
  } catch (error) {
    
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button>Delete Party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  const $delete = $party.querySelector("button");
  $delete.addEventListener("click", () => {
    // console.log(selectedParty.id);
    removeParty(selectedParty.id);    
  });

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function NewPartyForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <label> Name
      <input type="text" name="name" placeholder="name" required />
    </label>
    <label> Description
      <input type="text" name="description" placeholder="description" required />
    </label>
    <label> Date
      <input type="date" name="date" placeholder="date" required />
    </label>
    <label> Location
      <input type="text" name="location" placeholder="location" required />
    </label>
    <button>Add party</button>
  `;

  $form.addEventListener("submit", async function (e) {
    e.preventDefault();
    // console.log(formInput);
    const data = new FormData($form);
    createParty({
      name: data.get("name"),
      description: data.get("description"),
      date: new Date(data.get("date")).toISOString(),
      location: data.get("location"),
    });
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section>
        <h3>Add a new party</h3>
        <NewPartyForm></NewPartyForm>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
