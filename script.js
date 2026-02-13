var body = document.body;
var canvas = document.getElementById("starfield");
var context = canvas.getContext("2d");

var introView = document.getElementById("introView");
var introText = document.getElementById("introText");

var proposalView = document.getElementById("proposalView");
var yesButton = document.getElementById("yesButton");
var noButton = document.getElementById("noButton");

var celebrationView = document.getElementById("celebrationView");
var celebrationText = document.getElementById("celebrationText");

var messageView = document.getElementById("messageView");
var messageViewText = document.getElementById("messageViewText");

var proposalTwoView = document.getElementById("proposalTwoView");
var yesButtonTwo = document.getElementById("yesButtonTwo");
var noButtonTwo = document.getElementById("noButtonTwo");

var celebrationTwoView = document.getElementById("celebrationTwoView");
var celebrationTwoText = document.getElementById("celebrationTwoText");

var endingView = document.getElementById("endingView");

var introMessages = [
    "Every love story starts with one unforgettable hello.",
    "And somehow, every day with you still feels brand new.",
    "So before the stars take over, I need to ask you something...",
    "So before the stsfdsdfmething...",
    "So before the stars take over, I need to ask you asd"
];

var celebrationMessages = [
    "You just made my whole universe brighter.",
    "I promise to keep choosing you in every season.",
    "Now come with me, the stars have something to say..."
];

var celebrationTwoMessages = [
    "That was the easiest yes in history.",
    "Okay, one last sky-full confession for you..."
];

var storyLines = [
    "amongst trillions and trillions of stars, over billions of years",
    "to be alive, and to get to spend this life with you",
    "is so incredibly, unfathomably unlikely",
    "and yet here we are, writing our own impossible story",
    "Happy Valentine's Day <3"
];

var stars = 520;
var starArray = [];
var dpr = 1;
var width = window.innerWidth;
var height = window.innerHeight;
var scene = "intro";
var storyTime = 0;
var nightFadeTimer = 0;
var nightTextDelay = 1.5;
var yesTwoScale = 1;
var noTwoScale = 1;

function showView(view) {
    view.classList.remove("hidden");
    requestAnimationFrame(function () {
        view.classList.add("show");
        view.setAttribute("aria-hidden", "false");
    });
}

function hideView(view, callback) {
    view.classList.remove("show");
    view.setAttribute("aria-hidden", "true");

    setTimeout(function () {
        view.classList.add("hidden");
        if (callback) {
            callback();
        }
    }, 500);
}

function playMessageSequence(textElement, messages, onDone) {
    function showIndex(index) {
        if (index >= messages.length) {
            textElement.classList.remove("visible");
            onDone();
            return;
        }

        textElement.textContent = messages[index];
        textElement.classList.remove("visible");

        requestAnimationFrame(function () {
            textElement.classList.add("visible");
        });

        setTimeout(function () {
            textElement.classList.remove("visible");

            setTimeout(function () {
                showIndex(index + 1);
            }, 900);
        }, 2800);
    }

    showIndex(0);
}

function showSingleCelebration(view, textElement, message, onDone) {
    showView(view);
    textElement.textContent = message;
    textElement.classList.remove("visible");

    requestAnimationFrame(function () {
        textElement.classList.add("visible");
    });

    setTimeout(function () {
        textElement.classList.remove("visible");

        setTimeout(function () {
            hideView(view, onDone);
        }, 900);
    }, 2800);
}

function showStandaloneMessages(messages, onDone) {
    showView(messageView);
    playMessageSequence(messageViewText, messages, function () {
        hideView(messageView, onDone);
    });
}

function startIntroFlow() {
    playMessageSequence(introText, introMessages, function () {
        hideView(introView, function () {
            scene = "proposal-1";
            showView(proposalView);
        });
    });
}

function moveNoButton() {
    if (scene !== "proposal-1") {
        return;
    }

    var padding = 30;
    var maxX = window.innerWidth - noButton.offsetWidth - padding;
    var maxY = window.innerHeight - noButton.offsetHeight - padding;

    var x = Math.max(padding, Math.random() * Math.max(maxX, padding));
    var y = Math.max(padding, Math.random() * Math.max(maxY, padding));

    noButton.style.left = x + "px";
    noButton.style.top = y + "px";
}

function startCelebrationOne() {
    scene = "celebration-1";

    hideView(proposalView, function () {
        showSingleCelebration(
            celebrationView,
            celebrationText,
            celebrationMessages[0],
            function () {
                showStandaloneMessages(celebrationMessages.slice(1), function () {
                    scene = "proposal-2";
                    showView(proposalTwoView);
                });
            }
        );
    });
}

function onNoButtonTwoClick() {
    if (scene !== "proposal-2") {
        return;
    }

    yesTwoScale = Math.min(1.75, yesTwoScale + 0.06);
    noTwoScale = Math.max(0.45, noTwoScale - 0.05);

    yesButtonTwo.style.transform = "scale(" + yesTwoScale + ")";
    noButtonTwo.style.transform = "scale(" + noTwoScale + ")";
}

function startCelebrationTwo() {
    if (scene !== "proposal-2") {
        return;
    }

    scene = "celebration-2";

    hideView(proposalTwoView, function () {
        showSingleCelebration(
            celebrationTwoView,
            celebrationTwoText,
            celebrationTwoMessages[0],
            function () {
                showStandaloneMessages(celebrationTwoMessages.slice(1), function () {
                    body.classList.remove("theme-proposal");
                    body.classList.add("theme-night");
                    canvas.classList.add("active");
                    scene = "night-fade";
                    storyTime = 0;
                    nightFadeTimer = 0;
                });
            }
        );
    });
}

function setupCanvas() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createStars() {
    starArray = [];
    for (var i = 0; i < stars; i++) {
        starArray.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.4,
            opacity: Math.random(),
            hue: [210, 260, 300][Math.floor(Math.random() * 3)]
        });
    }
}

function drawStars() {
    for (var i = 0; i < stars; i++) {
        var star = starArray[i];
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = "hsla(" + star.hue + ", 80%, 92%, " + star.opacity + ")";
        context.fill();
    }
}

function updateStars() {
    for (var i = 0; i < stars; i++) {
        if (Math.random() > 0.993) {
            starArray[i].opacity = Math.random();
        }
    }
}

function drawWrappedLine(text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";
    var rows = [];

    for (var i = 0; i < words.length; i++) {
        var testLine = line + words[i] + " ";
        var measure = context.measureText(testLine).width;

        if (measure > maxWidth && i > 0) {
            rows.push(line.trim());
            line = words[i] + " ";
        } else {
            line = testLine;
        }
    }

    rows.push(line.trim());

    var startY = y - (rows.length - 1) * lineHeight * 0.5;

    for (var j = 0; j < rows.length; j++) {
        context.fillText(rows[j], x, startY + j * lineHeight);
    }
}

function getAlpha(localTime, fadeIn, hold, fadeOut) {
    if (localTime < 0) {
        return 0;
    }
    if (localTime < fadeIn) {
        return localTime / fadeIn;
    }
    if (localTime < fadeIn + hold) {
        return 1;
    }
    if (localTime < fadeIn + hold + fadeOut) {
        return 1 - (localTime - fadeIn - hold) / fadeOut;
    }
    return 0;
}

function drawNightStory(delta) {
    context.clearRect(0, 0, width, height);
    drawStars();
    updateStars();

    if (scene === "night-fade") {
        nightFadeTimer += delta;
        if (nightFadeTimer >= nightTextDelay) {
            scene = "night-story";
        }
        return;
    }

    storyTime += delta;

    context.font = "600 " + Math.max(30, Math.min(48, width / 28)) + "px 'Trebuchet MS', 'Avenir Next', sans-serif";
    context.textAlign = "center";
    context.shadowColor = "rgba(255, 190, 245, 0.8)";
    context.shadowBlur = 16;

    var fadeIn = 0.9;
    var hold = 1.8;
    var fadeOut = 0.9;
    var segment = fadeIn + hold + fadeOut;

    for (var i = 0; i < storyLines.length; i++) {
        var local = storyTime - i * segment;
        var alpha = getAlpha(local, fadeIn, hold, fadeOut);

        if (alpha <= 0) {
            continue;
        }

        var yOffset = i >= 3 ? (i - 2) * 70 : 0;
        context.fillStyle = "rgba(248, 240, 255, " + alpha + ")";
        drawWrappedLine(storyLines[i], width / 2, height / 2 + yOffset, width * 0.78, 56);
    }

    context.shadowBlur = 0;

    var fullDuration = storyLines.length * segment + 0.8;
    if (storyTime >= fullDuration) {
        scene = "ending";
        showView(endingView);
    }
}

var lastTime = performance.now();
function loop(now) {
    var delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (scene === "night-fade" || scene === "night-story") {
        drawNightStory(delta);
    }

    requestAnimationFrame(loop);
}

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("click", moveNoButton);
yesButton.addEventListener("click", startCelebrationOne);

noButtonTwo.addEventListener("click", onNoButtonTwoClick);
yesButtonTwo.addEventListener("click", startCelebrationTwo);

window.addEventListener("resize", function () {
    setupCanvas();
    createStars();
});

setupCanvas();
createStars();

setTimeout(function () {
    startIntroFlow();
}, 250);

requestAnimationFrame(loop);
