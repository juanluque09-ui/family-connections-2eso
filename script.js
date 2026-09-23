const quizData = {
  familyWords: [
    { q: "Your mother’s or father’s sister is your …", options: ["aunt", "niece", "cousin"], answer: 0, explain: "An aunt is the sister of one of your parents." },
    { q: "Your brother’s daughter is your …", options: ["cousin", "niece", "granddaughter"], answer: 1, explain: "A niece is the daughter of your brother or sister." },
    { q: "The children of two sisters are …", options: ["siblings", "twins", "cousins"], answer: 2, explain: "Cousins are the children of aunts or uncles." },
    { q: "Two children with the same parents are …", options: ["siblings", "nephews", "grandparents"], answer: 0, explain: "Siblings means brothers and/or sisters." },
    { q: "Your father’s new wife is your …", options: ["mother-in-law", "stepmother", "sister-in-law"], answer: 1, explain: "A stepparent is married to your parent but is not your biological parent." }
  ],
  connections: [
    { q: "Nora is the daughter of Sam. Which sentence is correct?", options: ["Nora is Sam daughter.", "Nora is Sam’s daughter.", "Nora’s is Sam daughter."], answer: 1, explain: "Put ’s after the person: Sam’s daughter." },
    { q: "Ben and Amy have one grandfather. Complete: ‘Mr Lee is ___ grandfather.’", options: ["their", "his", "her"], answer: 0, explain: "Their refers to two or more people: Ben and Amy." },
    { q: "Mia has a brother called Jack. Which sentence has the same meaning?", options: ["Jack is Mia’s brother.", "Mia is Jack brother.", "Jack’s Mia is brother."], answer: 0, explain: "Mia’s brother means the brother of Mia." },
    { q: "The parents of my mother are my …", options: ["mother’s parents", "mothers’ parent", "mother parents’"], answer: 0, explain: "One mother → mother’s. The apostrophe comes before s." },
    { q: "Lily and Max have the same parents. Complete: ‘Lily is Max’s ___.’", options: ["cousin", "aunt", "sister"], answer: 2, explain: "Children with the same parents are siblings; Lily is Max’s sister." }
  ],
  tree: [
    { q: "Who is Maya’s uncle?", options: ["Tom", "David", "Robert"], answer: 1, explain: "David is Anna’s brother, so he is Maya’s uncle." },
    { q: "How is Noah related to Leo?", options: ["He is his cousin.", "He is his nephew.", "He is his brother."], answer: 0, explain: "Their parents, Anna and David, are siblings. That makes Noah and Leo cousins." },
    { q: "Who are Helen’s grandchildren?", options: ["Anna and David", "Leo, Maya and Noah", "Tom and Sara"], answer: 1, explain: "Leo, Maya and Noah are the children of Helen’s children." },
    { q: "Complete: ‘Sara is Leo’s ___.’", options: ["aunt", "sister-in-law", "grandmother"], answer: 0, explain: "Sara is married to Leo’s uncle David, so she is Leo’s aunt." },
    { q: "Which statement is true?", options: ["Tom is Noah’s father.", "Maya is Anna’s niece.", "Robert is David’s father."], answer: 2, explain: "The tree shows Robert and Helen as David’s parents." }
  ],
  detective: [
    { q: "Who is Clara’s brother?", options: ["Hugo", "Lucas", "Jorge"], answer: 1, explain: "Lucas says Clara is his sister, so Lucas is Clara’s brother." },
    { q: "How is Jorge related to Lucas?", options: ["He is his uncle.", "He is his cousin.", "He is his grandfather."], answer: 0, explain: "Jorge is Eva’s brother. Eva is Lucas’s mother, so Jorge is Lucas’s uncle." },
    { q: "Sofía is Clara’s …", options: ["niece", "cousin", "aunt"], answer: 1, explain: "Their parents, Eva and Jorge, are siblings, so Sofía and Clara are cousins." },
    { q: "Who is Hugo’s aunt?", options: ["Eva", "Pilar", "Clara"], answer: 0, explain: "Eva is the sister of Hugo’s father, Jorge." },
    { q: "Which sentence is correct?", options: ["Pilar is Lucas grandmother.", "Pilar is Lucas’s grandmother.", "Pilar’s is Lucas grandmother."], answer: 1, explain: "Use ’s after Lucas: Lucas’s grandmother." }
  ]
};

const stageKeys = ["familyWords", "connections", "tree", "detective"];
const allQuestions = stageKeys.flatMap(key => quizData[key]);
const storageKey = "family-connections-progress-v1";
let state = loadState();

function defaultState() {
  return { activeStage: 0, unlockedStage: 0, answers: {} };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved || typeof saved !== "object") return defaultState();
    return { ...defaultState(), ...saved, activeStage: Math.min(saved.activeStage || 0, 3), unlockedStage: Math.min(saved.unlockedStage || 0, 3) };
  } catch { return defaultState(); }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function answerId(stageKey, index) { return `${stageKey}-${index}`; }

function renderQuestions() {
  document.querySelectorAll("[data-questions]").forEach(container => {
    const stageKey = container.dataset.questions;
    container.innerHTML = quizData[stageKey].map((item, index) => {
      const id = answerId(stageKey, index);
      const saved = state.answers[id];
      const resultClass = saved == null ? "" : saved === item.answer ? " is-correct" : " is-wrong";
      const buttons = item.options.map((option, optionIndex) => {
        let optionClass = "option";
        if (saved != null && optionIndex === saved) optionClass += saved === item.answer ? " is-selected-correct" : " is-selected-wrong";
        if (saved != null && saved !== item.answer && optionIndex === item.answer) optionClass += " is-answer";
        return `<button class="${optionClass}" type="button" data-stage-key="${stageKey}" data-question="${index}" data-option="${optionIndex}" ${saved != null ? "disabled" : ""}>${option}</button>`;
      }).join("");
      const feedback = saved == null ? "" : `<strong>${saved === item.answer ? "Correct!" : "Not this time."}</strong> ${item.explain}`;
      return `<article class="question-card${resultClass}" id="question-${id}">
        <div class="question-top"><span class="question-index">${index + 1}</span><div class="question-copy"><p>${item.q}</p><div class="options" role="group" aria-label="Answer choices for question ${index + 1}">${buttons}</div><div class="feedback${saved != null ? " is-visible" : ""}" aria-live="polite">${feedback}</div></div></div>
      </article>`;
    }).join("");
  });
}

function bindQuestionEvents() {
  document.querySelectorAll(".option:not(:disabled)").forEach(button => button.addEventListener("click", handleAnswer));
}

function handleAnswer(event) {
  const button = event.currentTarget;
  const stageKey = button.dataset.stageKey;
  const qIndex = Number(button.dataset.question);
  const selected = Number(button.dataset.option);
  const id = answerId(stageKey, qIndex);
  if (state.answers[id] != null) return;
  state.answers[id] = selected;
  saveState();
  renderQuestions();
  bindQuestionEvents();
  updateUI();

  const item = quizData[stageKey][qIndex];
  showToast(selected === item.answer ? "Correct — well spotted!" : "Good try — read the explanation.");
}

function stageAnswered(stageIndex) {
  const key = stageKeys[stageIndex];
  return quizData[key].every((_, i) => state.answers[answerId(key, i)] != null);
}

function stageScore(stageIndex) {
  const key = stageKeys[stageIndex];
  return quizData[key].filter((item, i) => state.answers[answerId(key, i)] === item.answer).length;
}

function totalAnswered() { return Object.keys(state.answers).filter(id => allQuestions.some((_, i) => id === answerId(stageKeys.find(key => id.startsWith(`${key}-`)), Number(id.split("-").at(-1))))).length; }

function totalScore() {
  return stageKeys.reduce((sum, key) => sum + quizData[key].filter((item, i) => state.answers[answerId(key, i)] === item.answer).length, 0);
}

function updateUI() {
  for (let i = 0; i < 4; i++) {
    if (stageAnswered(i) && state.unlockedStage < Math.min(i + 1, 3)) state.unlockedStage = Math.min(i + 1, 3);
  }
  if (state.activeStage > state.unlockedStage) state.activeStage = state.unlockedStage;
  saveState();

  document.querySelectorAll(".stage-panel").forEach((panel, index) => { panel.hidden = index !== state.activeStage; });
  document.querySelectorAll(".mission-tab").forEach((tab, index) => {
    const locked = index > state.unlockedStage;
    tab.disabled = locked;
    tab.classList.toggle("is-locked", locked);
    tab.classList.toggle("is-active", index === state.activeStage);
    tab.classList.toggle("is-complete", stageAnswered(index));
    if (index === state.activeStage) tab.setAttribute("aria-current", "step"); else tab.removeAttribute("aria-current");
  });

  document.querySelectorAll(".stage-panel").forEach((panel, index) => {
    const finish = panel.querySelector(".stage-finish");
    if (finish) {
      finish.hidden = !stageAnswered(index);
      const summary = finish.querySelector(".stage-summary");
      if (summary) summary.textContent = `You scored ${stageScore(index)} out of ${quizData[stageKeys[index]].length}.`;
    }
  });

  const answered = Object.keys(state.answers).length;
  const total = allQuestions.length;
  const percent = Math.round((answered / total) * 100);
  document.getElementById("scoreValue").textContent = totalScore();
  document.getElementById("scoreTotal").textContent = total;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressLabel").textContent = `Mission ${state.activeStage + 1} of 4`;

  const completion = document.getElementById("completionCard");
  completion.hidden = !stageAnswered(3);
  if (!completion.hidden) {
    const score = totalScore();
    document.getElementById("finalScore").textContent = `${score}/${total}`;
    document.getElementById("completionMessage").textContent = score >= 17 ? "Excellent detective work — your family vocabulary is very secure." : score >= 13 ? "Strong work. Review the highlighted answers to make every connection clear." : "Case solved! Review the explanations, then try again to improve your score.";
  }
}

function showStage(index, shouldScroll = true) {
  if (index > state.unlockedStage) return;
  state.activeStage = index;
  saveState();
  updateUI();
  if (shouldScroll) document.querySelector(".stage-shell").scrollIntoView({ behavior: "smooth", block: "start" });
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2100);
}

function resetProgress() {
  state = defaultState();
  saveState();
  renderQuestions();
  bindQuestionEvents();
  updateUI();
  window.scrollTo({ top: document.getElementById("lesson").offsetTop - 70, behavior: "smooth" });
  showToast("Progress reset. Ready for Mission 1!");
}

function init() {
  renderQuestions();
  bindQuestionEvents();
  updateUI();

  document.querySelectorAll(".mission-tab").forEach(tab => tab.addEventListener("click", () => showStage(Number(tab.dataset.stage))));
  document.querySelectorAll(".next-button").forEach(button => button.addEventListener("click", () => showStage(Number(button.dataset.next))));

  const dialog = document.getElementById("resetDialog");
  document.getElementById("resetButton").addEventListener("click", () => dialog.showModal());
  dialog.addEventListener("close", () => { if (dialog.returnValue === "confirm") resetProgress(); });
  document.getElementById("retryButton").addEventListener("click", resetProgress);
  document.getElementById("reviewButton").addEventListener("click", () => showStage(0));
}

init();
