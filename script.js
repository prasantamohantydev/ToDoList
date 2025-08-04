function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  let diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function formatShort(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
}
function formatISO(date) {
  return date.toISOString().split('T')[0];
}
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  const yearStart = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}
let tasksByDate = {
  "2025-08-04": [
    { text: "Design session", done: false, time: "09:00" },
    { text: "Develop meet", done: false, time: "17:30" }
  ]
};
let currentDate = new Date();
let selectedDate = formatISO(currentDate);
function renderCalendar() {
  const calDays = document.getElementById('calendar-days');
  let monday = startOfWeek(new Date(selectedDate));
  let daysHtml = '';
  for(let i=0;i<7;i++) {
    const d = addDays(monday, i);
    const dISO = formatISO(d);
    let isToday = dISO === formatISO(new Date());
    let isSelected = dISO === selectedDate;
    let classes = ['day'];
    if(isSelected) classes.push('selected');
    if(isToday) classes.push('today');
    daysHtml += `<button class="${classes.join(' ')}" data-date="${dISO}">${d.getDate()}<br>${d.toLocaleDateString(undefined,{weekday:'short'})}</button>`;
  }
  calDays.innerHTML = daysHtml;
  const label = document.getElementById('calendar-month-label');
  const week = document.getElementById('calendar-week-label');
  const anyDay = addDays(monday, 3);
  label.textContent = anyDay.toLocaleDateString(undefined, {month:'long', year:'numeric'});
  week.textContent = `W${getWeekNumber(anyDay)}`;
  Array.from(calDays.children).forEach(btn => {
    btn.onclick = () => {
      selectedDate = btn.getAttribute('data-date');
      renderCalendar();
      renderTasksForDay();
    };
  });
}
function renderTasksForDay() {
  const label = document.getElementById('main-date-label');
  const dateObj = new Date(selectedDate);
  label.textContent = formatShort(dateObj);
  const ul = document.getElementById('todo-on-date');
  ul.innerHTML = '';
  let tasks = tasksByDate[selectedDate] || [];
  if(tasks.length === 0) {
    ul.innerHTML = '<li style="opacity:0.9; color:#999;">No tasks for this day.</li>';
    return;
  }
  tasks = tasks.slice().sort((a,b)=>{
    if(!a.time && !b.time) return 0;
    if(!a.time) return 1;
    if(!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = task.done ? 'completed' : '';
    li.innerHTML = `
      <input type='checkbox' ${task.done ? 'checked' : ''} data-idx="${idx}" />
      <span>${task.time ? `<strong>[${task.time}]</strong> ` : ''}${task.text}</span>
      <button class='delete-btn' data-idx="${idx}" title="Delete">&#10060;</button>
    `;
    li.querySelector('input[type="checkbox"]').onchange = function(){
      tasksByDate[selectedDate][idx].done = !tasksByDate[selectedDate][idx].done;
      renderTasksForDay();
    };
    li.querySelector('.delete-btn').onclick = function(){
      tasksByDate[selectedDate].splice(idx,1);
      if(tasksByDate[selectedDate].length === 0) delete tasksByDate[selectedDate];
      renderTasksForDay();
    };
    ul.appendChild(li);
  });
}
const addTaskBtn = document.getElementById('add-task-btn');
const modal = document.getElementById('add-task-modal');
const closeModal = document.getElementById('close-modal');
const form = document.getElementById('task-form');
addTaskBtn.onclick = () => {
  modal.classList.remove('hidden');
  form.reset();
  document.getElementById('task-title').focus();
};
closeModal.onclick = () => { modal.classList.add('hidden'); };
form.onsubmit = function(e){
  e.preventDefault();
  const text = document.getElementById('task-title').value.trim();
  const time = document.getElementById('task-time').value;
  if(!text) return;
  if(!tasksByDate[selectedDate]) tasksByDate[selectedDate] = [];
  tasksByDate[selectedDate].push({ text, done: false, time });
  renderTasksForDay();
  modal.classList.add('hidden');
};
document.getElementById('today-btn').onclick = function() {
  selectedDate = formatISO(new Date());
  renderCalendar();
  renderTasksForDay();
};
document.getElementById('prev-week-btn').onclick = function() {
  const d = new Date(selectedDate);
  d.setDate(d.getDate()-7);
  selectedDate = formatISO(d);
  renderCalendar();
  renderTasksForDay();
};
document.getElementById('next-week-btn').onclick = function() {
  const d = new Date(selectedDate);
  d.setDate(d.getDate()+7);
  selectedDate = formatISO(d);
  renderCalendar();
  renderTasksForDay();
};
selectedDate = formatISO(new Date());
renderCalendar();
renderTasksForDay();
