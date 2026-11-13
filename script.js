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

  authenticationPassed = true;
  feedback.textContent = "Decrypting case file…";
  button.disabled = true;
  button.textContent = "ACCESSING CLASSIFIED FILE";
  screen.classList.add("unlocking");

  window.setTimeout(() => {
    navigateToScreen("squirrelScreen");
  }, 650);
});

document.getElementById("completeSquirrel").addEventListener("click", () => {
  navigateToScreen("missionScreen");
  document.getElementById("welcomeMessage").classList.remove("hidden");
});

const $ = id => document.getElementById(id);
let navigationHistory = ["accessScreen"];
let navigationHistoryIndex = 0;
let currentScreenId = "accessScreen";
let navigationBusy = false;
let authenticationPassed = false;
let domesticAccessGranted = false;
let finalSecretUnlocked = false;
const satisfactionSurveyState = { scores: [5, 5, 5], interacted: [false, false, false], revealedCount: 1, submitted: false };
const finalInterrogationState = { completed: [false, false, false] };
const navigationScreenSelector = ".stage-screen, .squirrel-screen, .future-chapters > .panel";
let furthestUnlockedChapter = 0;
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
  if(navigationBusy)return;
  const target = $(screenId);
  if(!target)return;
  if(target.id !== "accessScreen" && !authenticationPassed)return;
  if(target.id === "finalSecretGift" && !finalSecretUnlocked)return;
  if(target.closest(".future-chapters"))prepareFutureChapter(target);
  if(target.id === currentScreenId)return;

  if(options.recordHistory !== false){
    navigationHistory = navigationHistory.slice(0, navigationHistoryIndex + 1);
    navigationHistory.push(target.id);
    navigationHistoryIndex = navigationHistory.length - 1;
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
  }, 220);
}

function goBack(){
  if(navigationBusy || navigationHistoryIndex <= 0)return;
  navigationHistoryIndex -= 1;
  navigateToScreen(navigationHistory[navigationHistoryIndex], { recordHistory: false });
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

$("acceptBtn").addEventListener("click", () => showStage(2));

document.querySelectorAll(".answer-option").forEach(option => {
  option.addEventListener("click", () => {
    const answer = option.dataset.answer;
    if(answer === CONFIG.quizCorrectAnswer){
      $("answerList").classList.add("hidden");
      $("quizFeedback").textContent = "";
      $("quizSuccess").classList.remove("hidden");
      $("proceedInterrogation2").focus({ preventScroll: true });
    }else{
      $("quizFeedback").textContent = CONFIG.quizIncorrectMessages[answer] || "Wrong, try again";
    }
  });
});

$("proceedInterrogation2").addEventListener("click", () => showStage(3));
$("proceedEvidence").addEventListener("click", () => showStage(4));
$("proceedMemory").addEventListener("click", () => showStage(5));

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
      $("proceedEvidence").focus({ preventScroll: true });
    }else{
      $("personalityQuizFeedback").textContent = CONFIG.personalityIncorrectMessage;
    }
  });
  $("personalityAnswerList").appendChild(option);
});

$("continueInvestigation").addEventListener("click", () => {
  navigateToScreen("baliScreen");
});

$("continueFromBali").addEventListener("click", () => {
  navigateToScreen("domesticAccessScreen");
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

  domesticAccessGranted = true;
  feedback.textContent = "Access granted. Welcome to domestic life.";
  button.disabled = true;
  button.textContent = "ACCESSING DOMESTIC FILE";
  screen.classList.add("unlocking");
  window.setTimeout(() => {
    if(currentScreenId === "domesticAccessScreen")navigateToScreen("domesticSquirrelScreen");
  }, 650);
});

$("completeDomesticBriefing").addEventListener("click", () => {
  navigateToScreen("flowersIntroScreen");
});

$("openFlowersCollection").addEventListener("click", () => {
  navigateToScreen("flowersCollectionScreen");
});

$("continueFlowersStory").addEventListener("click", () => {
  navigateToScreen("satisfactionSurveyScreen");
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
    }, 1000);
  });

  ballerinaPhoto.addEventListener("error", () => {
    ballerinaPhoto.hidden = true;
    $("ballerinaPhotoFallback")?.removeAttribute("hidden");
  });

  continueFromLetterButton.addEventListener("click", () => {
    navigateToScreen("sunday");
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
  });
});

$("submitSurvey").addEventListener("click", () => {
  if(satisfactionSurveyState.revealedCount < 3)return;
  satisfactionSurveyState.submitted = true;
  $("submitSurvey").classList.add("hidden");
  $("surveyConfirmation").classList.remove("hidden");
  $("continueAfterSurvey").classList.remove("hidden");
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
  });
});
$("sundayUnlock").addEventListener("click",()=>{
  if($("sundayCode").value.trim().toLocaleUpperCase() === CONFIG.sundayCode.toLocaleUpperCase()){
    hide("sundayGate");reveal("sundayUnlocked");
    hide("sundayIntro");
    $("sundayStatus").textContent="Access granted";
    $("sundayIcon").textContent="✓";
  }else $("sundayCodeFeedback").textContent="Incorrect code. Please try again.";
});

$("openCulinaryFile").addEventListener("click",()=>navigateToScreen("culinaryFile"));

$("continueToFinalInterrogation").addEventListener("click",()=>navigateToScreen("finalInterrogationScreen"));

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
          answers.querySelectorAll("button").forEach(option => {
            option.disabled = true;
            option.classList.toggle("is-correct", option === button);
          });
          feedback.classList.add("is-correct");
          feedback.textContent = questionConfig.successMessage;

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
    $("sundayReveal").scrollIntoView({behavior:"smooth",block:"center"});
  }else $("sundayAnswerFeedback").textContent="Not quite. Think back to the place where you first met.";
});
$("mondayUnlock").addEventListener("click",()=>{
  if(accepted($("mondayCode").value,CONFIG.mondayCode)){
    hide("mondayGate");reveal("mondayReveal");
    $("mondayStatus").textContent="Access granted";
    $("mondayIcon").textContent="✓";
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
  },transitionDuration);
});

$("openFinalSecret").addEventListener("click",()=>navigateToScreen("finalSecretAccess"));

$("finalSecretForm").addEventListener("submit",event=>{
  event.preventDefault();
  if(CONFIG.finalSecretCode && accepted($("finalSecretCode").value,CONFIG.finalSecretCode)){
    finalSecretUnlocked = true;
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

// Let the coordinator preview and personalise the 2–3 website photos.
// Images are stored locally in this browser, not uploaded to a server.
