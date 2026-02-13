var canvas = document.getElementById("starfield");
var context = canvas.getContext("2d");

var choiceView = document.getElementById("choiceView");
var finalView = document.getElementById("finalView");
var yesButton = document.getElementById("yesButton");
var noButton = document.getElementById("noButton");

var textColor = "245, 245, 240";
var glowColor = "255, 255, 255";

var dpr = 1;
var cssWidth = window.innerWidth;
var cssHeight = window.innerHeight;

var stars = 420;
var colorrange = [0, 50, 220];
var starArray = [];

var sceneState = "story";
var sceneOpacity = 1;
var storyTime = 0;
var yesScale = 1;

var storyLines = [
    "everyday I cannot believe how lucky I am",
    "amongst trillions and trillions of stars, over billions of years",
    "to be alive, and to get to spend this life with you",
    "is so incredibly, unfathomably unlikely",
    "and yet here I am to get the impossible chance to get to know you",
    "I love you so much {name}, more than all the time and space in the universe can contain",
    "and I can't wait to spend all the time in the world to share that love with you!",
    "Happy Valentine's Day <3"
];

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setupCanvas() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createStars() {
    starArray = [];

    for (var i = 0; i < stars; i++) {
        starArray.push({
            x: Math.random() * cssWidth,
            y: Math.random() * cssHeight,
            radius: Math.random() * 1.2,
            hue: colorrange[getRandom(0, colorrange.length - 1)],
            sat: getRandom(45, 100),
            opacity: Math.random()
        });
    }
}

function drawStars() {
    for (var i = 0; i < stars; i++) {
        var star = starArray[i];
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = "hsla(" + star.hue + ", " + star.sat + "%, 88%, " + star.opacity + ")";
        context.fill();
    }
}

function updateStars() {
    for (var i = 0; i < stars; i++) {
        if (Math.random() > 0.992) {
            starArray[i].opacity = Math.random();
        }
    }
}

function clearFrame() {
    context.clearRect(0, 0, cssWidth, cssHeight);
}

function drawWrappedText(text, centerX, centerY, maxWidth, lineHeight) {
    var words = text.split(" ");
    var lines = [];
    var line = "";

    for (var i = 0; i < words.length; i++) {
        var testLine = line + words[i] + " ";
        var metrics = context.measureText(testLine);

        if (metrics.width > maxWidth && i > 0) {
            lines.push(line.trim());
            line = words[i] + " ";
        } else {
            line = testLine;
        }
    }

    lines.push(line.trim());

    var blockHeight = lines.length * lineHeight;
    var startY = centerY - blockHeight / 2 + lineHeight * 0.82;

    for (var j = 0; j < lines.length; j++) {
        context.fillText(lines[j], centerX, startY + j * lineHeight);
    }
}

function alphaForSegment(localTime, fadeIn, hold, fadeOut) {
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

function drawStoryText() {
    var baseFont = Math.max(20, Math.min(36, cssWidth / 12.6));
    var lineHeight = Math.round(baseFont * 1.28);

    context.font = "500 " + baseFont + "px 'Trebuchet MS', 'Avenir Next', 'Segoe UI', sans-serif";
    context.textAlign = "center";

    context.shadowColor = "rgba(" + glowColor + ", 0.82)";
    context.shadowBlur = 12;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    var fadeIn = 0.85;
    var hold = 1.45;
    var fadeOut = 0.85;
    var segmentDuration = fadeIn + hold + fadeOut;

    for (var i = 0; i < storyLines.length; i++) {
        var localTime = storyTime - i * segmentDuration;
        var alpha = alphaForSegment(localTime, fadeIn, hold, fadeOut) * sceneOpacity;

        if (alpha <= 0) {
            continue;
        }

        var yOffset = 0;

        if (i === 6) {
            yOffset = Math.min(82, cssHeight * 0.1);
        }

        if (i === 7) {
            yOffset = Math.min(154, cssHeight * 0.19);
        }

        context.fillStyle = "rgba(" + textColor + ", " + alpha + ")";
        drawWrappedText(storyLines[i], cssWidth / 2, cssHeight / 2 + yOffset, cssWidth * 0.86, lineHeight);
    }

    context.shadowColor = "transparent";
    context.shadowBlur = 0;
}

function showChoiceView() {
    choiceView.classList.remove("hidden");
    requestAnimationFrame(function () {
        choiceView.classList.add("show");
        choiceView.setAttribute("aria-hidden", "false");
    });
}

function hideChoiceView(callback) {
    choiceView.classList.remove("show");
    choiceView.setAttribute("aria-hidden", "true");

    setTimeout(function () {
        choiceView.classList.add("hidden");
        if (callback) {
            callback();
        }
    }, 550);
}

function showFinalView() {
    finalView.classList.remove("hidden");

    requestAnimationFrame(function () {
        finalView.classList.add("show");
        finalView.setAttribute("aria-hidden", "false");
    });
}

yesButton.addEventListener("click", function () {
    if (sceneState !== "choice") {
        return;
    }

    sceneState = "final";
    hideChoiceView(function () {
        showFinalView();
    });
});

noButton.addEventListener("click", function () {
    if (sceneState !== "choice") {
        return;
    }

    yesScale = Math.min(1.9, yesScale + 0.12);
    yesButton.style.transform = "scale(" + yesScale + ")";
});

function updateScene(deltaSeconds) {
    if (sceneState === "story") {
        storyTime += deltaSeconds;

        var fullStoryDuration = storyLines.length * (0.85 + 1.45 + 0.85) + 0.15;

        if (storyTime >= fullStoryDuration) {
            sceneState = "fadeToChoice";
        }
    }

    if (sceneState === "fadeToChoice") {
        sceneOpacity = Math.max(0, sceneOpacity - deltaSeconds * 1.85);

        if (sceneOpacity === 0) {
            sceneState = "choice";
            showChoiceView();
        }
    }
}

var lastFrameTime = performance.now();

function draw(now) {
    var deltaSeconds = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    clearFrame();
    drawStars();
    updateStars();
    drawStoryText();
    updateScene(deltaSeconds);

    window.requestAnimationFrame(draw);
}

window.addEventListener("resize", function () {
    setupCanvas();
    createStars();
});

setupCanvas();
createStars();
window.requestAnimationFrame(draw);
