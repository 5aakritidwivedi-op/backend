const defaultApi = window.location.origin;
let apiBase = localStorage.getItem("cadence-api-url") || defaultApi;
let events = [];
let selectedEvent = null;
let activeStatus = "";

const $ = (selector) => document.querySelector(selector);
const normaliseUrl = (url) => url.trim().replace(/\/$/, "");

function setConnection(text, state) {
  const node = $("#connection-status");
  node.className = `connection ${state || ""}`;
  node.innerHTML = `<span></span>${text}`;
}

function renderEvents() {
  const query = $("#search").value.trim().toLowerCase();
  const filtered = events.filter((event) => {
    const matchesSearch = !query || `${event.title} ${event.status}`.toLowerCase().includes(query);
    return matchesSearch && (!activeStatus || event.status?.toLowerCase() === activeStatus);
  });
  const grid = $("#events-grid");
  grid.replaceChildren();
  $("#empty-state").hidden = filtered.length !== 0;
  const template = $("#event-card");
  filtered.forEach((event) => {
    const card = template.content.cloneNode(true);
    card.querySelector(".status-badge").textContent = event.status || "available";
    card.querySelector(".capacity").textContent = event.capacity == null ? "Open capacity" : `${event.capacity} places`;
    card.querySelector("h3").textContent = event.title || "Untitled event";
    card.querySelector(".event-id").textContent = `Event ID: ${event.id}`;
    card.querySelector(".availability").textContent = event.capacity == null ? "Registration availability unknown" : `${event.capacity} total places`;
    card.querySelector(".register").addEventListener("click", () => openRegistration(event));
    grid.append(card);
  });
}

async function loadEvents() {
  setConnection("Loading events…");
  try {
    const response = await fetch(`${apiBase}/api/events`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not load events");
    events = Array.isArray(body.data) ? body.data : [];
    $("#event-count").textContent = events.length;
    setConnection(`Connected · ${events.length} events`, "online");
    renderEvents();
  } catch (error) {
    events = [];
    setConnection("API unavailable", "error");
    renderEvents();
  }
}

function openRegistration(event) {
  selectedEvent = event;
  $("#dialog-title").textContent = `Register for ${event.title}`;
  $("#dialog-copy").textContent = "Enter the UUID for the account you use with Cadence.";
  $("#form-message").textContent = "";
  $("#register-dialog").showModal();
}

$("#register-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const userId = $("#user-id").value.trim();
  const message = $("#form-message");
  const submit = $("#submit-registration");
  submit.disabled = true;
  message.textContent = "Saving your registration…";
  try {
    const response = await fetch(`${apiBase}/api/registrations`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({user_id: userId, event_id: selectedEvent.id})});
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Registration could not be completed");
    message.style.color = "#278343";
    message.textContent = "You’re registered. Your place has been saved.";
    setTimeout(() => $("#register-dialog").close(), 1200);
  } catch (error) {
    message.style.color = "#ba1a1a";
    message.textContent = error.message;
  } finally { submit.disabled = false; }
});

$("#search").addEventListener("input", renderEvents);
$("#refresh").addEventListener("click", loadEvents);
$("#filters").addEventListener("click", (event) => { const button = event.target.closest("button"); if (!button) return; activeStatus = button.dataset.status; document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === button)); renderEvents(); });
$("#api-settings").addEventListener("click", () => { $("#api-url").value = apiBase === defaultApi ? "" : apiBase; $("#settings-dialog").showModal(); });
$("#settings-form").addEventListener("submit", (event) => { event.preventDefault(); apiBase = normaliseUrl($("#api-url").value) || defaultApi; localStorage.setItem("cadence-api-url", apiBase); $("#settings-dialog").close(); loadEvents(); });
loadEvents();
