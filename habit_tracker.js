// --- Default Habits Configuration with Icons
  const defaultHabits = [
    { key: "spiritual", label: "Spiritual", name: "Meditation", icon: "🧘‍♀️" },
    { key: "mental",    label: "Mental",    name: "Read",       icon: "📖" },
    { key: "physical",  label: "Physical",  name: "Exercise",   icon: "🤸‍♀️" },
    { key: "emotional", label: "Emotional", name: "Journaling", icon: "✍️" },
    { key: "economic",  label: "Economic",  name: "Save Money", icon: "💰" },
    { key: "general",   label: "General",   name: "Tidy Up",    icon: "🧹" }
  ];

  const getStorageKey = (dateStr) => `habit_tracker_v2_${dateStr}`;
  const todayISO = () => new Date().toISOString().slice(0, 10);

  let currentDate = todayISO();
  let state = {};

  // --- DOM References
  const dateInput = document.getElementById("dateInput");
  const dayInput = document.getElementById("dayInput");
  const tableBody = document.getElementById("habitTableBody");
  const totalScoreSpan = document.getElementById("totalScore");
  const maxScoreSpan = document.getElementById("maxScore");
  const progressBar = document.getElementById("progressBar");
  const thankfulInput = document.getElementById("thankfulInput");
  const proudInput = document.getElementById("proudInput");
  const evalBtns = document.querySelectorAll(".eval-btn");
  const themeToggle = document.getElementById("checkbox");

  function renderTable() {
    tableBody.innerHTML = '';
    const maxScore = state.habits.length;
    maxScoreSpan.textContent = maxScore;

    state.habits.forEach((score, idx) => {
      const habit = defaultHabits[idx];
      const row = tableBody.insertRow(-1);
      row.style.animation = `rowFadeIn 0.5s ease-out ${idx * 0.05}s forwards`;
      row.style.opacity = 0;

      // Icon + Label cell
      const labelTd = row.insertCell();
      labelTd.innerHTML = `<span class="habit-icon">${habit.icon}</span> ${habit.label}`;
      labelTd.style.textAlign = 'left';
      labelTd.style.fontWeight = '500';

      // Editable name field
      const nameTd = row.insertCell();
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "habit-name-input";
      nameInput.value = state.names[idx] || habit.name;
      nameInput.addEventListener('change', () => {
        state.names[idx] = nameInput.value;
        saveState();
      });
      nameTd.appendChild(nameInput);

      // +1 Button
      const plusTd = row.insertCell();
      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+1";
      plusBtn.className = "plus-btn";
      plusBtn.addEventListener('click', () => {
        state.habits[idx]++;
        const scoreTd = document.getElementById(`score-${habit.key}`);
        scoreTd.textContent = state.habits[idx];
        scoreTd.classList.add('score-pop');
        setTimeout(() => scoreTd.classList.remove('score-pop'), 400);

        updateTotalAndProgress();
        saveState();
      });
      plusTd.appendChild(plusBtn);

      // Score cell
      const scoreTd = row.insertCell();
      scoreTd.id = `score-${habit.key}`;
      scoreTd.textContent = score;
    });
    updateTotalAndProgress();
  }

  function updateTotalAndProgress() {
    const total = state.habits.reduce((a, b) => a + b, 0);
    const maxScore = state.habits.length;
    const oldTotal = parseInt(totalScoreSpan.textContent);
    
    totalScoreSpan.textContent = total;
    if (total !== oldTotal) {
      totalScoreSpan.classList.add('score-pop');
      setTimeout(() => totalScoreSpan.classList.remove('score-pop'), 400);
    }

    // Update progress bar
    const percentage = maxScore > 0 ? (total / maxScore) * 100 : 0;
    progressBar.style.width = `${percentage}%`;

    // Confetti celebration!
    if (total >= maxScore && oldTotal < maxScore) {
      celebrate();
    }
  }

  function celebrate() {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });
  }

  function saveState() {
    localStorage.setItem(getStorageKey(currentDate), JSON.stringify(state));
  }

  function loadState(dateStr) {
    const saved = localStorage.getItem(getStorageKey(dateStr));
    if (saved) return JSON.parse(saved);
    return {
      habits: Array(defaultHabits.length).fill(0),
      eval: null,
      thankful: "",
      proud: "",
      names: defaultHabits.map(h => h.name)
    };
  }

  function syncUI() {
    dateInput.value = currentDate;
    const day = new Date(currentDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long' });
    dayInput.value = day;
    
    state = loadState(currentDate);
    
    thankfulInput.value = state.thankful || "";
    proudInput.value = state.proud || "";
    
    highlightEval();
    renderTable();
  }

  function highlightEval() {
    evalBtns.forEach(btn => {
      btn.classList.toggle("selected", Number(btn.dataset.value) === state.eval);
    });
  }
  
  // --- Theme Toggle Logic ---
  function applyTheme(theme) {
      if (theme === 'dark') {
          document.body.classList.add('dark-theme');
          themeToggle.checked = true;
      } else {
          document.body.classList.remove('dark-theme');
          themeToggle.checked = false;
      }
  }

  themeToggle.addEventListener('change', () => {
      const theme = themeToggle.checked ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      applyTheme(theme);
  });

  // --- Event Listeners ---
  dateInput.addEventListener("change", () => {
    currentDate = dateInput.value;
    syncUI();
  });

  thankfulInput.addEventListener("input", () => { state.thankful = thankfulInput.value; saveState(); });
  proudInput.addEventListener("input", () => { state.proud = proudInput.value; saveState(); });
  evalBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.eval = Number(btn.dataset.value);
      highlightEval();
      saveState();
    });
  });

  // --- Initialization on Load ---
  function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    syncUI();
  }

  window.onload = init;