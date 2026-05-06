const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const MS_PER_DAY = 86400000;

const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const phaseAnchors = [
  { name: "新月", point: 0, description: "月亮接近太阳方向，夜空中几乎不可见，适合重新规划和开始。" },
  { name: "蛾眉月", point: 0.125, description: "细弯月开始出现，亮面逐渐增长，傍晚西方天空更容易看到。" },
  { name: "上弦月", point: 0.25, description: "月面约一半被照亮，通常在正午升起、午夜落下。" },
  { name: "盈凸月", point: 0.375, description: "亮面超过一半并继续增长，夜晚能见时间明显变长。" },
  { name: "满月", point: 0.5, description: "月面几乎完全被照亮，从日落到日出都很醒目。" },
  { name: "亏凸月", point: 0.625, description: "满月后亮面开始减少，夜深后仍然明亮。" },
  { name: "下弦月", point: 0.75, description: "月面再次约一半被照亮，清晨前后最容易观察。" },
  { name: "残月", point: 0.875, description: "黎明前的细弯月，逐渐接近下一次新月。" },
];

const majorPhases = new Set(["新月", "上弦月", "满月", "下弦月"]);
let moonId = 0;

const state = {
  viewDate: new Date(),
  selectedDate: new Date(),
};

const elements = {
  calendarGrid: document.querySelector("#calendarGrid"),
  monthTitle: document.querySelector("#monthTitle"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  todayButton: document.querySelector("#todayButton"),
  monthPicker: document.querySelector("#monthPicker"),
  yearPicker: document.querySelector("#yearPicker"),
  featureMoon: document.querySelector("#featureMoon"),
  featurePhase: document.querySelector("#featurePhase"),
  featureDate: document.querySelector("#featureDate"),
  detailMoon: document.querySelector("#detailMoon"),
  selectedDate: document.querySelector("#selectedDate"),
  selectedPhase: document.querySelector("#selectedPhase"),
  selectedDescription: document.querySelector("#selectedDescription"),
  moonAge: document.querySelector("#moonAge"),
  illumination: document.querySelector("#illumination"),
  daysToNewMoon: document.querySelector("#daysToNewMoon"),
  eventList: document.querySelector("#eventList"),
  eventCount: document.querySelector("#eventCount"),
};

function toNoon(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function moonData(date) {
  const localNoon = toNoon(date);
  const daysSinceKnownNewMoon = (localNoon.getTime() - KNOWN_NEW_MOON) / MS_PER_DAY;
  const cycles = daysSinceKnownNewMoon / SYNODIC_MONTH;
  const fraction = ((cycles % 1) + 1) % 1;
  const age = fraction * SYNODIC_MONTH;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const phase = nearestPhase(fraction);
  const daysToNextNewMoon = SYNODIC_MONTH - age;

  return {
    age,
    fraction,
    illumination,
    phase,
    daysToNextNewMoon: daysToNextNewMoon > 29.45 ? 0 : daysToNextNewMoon,
  };
}

function nearestPhase(fraction) {
  const index = Math.round(fraction * 8) % 8;
  return phaseAnchors[index];
}

function illuminatedPolygon(fraction, lightId) {
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  if (illumination < 0.015) return "";
  if (illumination > 0.985) {
    return `<circle cx="50" cy="50" r="46" fill="url(#${lightId})" />`;
  }

  const waxing = fraction < 0.5;
  const phaseForWidth = waxing ? fraction : 1 - fraction;
  const terminatorScale = Math.cos(2 * Math.PI * phaseForWidth);
  const points = [];
  const steps = 72;

  for (let index = 0; index <= steps; index += 1) {
    const y = -1 + (2 * index) / steps;
    const limb = Math.sqrt(Math.max(0, 1 - y * y));
    const x = waxing ? limb : -limb;
    points.push(`${50 + x * 46},${50 + y * 46}`);
  }

  for (let index = steps; index >= 0; index -= 1) {
    const y = -1 + (2 * index) / steps;
    const limb = Math.sqrt(Math.max(0, 1 - y * y));
    const x = waxing ? terminatorScale * limb : -terminatorScale * limb;
    points.push(`${50 + x * 46},${50 + y * 46}`);
  }

  return `<polygon points="${points.join(" ")}" fill="url(#${lightId})" />`;
}

function moonSvg(fraction, label) {
  moonId += 1;
  const lightId = `moonLight${moonId}`;
  const darkId = `moonDark${moonId}`;
  const clipId = `moonClip${moonId}`;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const darkOpacity = illumination < 0.03 ? 1 : 0.28;
  const outlineOpacity = illumination < 0.03 ? 0.28 : 0.1;
  const lightShape = illuminatedPolygon(fraction, lightId);

  return `
    <svg class="moon-svg" viewBox="0 0 100 100" role="img" aria-label="${label}">
      <defs>
        <radialGradient id="${lightId}" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#fff9e8" />
          <stop offset="46%" stop-color="#f1dfaf" />
          <stop offset="100%" stop-color="#b9a16d" />
        </radialGradient>
        <radialGradient id="${darkId}" cx="35%" cy="28%" r="78%">
          <stop offset="0%" stop-color="#31394a" />
          <stop offset="100%" stop-color="#111620" />
        </radialGradient>
        <clipPath id="${clipId}">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#${darkId})" opacity="${darkOpacity}" />
      <g clip-path="url(#${clipId})">
        ${lightShape}
        <circle cx="34" cy="32" r="3.2" fill="#fff8df" opacity=".12" />
        <circle cx="62" cy="58" r="2.8" fill="#4a351a" opacity=".12" />
        <circle cx="46" cy="70" r="2.1" fill="#4a351a" opacity=".1" />
      </g>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" opacity="${outlineOpacity}" stroke-width="1.5" />
    </svg>
  `;
}

function applyMoonStyle(node, fraction, label = "月相") {
  node.innerHTML = moonSvg(fraction, label);
}

function formatDate(date, includeWeekday = true) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: includeWeekday ? "long" : undefined,
  });
  return formatter.format(date);
}

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function renderMonthPicker() {
  elements.monthPicker.innerHTML = monthNames
    .map((name, index) => `<option value="${index}">${name}</option>`)
    .join("");
}

function renderCalendar() {
  const year = state.viewDate.getFullYear();
  const month = state.viewDate.getMonth();
  const today = new Date();
  const days = monthMatrix(year, month);

  elements.monthTitle.textContent = `${year}年 ${monthNames[month]}`;
  elements.monthPicker.value = String(month);
  elements.yearPicker.value = String(year);

  elements.calendarGrid.innerHTML = "";
  days.forEach((date) => {
    const data = moonData(date);
    const button = document.createElement("button");
    button.className = "day-cell";
    button.type = "button";
    button.setAttribute("aria-label", `${formatDate(date)}，${data.phase.name}`);

    if (date.getMonth() !== month) button.classList.add("is-muted");
    if (sameDay(date, today)) button.classList.add("is-today");
    if (sameDay(date, state.selectedDate)) button.classList.add("is-selected");

    const moon = document.createElement("span");
    moon.className = "calendar-moon";
    applyMoonStyle(moon, data.fraction, data.phase.name);

    const badge = majorPhases.has(data.phase.name)
      ? `<span class="major-badge">${data.phase.name}</span>`
      : "";

    button.innerHTML = `
      <span class="day-top">
        <span>${date.getDate()}</span>
        ${badge}
      </span>
      <span></span>
      <span class="day-note">
        <span class="phase-name">${data.phase.name}</span>
        <span class="phase-meta">${Math.round(data.illumination * 100)}% 亮</span>
      </span>
    `;
    button.children[1].replaceWith(moon);

    button.addEventListener("click", () => {
      state.selectedDate = new Date(date);
      render();
    });

    elements.calendarGrid.append(button);
  });
}

function renderDetails() {
  const data = moonData(state.selectedDate);
  applyMoonStyle(elements.detailMoon, data.fraction, data.phase.name);

  elements.selectedDate.textContent = formatDate(state.selectedDate);
  elements.selectedPhase.textContent = data.phase.name;
  elements.selectedDescription.textContent = data.phase.description;
  elements.moonAge.textContent = `${data.age.toFixed(1)} 天`;
  elements.illumination.textContent = `${Math.round(data.illumination * 100)}%`;
  elements.daysToNewMoon.textContent = `${data.daysToNextNewMoon.toFixed(1)} 天`;
}

function renderFeature() {
  const today = new Date();
  const data = moonData(today);
  applyMoonStyle(elements.featureMoon, data.fraction, data.phase.name);
  elements.featurePhase.textContent = data.phase.name;
  elements.featureDate.textContent = formatDate(today, false);
}

function renderEvents() {
  const year = state.viewDate.getFullYear();
  const month = state.viewDate.getMonth();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const events = [];

  for (let day = 1; day <= dayCount; day += 1) {
    const date = new Date(year, month, day);
    const data = moonData(date);
    if (majorPhases.has(data.phase.name)) {
      const previous = day > 1 ? moonData(new Date(year, month, day - 1)).phase.name : "";
      if (previous !== data.phase.name) {
        events.push({ date, name: data.phase.name });
      }
    }
  }

  elements.eventCount.textContent = `${events.length} 个节点`;
  elements.eventList.innerHTML = events
    .map(
      (event) => `
        <li>
          <strong>${event.name}</strong>
          <span>${event.date.getMonth() + 1}月${event.date.getDate()}日</span>
        </li>
      `,
    )
    .join("");
}

function render() {
  renderCalendar();
  renderDetails();
  renderFeature();
  renderEvents();
}

function shiftMonth(delta) {
  state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + delta, 1);
  render();
}

function goToday() {
  const today = new Date();
  state.viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  state.selectedDate = today;
  render();
}

elements.prevMonth.addEventListener("click", () => shiftMonth(-1));
elements.nextMonth.addEventListener("click", () => shiftMonth(1));
elements.todayButton.addEventListener("click", goToday);
elements.monthPicker.addEventListener("change", (event) => {
  state.viewDate = new Date(state.viewDate.getFullYear(), Number(event.target.value), 1);
  render();
});
elements.yearPicker.addEventListener("change", (event) => {
  const nextYear = Math.min(2100, Math.max(1900, Number(event.target.value) || new Date().getFullYear()));
  state.viewDate = new Date(nextYear, state.viewDate.getMonth(), 1);
  render();
});

renderMonthPicker();
goToday();
