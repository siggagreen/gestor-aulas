const db = firebase.firestore();
const auth = firebase.auth();

function logout() {
  auth.signOut().then(() => location.reload());
}

auth.onAuthStateChanged(user => {
  if (!user) {
    const email = prompt("Correo:");
    const password = prompt("Contraseña:");
    auth.signInWithEmailAndPassword(email, password).catch(alert);
  } else {
    initCalendar();
  }
});

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    allDaySlot: false,
    editable: true,
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    events: async function(fetchInfo, successCallback) {
      const snapshot = await db.collection("reservas").get();
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      successCallback(events);
    },
    select: function(info) {
      const title = prompt("¿Qué espacio reservas? (Ej. Aula 1, Sala Juntas 2)");
      if (title) {
        db.collection("reservas").add({
          title,
          start: info.startStr,
          end: info.endStr,
          user: auth.currentUser.email
        }).then(() => calendar.refetchEvents());
      }
    },
    eventClick: function(info) {
      if (confirm("¿Eliminar esta reserva?")) {
        db.collection("reservas").doc(info.event.id).delete()
          .then(() => info.event.remove());
      }
    }
  });
  calendar.render();
}