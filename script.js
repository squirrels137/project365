/* ==========================================================
   COORDINATOR SETUP — EDIT THESE FOUR VALUES BEFORE SHARING
   Use the exact venue names, or a nickname he will recognise.
   Codes are given to him in person / by message on the day.
   ========================================================== */
const CONFIG = {
  // Change the entry password here. Matching ignores case and outer spaces.
  entryPassword: "piccolabimba",
  domesticPassword: "umanobianco",
  quizCorrectAnswer: "30",
  quizIncorrectMessages: {
    "20": "Not even close, try again.",
    "24": "Wrong, try again."
  },
  personalityQuestion: "What was your first impression of my personality?",
  personalityAnswers: ["Caring", "Gentle", "Bossy"],
  personalityCorrectAnswer: "Bossy",
  personalityIncorrectMessage: "Nop, wrong one! 😂",
  personalitySuccessMessage: "Do you still think I am bossy? 👀",
  finalInterrogationIncorrectMessage: "Wrong answer! Try again. 😂",
  finalInterrogationQuestions: [
    {
      label: "QUESTION 1 · SHOE SIZE",
      question: "What's my shoe size?",
      answers: ["37", "38", "39"],
      correctAnswer: "38",
      successMessage: "Correct! 👏"
    },
    {
      label: "QUESTION 2 · BIRTH WEIGHT",
      question: "How much did I weigh when I was born?",
      answers: ["2.8 kg", "3.1 kg", "3.3 kg"],
      correctAnswer: "3.3 kg",
      successMessage: "Correct! ❤️"
    },
    {
      label: "QUESTION 3 · THE IMPORTANT ONE",
      question: "If I have to choose only ONE of these things to do with you for an entire week, while the other two weren't possible, which would I choose?",
      answers: ["Kiss you", "Hug you", "Smell you"],
      correctAnswer: "Smell you",
      successMessage: "CORRECT! 😂❤️"
    }
  ],
  evidenceCaptions: [
    "I really took a flight without knowing where I was going...",
    "We were so cute that people wanted to take us pictures",
    "Starting my Bulgarian traditions..."
  ],
  sundayCode: "5615CP",
  mondayCode: "Bergstraat",
  // Waiter's separate final access code for the final surprise.
  finalSecretCode: "16112026",
  sundayAnswer: "YOUR COFFEE SHOP NAME",
};
/* ========================================================== */

const accessForm = document.getElementById("accessForm");
accessForm.addEventListener("submit", event => {
  event.preventDefault();
  const password = document.getElementById("accessPassword").value.trim().toLocaleLowerCase();
  const feedback = document.getElementById("accessFeedback");
  const screen = document.getElementById("accessScreen");
  const button = document.getElementById("accessButton");

  if(password !== CONFIG.entryPassword.toLocaleLowerCase()){
    feedback.textContent = "Access denied. This investigator needs to try again.";
    document.getElementById("accessPassword").select();
    return;
  }

  setProgressFlag("authenticated");
  feedback.textContent = "Decrypting case file…";
  button.disabled = true;
  button.textContent = "ACCESSING CLASSIFIED FILE";
  screen.classList.add("unlocking");

  window.setTimeout(() => {
    navigateToScreen("squirrelScreen");
  }, 650);
});

document.getElementById("completeSquirrel").addEventListener("click", () => {
  navigateAndMark("missionScreen", "squirrelCompleted");
  document.getElementById("welcomeMessage").classList.remove("hidden");
});

const $ = id => document.getElementById(id);
const PROGRESS_STORAGE_KEY = "project365.progress.v1";
const PROGRESS_FLAG_NAMES = [
  "authenticated", "squirrelCompleted", "missionAccepted", "ageQuizCompleted",
  "personalityQuizCompleted", "evidenceCompleted", "soundtrackCompleted", "baliCompleted",
  "domesticAccessGranted", "domesticBriefingCompleted", "flowersIntroCompleted",
  "flowersGalleryCompleted", "letterOpened", "letterCompleted", "sundayCodeUnlocked",
  "sundayPuzzleCompleted", "sundayContinued", "culinaryCompleted",
  "finalInterrogationCompleted", "mondayCodeUnlocked", "restaurantRevealed",
  "finalSecretAccessOpened", "finalSecretUnlocked"
];

function isKnownScreenId(screenId){
  const screen = $(screenId);
  return screenId === "accessScreen" || Boolean(screen && (
    screen.matches(".stage-screen, .squirrel-screen") ||
    (screen.classList.contains("panel") && screen.closest(".future-chapters"))
  ));
}

function isRestorableScreen(screenId, record){
  if(!isKnownScreenId(screenId))return false;
  if(screenId !== "accessScreen" && !record.flags.authenticated)return false;
  if(screenId !== "accessScreen" && !record.unlockedScreens.includes(screenId))return false;
  const requirements = {
    missionScreen: "squirrelCompleted",
    interrogation: "missionAccepted",
    interrogationTwo: "ageQuizCompleted",
    evidenceRoom: "personalityQuizCompleted",
    soundtrackScreen: "evidenceCompleted",
    baliScreen: "soundtrackCompleted",
    domesticAccessScreen: "baliCompleted",
    domesticSquirrelScreen: "domesticAccessGranted",
    flowersIntroScreen: "domesticBriefingCompleted",
    flowersCollectionScreen: "flowersIntroCompleted",
    satisfactionSurveyScreen: "flowersGalleryCompleted",
    sunday: "letterCompleted",
    culinaryFile: "sundayCodeUnlocked",
    finalInterrogationScreen: "culinaryCompleted",
    monday: "finalInterrogationCompleted",
    finalSecretAccess: "restaurantRevealed",
    finalSecretGift: "finalSecretUnlocked"
  };
  const requiredFlag = requirements[screenId];
  if(screenId === "loveLetterScreen" && !record.survey.submitted)return false;
  return !requiredFlag || record.flags[requiredFlag] === true;
}

function isValidProgressRecord(record){
  if(!record || record.version !== 1 || typeof record.currentScreenId !== "string")return false;
  if(!Array.isArray(record.navigationHistory) || !record.navigationHistory.length || record.navigationHistory.length > 100)return false;
  if(!Number.isInteger(record.navigationHistoryIndex) || record.navigationHistoryIndex < 0 || record.navigationHistoryIndex >= record.navigationHistory.length)return false;
  if(record.navigationHistory[record.navigationHistoryIndex] !== record.currentScreenId)return false;
  if(!Array.isArray(record.unlockedScreens) || !record.unlockedScreens.length)return false;
  if(!record.navigationHistory.every(id => isKnownScreenId(id) && record.unlockedScreens.includes(id)))return false;
  if(!Array.isArray(record.unlockedScreens) || !record.unlockedScreens.every(isKnownScreenId))return false;
  if(!Number.isInteger(record.furthestUnlockedChapter) || record.furthestUnlockedChapter < 0 || record.furthestUnlockedChapter > 6)return false;
  if(!record.flags || !PROGRESS_FLAG_NAMES.every(name => typeof record.flags[name] === "boolean"))return false;
  if(!Array.isArray(record.finalInterrogationCompleted) || record.finalInterrogationCompleted.length !== 3 || !record.finalInterrogationCompleted.every(value => typeof value === "boolean"))return false;
  if(!Array.isArray(record.evidenceCaptions) || record.evidenceCaptions.length !== 3 || !record.evidenceCaptions.every(value => typeof value === "boolean"))return false;
  if(!record.survey || !Array.isArray(record.survey.scores) || record.survey.scores.length !== 3 || !record.survey.scores.every(value => Number.isInteger(value) && value >= 0 && value <= 10))return false;
  if(!Array.isArray(record.survey.interacted) || record.survey.interacted.length !== 3 || !record.survey.interacted.every(value => typeof value === "boolean"))return false;
  if(!Number.isInteger(record.survey.revealedCount) || record.survey.revealedCount < 1 || record.survey.revealedCount > 3 || typeof record.survey.submitted !== "boolean")return false;
  if((record.survey.interacted[0] && record.survey.revealedCount < 2) || (record.survey.interacted[1] && record.survey.revealedCount < 3))return false;
  if(record.survey.submitted && (record.survey.revealedCount !== 3 || !record.survey.interacted[2]))return false;
  if((record.finalInterrogationCompleted[1] && !record.finalInterrogationCompleted[0]) || (record.finalInterrogationCompleted[2] && !record.finalInterrogationCompleted[1]))return false;
  if(record.flags.finalInterrogationCompleted !== record.finalInterrogationCompleted.every(Boolean))return false;
  if(record.flags.finalSecretAccessOpened && !record.flags.restaurantRevealed)return false;
  if(record.flags.finalSecretUnlocked && !record.flags.finalSecretAccessOpened)return false;
  if(!isRestorableScreen(record.currentScreenId, record))return false;
  return record.navigationHistory.every(id => isRestorableScreen(id, record));
}

function readSavedProgress(){
  try{
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if(!raw)return null;
    const record = JSON.parse(raw);
    if(isValidProgressRecord(record))return record;
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  }catch(error){
    try{localStorage.removeItem(PROGRESS_STORAGE_KEY)}catch(ignore){}
  }
  return null;
}

const savedProgress = readSavedProgress();
const progressFlags = savedProgress ? { ...savedProgress.flags } : Object.fromEntries(PROGRESS_FLAG_NAMES.map(name => [name, false]));
let navigationHistory = savedProgress ? [...savedProgress.navigationHistory] : ["accessScreen"];
let navigationHistoryIndex = savedProgress ? savedProgress.navigationHistoryIndex : 0;
let currentScreenId = "accessScreen";
let navigationBusy = false;
let authenticationPassed = progressFlags.authenticated;
let domesticAccessGranted = progressFlags.domesticAccessGranted;
let finalSecretUnlocked = progressFlags.finalSecretUnlocked;
const satisfactionSurveyState = savedProgress ? {
  scores: [...savedProgress.survey.scores],
  interacted: [...savedProgress.survey.interacted],
  revealedCount: savedProgress.survey.revealedCount,
  submitted: savedProgress.survey.submitted
} : { scores: [5, 5, 5], interacted: [false, false, false], revealedCount: 1, submitted: false };
const finalInterrogationState = { completed: savedProgress ? [...savedProgress.finalInterrogationCompleted] : [false, false, false] };
const navigationScreenSelector = ".stage-screen, .squirrel-screen, .future-chapters > .panel";
let furthestUnlockedChapter = savedProgress ? savedProgress.furthestUnlockedChapter : 0;
const unlockedScreens = new Set(savedProgress ? savedProgress.unlockedScreens : ["accessScreen"]);
const evidenceCaptionState = savedProgress ? [...savedProgress.evidenceCaptions] : [false, false, false];

function setProgressFlag(name, value = true){
  progressFlags[name] = Boolean(value);
  if(name === "authenticated")authenticationPassed = Boolean(value);
  if(name === "domesticAccessGranted")domesticAccessGranted = Boolean(value);
  if(name === "finalSecretUnlocked")finalSecretUnlocked = Boolean(value);
}

function saveProgress(){
  if(navigationBusy)return;
  const record = {
    version: 1,
    currentScreenId,
    navigationHistory: [...navigationHistory],
    navigationHistoryIndex,
    unlockedScreens: [...unlockedScreens],
    furthestUnlockedChapter,
    flags: { ...progressFlags },
    finalInterrogationCompleted: [...finalInterrogationState.completed],
    evidenceCaptions: [...evidenceCaptionState],
    survey: {
      scores: [...satisfactionSurveyState.scores],
      interacted: [...satisfactionSurveyState.interacted],
      revealedCount: satisfactionSurveyState.revealedCount,
      submitted: satisfactionSurveyState.submitted
    }
  };
  try{localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(record))}catch(error){}
}

window.addEventListener("pagehide", () => saveProgress());

function updateStorylineProgress(currentChapter){
  furthestUnlockedChapter = Math.max(furthestUnlockedChapter, currentChapter);
  document.querySelectorAll("[data-chapter-indicator]").forEach(indicator => {
    const chapter = Number(indicator.dataset.chapterIndicator);
    const visible = chapter <= furthestUnlockedChapter;
    const active = chapter === currentChapter;
    indicator.hidden = !visible;
    indicator.classList.toggle("active", active);
    indicator.classList.toggle("complete", visible && chapter < currentChapter);
    indicator.setAttribute("aria-current", active ? "step" : "false");
  });
  document.querySelectorAll("[data-chapter-connector]").forEach(connector => {
    connector.hidden = Number(connector.dataset.chapterConnector) > furthestUnlockedChapter;
  });
}

function addBackButton(screen){
  if(!screen || screen.querySelector(".nav-back"))return;
  const button = document.createElement("button");
  button.className = "nav-back";
  button.type = "button";
  button.textContent = "← BACK";
  button.setAttribute("aria-label", "Go back to the previous screen");
  screen.insertBefore(button, screen.firstChild);
}

function updateBackButtons(){
  const disabled = navigationBusy || navigationHistoryIndex <= 0;
  document.querySelectorAll(".nav-back").forEach(button => button.disabled = disabled);
}

function prepareFutureChapter(screen){
  const futureContainer = screen.closest(".future-chapters");
  if(!futureContainer)return;

  const futureStage = { sunday: 8, monday: 9 }[screen.id] || Number(screen.dataset.stage) || 9;
  const futureChapter = Number(screen.dataset.chapter) || (futureStage === 8 ? 5 : futureStage === 9 ? 6 : 7);
  addBackButton(screen);
  screen.classList.remove("panel");
  screen.classList.add("stage-screen", "hidden");
  screen.dataset.stage = String(futureStage);
  screen.dataset.chapter = String(futureChapter);
  screen.setAttribute("aria-hidden", "true");
  const heading = screen.querySelector("h1, h2");
  if(heading){
    heading.id = screen.id + "Title";
    heading.setAttribute("tabindex", "-1");
    screen.setAttribute("aria-labelledby", heading.id);
  }

  const card = document.createElement("article");
  card.className = "document-card chapter-document";
  while(screen.firstChild)card.appendChild(screen.firstChild);
  screen.appendChild(card);
  $("sequenceMain").appendChild(screen);
}

function navigateToScreen(screenId, options = {}){
  if(navigationBusy)return false;
  const target = $(screenId);
  if(!target)return false;
  if(target.id !== "accessScreen" && !authenticationPassed)return false;
  if(target.id === "finalSecretGift" && !finalSecretUnlocked)return false;
  if(target.closest(".future-chapters"))prepareFutureChapter(target);
  if(target.id === currentScreenId)return false;

  let nextHistory = navigationHistory;
  let nextHistoryIndex = options.historyIndex ?? navigationHistoryIndex;
  if(options.recordHistory !== false){
    nextHistory = navigationHistory.slice(0, navigationHistoryIndex + 1);
    nextHistory.push(target.id);
    nextHistoryIndex = nextHistory.length - 1;
  }

  navigationBusy = true;
  updateBackButtons();
  const current = $(currentScreenId);
  if(current)current.classList.add("is-leaving");

  window.setTimeout(() => {
    if(current){
      current.classList.remove("active", "is-leaving", "is-entering");
      current.classList.add("hidden");
      current.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll(".stage-screen, .squirrel-screen").forEach(screen=>{
      if(screen === target)return;
      screen.classList.remove("active", "is-leaving", "is-entering");
      screen.classList.add("hidden");
      screen.setAttribute("aria-hidden", "true");
    });

    const site = $("siteContent");
    const accessScreen = $("accessScreen");
    const squirrelScreen = $("squirrelScreen");
    if(target.id === "accessScreen"){
      site.classList.add("hidden");
      site.setAttribute("aria-hidden", "true");
      squirrelScreen.classList.add("hidden");
      accessScreen.classList.remove("hidden", "is-leaving");
      accessScreen.classList.remove("unlocking");
      $("accessButton").disabled = false;
      $("accessButton").textContent = "UNLOCK CASE FILE";
      $("accessFeedback").textContent = "";
    }else if(target.id === "squirrelScreen"){
      site.classList.add("hidden");
      site.setAttribute("aria-hidden", "true");
      accessScreen.classList.add("hidden");
      squirrelScreen.classList.remove("hidden", "is-leaving");
      squirrelScreen.setAttribute("aria-hidden", "false");
    }else{
      accessScreen.classList.add("hidden");
      squirrelScreen.classList.add("hidden");
      squirrelScreen.setAttribute("aria-hidden", "true");
      site.classList.remove("hidden");
      site.setAttribute("aria-hidden", "false");
    }

    if(target.id === "domesticAccessScreen" && domesticAccessGranted){
      $("domesticAccessScreen").classList.remove("unlocking");
      $("domesticAccessButton").disabled = false;
      $("domesticAccessButton").textContent = "CONTINUE TO DOMESTIC LIFE";
      $("domesticAccessFeedback").textContent = "Access granted. Welcome to domestic life.";
    }

    const futureContainer = $("futureChapters");
    if(futureContainer && !target.closest(".future-chapters"))futureContainer.classList.add("hidden");
    target.classList.remove("hidden", "is-leaving");
    target.classList.add("active", "is-entering");
    target.setAttribute("aria-hidden", "false");
    currentScreenId = target.id;
    navigationHistory = nextHistory;
    navigationHistoryIndex = nextHistoryIndex;
    unlockedScreens.add(target.id);
    if(target.id === "finalSecretAccess")setProgressFlag("finalSecretAccessOpened");

    if(target.id === "baliScreen"){
      target.classList.remove("bali-reveal");
      void target.offsetWidth;
      target.classList.add("bali-reveal");
      const flightMotion = $("baliFlightMotion");
      if(flightMotion && typeof flightMotion.beginElement === "function")flightMotion.beginElement();
    }
    if(target.id === "culinaryFile"){
      target.classList.remove("culinary-reveal");
      void target.offsetWidth;
      target.classList.add("culinary-reveal");
    }

    const stageNumber = Number(target.dataset.stage);
    if(stageNumber){
      const chapterNumber = Number(target.dataset.chapter) || (stageNumber === 1 ? 1 : stageNumber <= 5 ? 2 : stageNumber <= 7 ? 4 : stageNumber === 8 ? 5 : 6);
      updateStorylineProgress(chapterNumber);
      $("stageProgress").classList.toggle("emotional", stageNumber === 5);
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => target.classList.remove("is-entering"));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    const heading = target.querySelector("h1, h2");
    if(heading)heading.focus({ preventScroll: true });
    navigationBusy = false;
    updateBackButtons();
    saveProgress();
  }, 220);
  return true;
}

function goBack(){
  if(navigationBusy || navigationHistoryIndex <= 0)return;
  const previousIndex = navigationHistoryIndex - 1;
  navigateToScreen(navigationHistory[previousIndex], { recordHistory: false, historyIndex: previousIndex });
}

function navigateAndMark(screenId, flagName){
  const scheduled = navigateToScreen(screenId);
  if(scheduled && flagName)setProgressFlag(flagName);
  return scheduled;
}

function showStage(stageNumber){
  const target = document.querySelector(`.stage-screen[data-stage="${stageNumber}"]`);
  if(target)navigateToScreen(target.id);
}

document.addEventListener("click", event => {
  if(event.target.closest(".nav-back"))goBack();
});

function installBackButtons(root = document){
  root.querySelectorAll(navigationScreenSelector).forEach(addBackButton);
  updateBackButtons();
}
installBackButtons();
new MutationObserver(records => {
  records.forEach(record => {
    if(record.type === "attributes"){
      if(record.target.matches(navigationScreenSelector))addBackButton(record.target);
      return;
    }
    record.addedNodes.forEach(node => {
      if(node.nodeType !== Node.ELEMENT_NODE)return;
      if(node.matches(navigationScreenSelector))addBackButton(node);
      installBackButtons(node);
    });
  });
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

const normalise = value => value.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\p{L}\p{N}]/gu,"");
function reveal(id){$(id).classList.remove("hidden")}
function hide(id){$(id).classList.add("hidden")}
function accepted(input, expected){return normalise(input) === normalise(expected)}

$("acceptBtn").addEventListener("click", () => navigateAndMark("interrogation", "missionAccepted"));

document.querySelectorAll(".answer-option").forEach(option => {
  option.addEventListener("click", () => {
    const answer = option.dataset.answer;
    if(answer === CONFIG.quizCorrectAnswer){
      $("answerList").classList.add("hidden");
      $("quizFeedback").textContent = "";
      $("quizSuccess").classList.remove("hidden");
      setProgressFlag("ageQuizCompleted");
      saveProgress();
      $("proceedInterrogation2").focus({ preventScroll: true });
    }else{
      $("quizFeedback").textContent = CONFIG.quizIncorrectMessages[answer] || "Wrong, try again";
    }
  });
});

$("proceedInterrogation2").addEventListener("click", () => navigateToScreen("interrogationTwo"));
$("proceedEvidence").addEventListener("click", () => navigateToScreen("evidenceRoom"));
$("proceedMemory").addEventListener("click", () => navigateAndMark("soundtrackScreen", "evidenceCompleted"));

$("personalityQuestion").textContent = CONFIG.personalityQuestion;
CONFIG.personalityAnswers.forEach(answer => {
  const option = document.createElement("button");
  option.className = "answer-option";
  option.type = "button";
  option.textContent = answer;
  option.addEventListener("click", () => {
    if(answer === CONFIG.personalityCorrectAnswer){
      $("personalityAnswerList").classList.add("hidden");
      $("personalityQuizFeedback").textContent = "";
      $("personalitySuccessMessage").textContent = CONFIG.personalitySuccessMessage;
      $("personalityQuizSuccess").classList.remove("hidden");
      setProgressFlag("personalityQuizCompleted");
      saveProgress();
      $("proceedEvidence").focus({ preventScroll: true });
    }else{
      $("personalityQuizFeedback").textContent = CONFIG.personalityIncorrectMessage;
    }
  });
  $("personalityAnswerList").appendChild(option);
});

$("continueInvestigation").addEventListener("click", () => {
  navigateAndMark("baliScreen", "soundtrackCompleted");
});

$("continueFromBali").addEventListener("click", () => {
  navigateAndMark("domesticAccessScreen", "baliCompleted");
});

$("domesticAccessForm").addEventListener("submit", event => {
  event.preventDefault();
  const password = $("domesticPassword").value.trim().toLocaleLowerCase();
  const feedback = $("domesticAccessFeedback");
  const button = $("domesticAccessButton");
  const screen = $("domesticAccessScreen");

  if(!domesticAccessGranted && password !== CONFIG.domesticPassword.toLocaleLowerCase()){
    feedback.textContent = "Access denied. Think about that nickname again! 😂";
    $("domesticPassword").select();
    return;
  }

  setProgressFlag("domesticAccessGranted");
  feedback.textContent = "Access granted. Welcome to domestic life.";
  button.disabled = true;
  button.textContent = "ACCESSING DOMESTIC FILE";
  screen.classList.add("unlocking");
  window.setTimeout(() => {
    if(currentScreenId === "domesticAccessScreen")navigateToScreen("domesticSquirrelScreen");
  }, 650);
});

$("completeDomesticBriefing").addEventListener("click", () => {
  navigateAndMark("flowersIntroScreen", "domesticBriefingCompleted");
});

$("openFlowersCollection").addEventListener("click", () => {
  navigateAndMark("flowersCollectionScreen", "flowersIntroCompleted");
});

$("continueFlowersStory").addEventListener("click", () => {
  navigateAndMark("satisfactionSurveyScreen", "flowersGalleryCompleted");
});

const openLetterButton = $("openLetter");
const ballerinaPhoto = $("ballerinaPhoto");
const continueFromLetterButton = $("continueFromLetter");
if(openLetterButton && ballerinaPhoto && continueFromLetterButton){
  openLetterButton.addEventListener("click", event => {
    const scene = $("letterScene");
    if(!scene || scene.classList.contains("is-opening"))return;
    scene.classList.add("is-opening");
    event.currentTarget.disabled = true;
    event.currentTarget.setAttribute("aria-expanded", "true");
    const photoCard = $("letterPhotoCard");
    if(photoCard)photoCard.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      scene.classList.add("is-open");
      $("letterRevealCopy")?.classList.remove("hidden");
      continueFromLetterButton.classList.remove("hidden");
      setProgressFlag("letterOpened");
      saveProgress();
    }, 1000);
  });

  ballerinaPhoto.addEventListener("error", () => {
    ballerinaPhoto.hidden = true;
    $("ballerinaPhotoFallback")?.removeAttribute("hidden");
  });

  continueFromLetterButton.addEventListener("click", () => {
    navigateAndMark("sunday", "letterCompleted");
  });
}

function revealSurveyQuestion(index){
  const question = $("surveyQuestion" + (index + 1));
  if(!question)return;
  question.classList.remove("hidden");
  question.classList.add("survey-question-revealed");
  question.setAttribute("aria-hidden", "false");
  satisfactionSurveyState.revealedCount = Math.max(satisfactionSurveyState.revealedCount, index + 1);
}

function interactWithSurveySlider(index){
  if(satisfactionSurveyState.interacted[index])return;
  satisfactionSurveyState.interacted[index] = true;
  $("surveyInstruction" + (index + 1)).classList.add("hidden");
  if(index < 2){
    revealSurveyQuestion(index + 1);
  }else if(!satisfactionSurveyState.submitted){
    $("submitSurvey").classList.remove("hidden");
  }
  saveProgress();
}

[1, 2, 3].forEach(questionNumber => {
  const index = questionNumber - 1;
  const slider = $("surveySlider" + questionNumber);
  if(!slider)return;
  const score = $("surveyScore" + questionNumber);
  slider.value = String(satisfactionSurveyState.scores[index]);
  score.value = String(satisfactionSurveyState.scores[index]);
  score.textContent = String(satisfactionSurveyState.scores[index]);
  slider.addEventListener("pointerdown", () => interactWithSurveySlider(index));
  slider.addEventListener("click", () => interactWithSurveySlider(index));
  slider.addEventListener("keydown", event => {
    if(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)){
      interactWithSurveySlider(index);
    }
  });
  slider.addEventListener("input", () => {
    const value = Number(slider.value);
    satisfactionSurveyState.scores[index] = value;
    score.value = String(value);
    score.textContent = String(value);
    interactWithSurveySlider(index);
    saveProgress();
  });
});

$("submitSurvey").addEventListener("click", () => {
  if(satisfactionSurveyState.revealedCount < 3)return;
  satisfactionSurveyState.submitted = true;
  $("submitSurvey").classList.add("hidden");
  $("surveyConfirmation").classList.remove("hidden");
  $("continueAfterSurvey").classList.remove("hidden");
  saveProgress();
});

$("continueAfterSurvey").addEventListener("click", () => {
  navigateToScreen("loveLetterScreen");
});

document.querySelectorAll(".flower-image").forEach(image => {
  const placeholder = image.nextElementSibling;
  image.addEventListener("error", () => {
    image.hidden = true;
    placeholder.hidden = false;
  });
  image.addEventListener("load", () => {
    image.hidden = false;
    placeholder.hidden = true;
  });
});

document.querySelectorAll(".evidence-trigger").forEach((trigger, index) => {
  const caption = $("caption" + (index + 1));
  caption.textContent = CONFIG.evidenceCaptions[index];
  trigger.addEventListener("click", () => {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isExpanded));
    caption.classList.toggle("hidden", isExpanded);
    evidenceCaptionState[index] = !isExpanded;
    saveProgress();
  });
});
$("sundayUnlock").addEventListener("click",()=>{
  if($("sundayCode").value.trim().toLocaleUpperCase() === CONFIG.sundayCode.toLocaleUpperCase()){
    hide("sundayGate");reveal("sundayUnlocked");
    hide("sundayIntro");
    $("sundayStatus").textContent="Access granted";
    $("sundayIcon").textContent="✓";
    setProgressFlag("sundayCodeUnlocked");
    saveProgress();
  }else $("sundayCodeFeedback").textContent="Incorrect code. Please try again.";
});

$("openCulinaryFile").addEventListener("click",()=>navigateAndMark("culinaryFile", "sundayContinued"));

$("continueToFinalInterrogation").addEventListener("click",()=>navigateAndMark("finalInterrogationScreen", "culinaryCompleted"));

function buildFinalInterrogation(){
  const container = $("finalInterrogationQuestions");
  CONFIG.finalInterrogationQuestions.forEach((questionConfig, index) => {
    const questionNumber = index + 1;
    const question = document.createElement("section");
    question.className = "final-question" + (index === 0 ? "" : " hidden");
    question.id = "finalQuestion" + questionNumber;
    if(index > 0)question.setAttribute("aria-hidden", "true");

    const label = document.createElement("p");
    label.className = "final-question-label";
    label.textContent = questionConfig.label;

    const prompt = document.createElement("h2");
    prompt.textContent = questionConfig.question;

    const answers = document.createElement("div");
    answers.className = "final-answer-list";
    answers.setAttribute("role", "group");
    answers.setAttribute("aria-label", "Choose your answer");

    const feedback = document.createElement("p");
    feedback.className = "final-question-feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");

    questionConfig.answers.forEach(answer => {
      const button = document.createElement("button");
      button.className = "final-answer-option";
      button.type = "button";
      button.textContent = answer;
      button.addEventListener("click", () => {
        if(finalInterrogationState.completed[index])return;

        if(answer === questionConfig.correctAnswer){
          finalInterrogationState.completed[index] = true;
          if(finalInterrogationState.completed.every(Boolean))setProgressFlag("finalInterrogationCompleted");
          answers.querySelectorAll("button").forEach(option => {
            option.disabled = true;
            option.classList.toggle("is-correct", option === button);
          });
          feedback.classList.add("is-correct");
          feedback.textContent = questionConfig.successMessage;
          saveProgress();

          window.setTimeout(() => {
            if(index < CONFIG.finalInterrogationQuestions.length - 1){
              const nextQuestion = $("finalQuestion" + (questionNumber + 1));
              nextQuestion.classList.remove("hidden");
              nextQuestion.classList.add("final-question-appearing");
              nextQuestion.setAttribute("aria-hidden", "false");
            }else if(finalInterrogationState.completed.every(Boolean)){
              $("finalInterrogationComplete").classList.remove("hidden");
              $("finalInterrogationComplete").classList.add("final-question-appearing");
            }
          }, 650);
        }else{
          feedback.classList.remove("is-correct");
          feedback.textContent = CONFIG.finalInterrogationIncorrectMessage;
        }
      });
      answers.appendChild(button);
    });

    question.append(label, prompt, answers, feedback);
    container.appendChild(question);
  });
}
buildFinalInterrogation();

$("proceedToFinalClue").addEventListener("click",()=>navigateToScreen("monday"));

$("sundayCheck").addEventListener("click",()=>{
  if(accepted($("sundayAnswer").value,CONFIG.sundayAnswer)){
    hide("sundayPuzzle");reveal("sundayReveal");
    $("sundayStatus").textContent="Chapter complete";
    $("sundayIcon").textContent="✓";
    setProgressFlag("sundayPuzzleCompleted");
    saveProgress();
    $("sundayReveal").scrollIntoView({behavior:"smooth",block:"center"});
  }else $("sundayAnswerFeedback").textContent="Not quite. Think back to the place where you first met.";
});
$("mondayUnlock").addEventListener("click",()=>{
  if(accepted($("mondayCode").value,CONFIG.mondayCode)){
    hide("mondayGate");reveal("mondayReveal");
    $("mondayStatus").textContent="Access granted";
    $("mondayIcon").textContent="✓";
    setProgressFlag("mondayCodeUnlocked");
    saveProgress();
  }else $("mondayCodeFeedback").textContent="Access denied. Monday's file is still classified.";
});

const mondayMessage = document.querySelector("#monday h2 + p");
const restaurantMessageStage = $("restaurantMessageStage");
if(mondayMessage && restaurantMessageStage){
  mondayMessage.classList.add("restaurant-message");
  restaurantMessageStage.insertBefore(mondayMessage, restaurantMessageStage.firstChild);
}
const restaurantGoodbye = document.querySelector("#restaurantDestinationStage .restaurant-goodbye");
if(restaurantGoodbye)restaurantGoodbye.textContent = "See you later amore";

$("revealRestaurant").addEventListener("click", event=>{
  const messageStage = $("restaurantMessageStage");
  const destinationStage = $("restaurantDestinationStage");
  if(!messageStage || !destinationStage || event.currentTarget.disabled)return;
  event.currentTarget.disabled = true;
  messageStage.classList.add("restaurant-message-leaving");
  destinationStage.classList.remove("hidden");
  destinationStage.classList.add("restaurant-revealing");
  const transitionDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 720;
  window.setTimeout(()=>{
    messageStage.classList.add("hidden");
    messageStage.classList.remove("restaurant-message-leaving");
    destinationStage.classList.remove("restaurant-revealing");
    setProgressFlag("restaurantRevealed");
    saveProgress();
  },transitionDuration);
});

$("openFinalSecret").addEventListener("click",()=>navigateToScreen("finalSecretAccess"));

$("finalSecretForm").addEventListener("submit",event=>{
  event.preventDefault();
  if(CONFIG.finalSecretCode && accepted($("finalSecretCode").value,CONFIG.finalSecretCode)){
    setProgressFlag("finalSecretUnlocked");
    $("finalSecretFeedback").textContent="Access granted.";
    navigateToScreen("finalSecretGift");
  }else{
    $("finalSecretFeedback").textContent="Access denied. Try again, Agent.";
    $("finalSecretCode").select();
  }
});
$("yesBtn").addEventListener("click",()=>{
  $("finalReply").textContent="Excellent. The investigation is renewed for another year. ❤️";
});
$("evidenceBtn").addEventListener("click",()=>{
  $("finalReply").textContent="Additional evidence is available in the form of 19 printed photographs, unlimited hugs, and one very devoted girlfriend.";
});

function restoreSavedInterfaceState(){
  if(progressFlags.squirrelCompleted)$("welcomeMessage").classList.remove("hidden");

  if(progressFlags.ageQuizCompleted){
    $("answerList").classList.add("hidden");
    $("quizSuccess").classList.remove("hidden");
  }
  if(progressFlags.personalityQuizCompleted){
    $("personalityAnswerList").classList.add("hidden");
    $("personalitySuccessMessage").textContent = CONFIG.personalitySuccessMessage;
    $("personalityQuizSuccess").classList.remove("hidden");
  }

  satisfactionSurveyState.scores.forEach((score, index) => {
    const slider = $("surveySlider" + (index + 1));
    const output = $("surveyScore" + (index + 1));
    slider.value = String(score);
    output.value = String(score);
    output.textContent = String(score);
    if(satisfactionSurveyState.interacted[index])$("surveyInstruction" + (index + 1)).classList.add("hidden");
  });
  for(let questionNumber = 2; questionNumber <= satisfactionSurveyState.revealedCount; questionNumber++){
    const question = $("surveyQuestion" + questionNumber);
    question.classList.remove("hidden");
    question.setAttribute("aria-hidden", "false");
  }
  if(satisfactionSurveyState.interacted[2] && !satisfactionSurveyState.submitted)$("submitSurvey").classList.remove("hidden");
  if(satisfactionSurveyState.submitted){
    $("submitSurvey").classList.add("hidden");
    $("surveyConfirmation").classList.remove("hidden");
    $("continueAfterSurvey").classList.remove("hidden");
  }

  if(progressFlags.letterOpened){
    const scene = $("letterScene");
    if(scene){
      scene.classList.add("is-opening", "is-open");
      $("openLetter").disabled = true;
      $("openLetter").setAttribute("aria-expanded", "true");
      $("letterPhotoCard").setAttribute("aria-hidden", "false");
      $("letterRevealCopy").classList.remove("hidden");
      $("continueFromLetter").classList.remove("hidden");
    }
  }

  evidenceCaptionState.forEach((isOpen, index) => {
    if(!isOpen)return;
    const trigger = document.querySelectorAll(".evidence-trigger")[index];
    const caption = $("caption" + (index + 1));
    if(trigger && caption){
      trigger.setAttribute("aria-expanded", "true");
      caption.classList.remove("hidden");
    }
  });

  if(progressFlags.domesticAccessGranted){
    $("domesticAccessScreen").classList.remove("unlocking");
    $("domesticAccessButton").disabled = false;
    $("domesticAccessButton").textContent = "CONTINUE TO DOMESTIC LIFE";
    $("domesticAccessFeedback").textContent = "Access granted. Welcome to domestic life.";
  }
  if(progressFlags.sundayCodeUnlocked){
    hide("sundayGate");
    reveal("sundayUnlocked");
    hide("sundayIntro");
    $("sundayStatus").textContent = "Access granted";
    $("sundayIcon").textContent = "✓";
  }
  if(progressFlags.sundayPuzzleCompleted){
    hide("sundayPuzzle");
    reveal("sundayReveal");
    $("sundayStatus").textContent = "Chapter complete";
    $("sundayIcon").textContent = "✓";
  }
  if(progressFlags.mondayCodeUnlocked){
    hide("mondayGate");
    reveal("mondayReveal");
    $("mondayStatus").textContent = "Access granted";
    $("mondayIcon").textContent = "✓";
  }
  if(progressFlags.restaurantRevealed){
    hide("restaurantMessageStage");
    reveal("restaurantDestinationStage");
    $("revealRestaurant").disabled = true;
  }

  finalInterrogationState.completed.forEach((completed, index) => {
    const question = $("finalQuestion" + (index + 1));
    const shouldBeVisible = index === 0 || finalInterrogationState.completed[index - 1];
    if(shouldBeVisible){
      question.classList.remove("hidden");
      question.setAttribute("aria-hidden", "false");
    }
    if(!completed)return;
    const questionConfig = CONFIG.finalInterrogationQuestions[index];
    const correctButton = [...question.querySelectorAll(".final-answer-option")]
      .find(button => button.textContent === questionConfig.correctAnswer);
    question.querySelectorAll(".final-answer-option").forEach(button => {
      button.disabled = true;
      button.classList.toggle("is-correct", button === correctButton);
    });
    const feedback = question.querySelector(".final-question-feedback");
    feedback.classList.add("is-correct");
    feedback.textContent = questionConfig.successMessage;
  });
  if(progressFlags.finalInterrogationCompleted)$("finalInterrogationComplete").classList.remove("hidden");
}

if(savedProgress){
  restoreSavedInterfaceState();
  // If authentication completed but the visitor closed the page during its
  // unlock animation, resume at the first authenticated screen.
  const screenToRestore = savedProgress.currentScreenId === "accessScreen" && progressFlags.authenticated
    ? "squirrelScreen"
    : savedProgress.currentScreenId;
  if(screenToRestore !== "accessScreen"){
    const resumingAuthentication = screenToRestore !== savedProgress.currentScreenId;
    navigateToScreen(screenToRestore, resumingAuthentication ? {} : {
      recordHistory: false,
      historyIndex: savedProgress.navigationHistoryIndex
    });
  }
}

// Let the coordinator preview and personalise the 2–3 website photos.
// Images are stored locally in this browser, not uploaded to a server.
