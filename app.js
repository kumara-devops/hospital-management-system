
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let patients = [];
let appointments = [];

const doctors = [
  { id: 1, name: "Dr. Arun Kumar", department: "Cardiology" },
  { id: 2, name: "Dr. Priya Sharma", department: "Pediatrics" },
  { id: 3, name: "Dr. Rahul Das", department: "Orthopedics" },
  { id: 4, name: "Dr. Meena Raj", department: "General Medicine" }
];

let nextPatientId = 1;
let nextAppointmentId = 1;

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hospital Management System</title>
<style>
* { box-sizing: border-box; }
body {
  margin: 0; font-family: Arial, sans-serif;
  background: #f1f5f9; color: #1e293b;
}
header {
  background: #087f8c; color: white; padding: 22px;
  text-align: center;
}
main { max-width: 1100px; margin: 25px auto; padding: 0 16px; }
.stats { display: flex; flex-wrap: wrap; gap: 15px; }
.card {
  background: white; padding: 20px; border-radius: 10px;
  box-shadow: 0 2px 8px #0001; flex: 1; min-width: 180px;
}
section { margin-top: 22px; }
input, select, button {
  padding: 10px; margin: 5px 3px; border-radius: 5px;
  border: 1px solid #cbd5e1;
}
button { background: #087f8c; color: white; cursor: pointer; }
.delete { background: #dc2626; }
table { width: 100%; border-collapse: collapse; background: white; }
th, td { padding: 11px; border-bottom: 1px solid #e2e8f0; text-align: left; }
th { background: #e0f2f1; }
.table-wrap { overflow-x: auto; }
</style>
</head>
<body>
<header>
  <h1>🏥 Hospital Management System</h1>
  <p>Patient, Doctor and Appointment Management</p>
</header>
<main>
  <div class="stats">
    <div class="card"><h3>Total Patients</h3><h2 id="patientCount">0</h2></div>
    <div class="card"><h3>Available Doctors</h3><h2 id="doctorCount">0</h2></div>
    <div class="card"><h3>Appointments</h3><h2 id="appointmentCount">0</h2></div>
  </div>

  <section class="card">
    <h2>Register Patient</h2>
    <form id="patientForm">
      <input name="name" placeholder="Patient name" required>
      <input name="age" type="number" min="0" max="120" placeholder="Age" required>
      <select name="gender" required>
        <option value="">Select gender</option>
        <option>Male</option><option>Female</option><option>Other</option>
      </select>
      <input name="phone" type="tel" placeholder="Phone number" required>
      <button type="submit">Add Patient</button>
    </form>
  </section>

  <section class="card">
    <h2>Book Appointment</h2>
    <form id="appointmentForm">
      <select name="patientId" id="patientSelect" required>
        <option value="">Select patient</option>
      </select>
      <select name="doctorId" id="doctorSelect" required>
        <option value="">Select doctor</option>
      </select>
      <input name="date" type="date" required>
      <button type="submit">Book Appointment</button>
    </form>
  </section>

  <section>
    <h2>Registered Patients</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Action</th></tr></thead>
        <tbody id="patientTable"></tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>Doctors</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Department</th></tr></thead>
        <tbody id="doctorTable"></tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>Appointments</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th></tr></thead>
        <tbody id="appointmentTable"></tbody>
      </table>
    </div>
  </section>
</main>
<script>
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function cell(value) {
  const td = document.createElement("td");
  td.textContent = value ?? "";
  return td;
}

async function loadData() {
  const [patients, doctors, appointments] = await Promise.all([
    request("/api/patients"),
    request("/api/doctors"),
    request("/api/appointments")
  ]);

  document.getElementById("patientCount").textContent = patients.length;
  document.getElementById("doctorCount").textContent = doctors.length;
  document.getElementById("appointmentCount").textContent = appointments.length;

  const patientSelect = document.getElementById("patientSelect");
  patientSelect.replaceChildren(new Option("Select patient", ""));
  patients.forEach(p => patientSelect.add(new Option(p.name, p.id)));

  const doctorSelect = document.getElementById("doctorSelect");
  doctorSelect.replaceChildren(new Option("Select doctor", ""));
  doctors.forEach(d => doctorSelect.add(new Option(d.name + " - " + d.department, d.id)));

  const patientTable = document.getElementById("patientTable");
  patientTable.replaceChildren();
  patients.forEach(p => {
    const tr = document.createElement("tr");
    [p.id, p.name, p.age, p.gender, p.phone].forEach(v => tr.appendChild(cell(v)));
    const td = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.className = "delete";
    btn.onclick = async () => {
      if (confirm("Delete this patient and their appointments?")) {
        try {
          await request("/api/patients/" + p.id, { method: "DELETE" });
          await loadData();
        } catch (e) { alert(e.message); }
      }
    };
    td.appendChild(btn);
    tr.appendChild(td);
    patientTable.appendChild(tr);
  });

  const doctorTable = document.getElementById("doctorTable");
  doctorTable.replaceChildren();
  doctors.forEach(d => {
    const tr = document.createElement("tr");
    tr.appendChild(cell(d.name));
    tr.appendChild(cell(d.department));
    doctorTable.appendChild(tr);
  });

  const appointmentTable = document.getElementById("appointmentTable");
  appointmentTable.replaceChildren();
  appointments.forEach(a => {
    const tr = document.createElement("tr");
    [a.id, a.patientName, a.doctorName, a.date].forEach(v => tr.appendChild(cell(v)));
    appointmentTable.appendChild(tr);
  });
}

document.getElementById("patientForm").onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  data.age = Number(data.age);
  try {
    await request("/api/patients", {
      method: "POST", body: JSON.stringify(data)
    });
    event.target.reset();
    await loadData();
  } catch (e) { alert(e.message); }
};

document.getElementById("appointmentForm").onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  data.patientId = Number(data.patientId);
  data.doctorId = Number(data.doctorId);
  try {
    await request("/api/appointments", {
      method: "POST", body: JSON.stringify(data)
    });
    event.target.reset();
    await loadData();
  } catch (e) { alert(e.message); }
};

loadData().catch(e => alert(e.message));
</script>
</body>
</html>
  `);
});

app.get("/api/patients", (req, res) => res.json(patients));
app.get("/api/doctors", (req, res) => res.json(doctors));
app.get("/api/appointments", (req, res) => res.json(appointments));

app.post("/api/patients", (req, res) => {
  const { name, age, gender, phone } = req.body;
  if (!name?.trim() || !gender || !phone?.trim() ||
      age === undefined || age === "" ||
      !Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 120) {
    return res.status(400).json({ error: "Enter valid patient details." });
  }

  const patient = {
    id: nextPatientId++,
    name: name.trim(),
    age: Number(age),
    gender,
    phone: phone.trim()
  };
  patients.push(patient);
  res.status(201).json(patient);
});

app.delete("/api/patients/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = patients.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: "Patient not found." });

  patients = patients.filter(p => p.id !== id);
  appointments = appointments.filter(a => a.patientId !== id);
  res.json({ message: "Patient deleted." });
});

app.post("/api/appointments", (req, res) => {
  const { patientId, doctorId, date } = req.body;
  const patient = patients.find(p => p.id === Number(patientId));
  const doctor = doctors.find(d => d.id === Number(doctorId));

  if (!patient || !doctor || !date ||
      !/^\\d{4}-\\d{2}-\\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ error: "Choose a valid patient, doctor and date." });
  }

  const appointment = {
    id: nextAppointmentId++,
    patientId: patient.id,
    patientName: patient.name,
    doctorName: doctor.name,
    date
  };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Hospital Management System running on port " + PORT);
});
