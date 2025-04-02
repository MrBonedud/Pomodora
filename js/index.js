// Initialize app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Cache DOM element references for better performance
  // Main UI controls
  const timerDisplay = document.querySelector(".timer-display");
  const startPauseBtn = document.getElementById("start-pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const modeButtons = document.querySelectorAll(".mode-btn");
  const loopsContainer = document.getElementById("loops-container");
  const container = document.querySelector(".container");
  const body = document.body;

  // Task management elements
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const tasksList = document.getElementById("tasks-list");
  const currentFocusTask = document.getElementById("current-focus-task");

  // Logging and display elements
  const quoteElement = document.querySelector(".quote");
  const sessionLogList = document.getElementById("session-log-list");
  const focusSessionsCount = document.querySelector(".stat-value:nth-child(1)");
  const totalMinutesCount = document.querySelector(".stat-value:nth-child(3)");

  // Timer durations in seconds for each mode
  const DURATIONS = {
    focus: 25 * 60, // 25 minutes
    "short-break": 5 * 60, // 5 minutes
    "long-break": 15 * 60, // 15 minutes
  };

  // Application state variables
  let currentMode = "focus"; // Current timer mode
  let timeRemaining = DURATIONS["focus"]; // Time left in current session
  let isRunning = false; // Timer running state
  let intervalId = null; // Timer interval reference
  let completedLoops = 0; // Total completed pomodoro cycles
  let currentCyclePosition = 0; // Position in current 4-pomodoro cycle
  let todayFocusSessions = 0; // Number of focus sessions completed today
  let todayFocusMinutes = 0; // Total focus minutes completed today
  let currentTask = "No task selected"; // Currently selected task

  // Collection of motivational quotes with attributions
  const quotes = [
    {
      text: "Courage isn't having the strength to go on - it is going on when you don't have strength.",
      author: "Napoleon Bonaparte - French military leader and emperor",
    },
    {
      text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
      author: "Stephen Covey - Author of 'The 7 Habits of Highly Effective People'",
    },
    {
      text: "It's not always that we need to do more but rather that we need to focus on less.",
      author: "Nathan W. Morris - Productivity expert and financial consultant",
    },
    {
      text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.",
      author: "Alexander Graham Bell - Inventor of the telephone",
    },
    {
      text: "Things don't have to change the world to be important.",
      author: "Steve Jobs - Co-founder of Apple and tech visionary",
    },
    {
      text: "Once something is a passion, the motivation is there.",
      author: "Michael Schumacher - 7-time Formula 1 World Champion",
    },
    {
      text: "I don't believe in luck. I believe in hard work.",
      author: "Michael Schumacher - 7-time Formula 1 World Champion",
    },
    {
      text: "We must accept finite disappointment, but never lose infinite hope.",
      author: "Martin Luther King Jr. - Leader of the American civil rights movement",
    },
    {
      text: "They can throw what they want at me, I will come back stronger.",
      author: "Lewis Hamilton - 7-time Formula 1 World Champion",
    },
    {
      text: "I am not designed to come second or third, I am designed to win.",
      author: "Ayrton Senna - 3-time Formula 1 World Champion",
    },
    {
      text: "I am the best driver because I believe that I am the best, because every other driver needs to think like that, Otherwise it's better to stay at home.",
      author: "Max Verstappen - 3-time Formula 1 World Champion",
    },
    {
      text: "The successful warrior is the average man, with laser-like focus.",
      author: "Bruce Lee - Martial artist, actor, and philosopher",
    },
    {
      text: "If you love life do not waste time, for time is what life is made up of.",
      author: "Bruce Lee - Martial artist, actor, and philosopher",
    },
    {
      text: "Nature does not hurry, yet everything is accomplished.",
      author: "Lao Tzu - Ancient Chinese philosopher and founder of Taoism",
    },
    {
      text: "Don't confuse motion with progress. A rocking horse keeps moving but doesn't make any progress.",
      author: "Alfred A. Montapert - Author of 'The Supreme Philosophy of Man'",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs - Co-founder of Apple and tech visionary",
    },
    {
      text: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
    },
    {
        text: "If everything seems under control, you're not going fast enough.",
        author: "Mario Andretti - Formula 1 and IndyCar racing legend",
    },
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela - Anti-apartheid revolutionary and former President of South Africa",
    },
    {
        text:"Once we accept our limits, we go beyond them.",
        author:"Albert Einstein - Theoretical physicist known for the theory of relativity",
    },
    {
        text:"The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author:"Nelson Mandela - Anti-apartheid revolutionary and former President of South Africa",
    }
  ];
  

  // Utility function to manage body class modes
  function removeBodyModeClasses() {
    body.classList.remove("focus-mode", "short-break-mode", "long-break-mode");
  }

  // Set up mode switching functionality
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      modeButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Update current mode
      currentMode = button.id.replace("-mode", "");

      // Remove existing mode classes and add new one
      removeBodyModeClasses();
      body.classList.add(`${currentMode}-mode`);

      // Reset timer to new mode's duration
      timeRemaining = DURATIONS[currentMode];
      updateDisplay();

      // Stop running timer if active
      if (isRunning) {
        pauseTimer();
      }
    });
  });

  // Timer control event listeners
  startPauseBtn.addEventListener("click", () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  resetBtn.addEventListener("click", resetTimer);

  // Task management initialization
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", addTask);
  }

  // Timer control functions
  function startTimer() {
    isRunning = true;
    startPauseBtn.textContent = "Pause";

    // Update timer every second
    intervalId = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
      } else {
        completeTimer(); // Handle timer completion
      }
    }, 1000);
  }

  function pauseTimer() {
    // Stop the timer and update the button text
    clearInterval(intervalId);
    isRunning = false;
    startPauseBtn.textContent = "Start";
  }

  function resetTimer() {
    // Stop timer and reset state
    clearInterval(intervalId);
    isRunning = false;
    timeRemaining = DURATIONS[currentMode];
    startPauseBtn.textContent = "Start";

    // Clear visual indicators
    loopsContainer.innerHTML = "";
    completedLoops = 0;
    currentCyclePosition = 0;

    // Reset statistics
    todayFocusSessions = 0;
    todayFocusMinutes = 0;
    updateSummaryStats();
    updateDisplay();
  }

  function completeTimer() {
    // Handle timer completion and mode transitions
    clearInterval(intervalId);
    isRunning = false;
    startPauseBtn.textContent = "Start";

    if (currentMode === "focus") {
      // After focus session
      currentCyclePosition++;
      addSessionLog("focus", currentTask);
      updateStats();

      // Determine break type (long break every 4th session)
      currentMode =
        currentCyclePosition % 4 === 0 ? "long-break" : "short-break";
    } else {
      // After break session
      addLoopMarker(currentMode);
      addSessionLog(currentMode, "Break completed");
      currentMode = "focus"; // Return to focus mode
    }

    // Switch to next mode and start
    const nextModeButton = document.getElementById(`${currentMode}-mode`);
    nextModeButton.click();
    startTimer();
    updateQuote();
  }

  // Visual tracking functions
  function addLoopMarker(color) {
    // Create SVG circle to represent completed pomodoro
    const colors = {
      "short-break": "#228B22", // Green for short breaks
      "long-break": "#00CED1", // Cyan for long breaks
    };

    // Calculate circle position in grid layout
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    const radius = 10;
    const spacing = 30;
    let row = Math.floor(completedLoops / 6); // 6 circles per row
    let col = completedLoops % 6;

    // Position and style circle
    circle.setAttribute("cx", `${20 + col * spacing}`);
    circle.setAttribute("cy", `${20 + row * spacing}`);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", colors[currentMode] || "#228B22");
    loopsContainer.appendChild(circle);
    completedLoops++;

    // Adjust SVG container height for multiple rows
    if (row > 1) {
      loopsContainer.setAttribute("height", `${(row + 1) * spacing + radius}`);
    }
  }

  // UI update functions
  function updateDisplay() {
    // Update the timer display with the remaining time
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function updateQuote() {
    // Randomly select a quote from our quotes array
    const randomQuoteObj = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.innerHTML = `"${randomQuoteObj.text}" <br><em>— ${randomQuoteObj.author}</em>`;
  }

  function addSessionLog(type, content) {
    // Add a log entry for the completed session
    if (!sessionLogList) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const logElement = document.createElement("div");
    logElement.className = "session-log-entry";

    logElement.innerHTML = `
            <div class="log-header">
                <p class="log-time">${timeString}</p>
                <div class="log-type ${type}-log">${
      type === "focus"
        ? "Focus"
        : type === "short-break"
        ? "Short Break"
        : "Long Break"
    }</div>
            </div>
            <p class="log-content">${content}</p>
        `;

    sessionLogList.prepend(logElement);
  }

  // Task management functions
  function addTask() {
    // Add a new task to the task list
    if (!taskInput || !taskInput.value.trim()) return;

    const taskText = taskInput.value.trim();

    const taskElement = document.createElement("div");
    taskElement.className = "task-item";

    taskElement.innerHTML = `
            <span class="task-text">${taskText}</span>
            <div class="task-actions">
                <button class="focus-task-btn">Focus</button>
                <button class="delete-task-btn">×</button>
            </div>
        `;

    // Add event listeners to buttons
    const focusBtn = taskElement.querySelector(".focus-task-btn");
    const deleteBtn = taskElement.querySelector(".delete-task-btn");

    if (focusBtn) {
      focusBtn.addEventListener("click", function () {
        setFocusTask(taskText);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        taskElement.remove();
      });
    }

    if (tasksList) {
      tasksList.appendChild(taskElement);
      taskInput.value = ""; // Clear input
    }
  }

  function setFocusTask(taskText) {
    // Set the current focus task
    currentTask = taskText;

    if (currentFocusTask) {
      // Update the current focus task
      currentFocusTask.textContent = taskText;

      // Make sure the current focus section is visible
      const currentFocusSection = document.querySelector(
        ".current-focus-section"
      );
      if (currentFocusSection) {
        currentFocusSection.classList.add("has-task");
      }
    }
  }

  function updateSummaryStats() {
    // Update the summary statistics display
    if (focusSessionsCount) {
      focusSessionsCount.textContent = todayFocusSessions;
    }
    if (totalMinutesCount) {
      totalMinutesCount.textContent = todayFocusMinutes;
    }
  }

  // Initialize the application
  updateDisplay();
  updateQuote();
  updateSummaryStats();
});
