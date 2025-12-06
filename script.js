// ===============================================
// COUNTDOWN TIMER - JAVASCRIPT LOGIC
// Web APIs: Notification API + Audio API
// ===============================================

// ===== DOM ELEMENTS =====
const secondsInput = document.getElementById('seconds-input');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timeDisplay = document.getElementById('time-display');
const statusMessage = document.getElementById('status-message');
const progressCircle = document.getElementById('progress-circle');
const presetButtons = document.querySelectorAll('.preset-btn');

// ===== STATE VARIABLES =====
let countdownInterval = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let isPaused = false;
let isRunning = false;

// ===== AUDIO SETUP =====
// Create audio context for the beep sound
let audioContext = null;
let hasPlayedSound = false;

// Initialize Audio Context (needed for Web Audio API)
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play alert beep sound using Web Audio API
function playAlertSound() {
    if (hasPlayedSound) return;
    
    initAudioContext();
    
    // Create oscillator (sound generator)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound (frequency and type)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz frequency
    oscillator.type = 'sine'; // Sine wave for smooth beep
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Play multiple beeps
    setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
    }, 200);
    
    setTimeout(() => {
        const oscillator3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        oscillator3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        oscillator3.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator3.type = 'sine';
        gainNode3.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator3.start(audioContext.currentTime);
        oscillator3.stop(audioContext.currentTime + 0.5);
    }, 400);
    
    hasPlayedSound = true;
}

// ===== NOTIFICATION SETUP =====
// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                updateStatus('✅ Notifications enabled!', 'running');
                setTimeout(() => updateStatus(''), 2000);
            } else if (permission === 'denied') {
                updateStatus('⚠️ Notifications blocked', 'paused');
                setTimeout(() => updateStatus(''), 3000);
            }
        });
    }
}

// Show notification when timer finishes
function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('⏰ Timer Finished!', {
            body: 'Your countdown timer has completed!',
            icon: '⏰',
            badge: '⏰',
            tag: 'countdown-timer',
            requireInteraction: false,
            silent: false
        });
        
        // Auto-close notification after 5 seconds
        setTimeout(() => notification.close(), 5000);
        
        // Optional: Handle notification click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

// ===== COUNTDOWN LOGIC =====
// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Update the time display
function updateDisplay() {
    timeDisplay.textContent = formatTime(remainingSeconds);
    updateProgressRing();
}

// Update progress ring animation
function updateProgressRing() {
    const circumference = 2 * Math.PI * 90; // radius = 90
    const progress = remainingSeconds / totalSeconds;
    const offset = circumference - (progress * circumference);
    progressCircle.style.strokeDashoffset = offset;
    
    // Change color based on remaining time
    if (progress > 0.5) {
        progressCircle.style.stroke = '#667eea';
    } else if (progress > 0.25) {
        progressCircle.style.stroke = '#f5576c';
    } else {
        progressCircle.style.stroke = '#ff6b6b';
    }
}

// Update status message
function updateStatus(message, type = '') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

// Start the countdown
function startCountdown() {
    // If not running, initialize
    if (!isRunning) {
        const inputValue = parseInt(secondsInput.value);
        
        // Validate input
        if (!inputValue || inputValue < 1) {
            updateStatus('⚠️ Please enter a valid number of seconds', 'paused');
            secondsInput.classList.add('shake');
            setTimeout(() => secondsInput.classList.remove('shake'), 500);
            return;
        }
        
        if (inputValue > 3600) {
            updateStatus('⚠️ Maximum 3600 seconds (1 hour)', 'paused');
            secondsInput.classList.add('shake');
            setTimeout(() => secondsInput.classList.remove('shake'), 500);
            return;
        }
        
        // Initialize countdown
        totalSeconds = inputValue;
        remainingSeconds = inputValue;
        isRunning = true;
        isPaused = false;
        hasPlayedSound = false;
        
        // Request notification permission if needed
        if (Notification.permission === 'default') {
            requestNotificationPermission();
        }
        
        // Disable input
        secondsInput.disabled = true;
        
        // Update button
        startBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        startBtn.classList.add('paused');
        
        // Enable reset button
        resetBtn.disabled = false;
        
        updateDisplay();
        updateStatus('⏱️ Timer running...', 'running');
    } 
    // Toggle pause/resume
    else if (isPaused) {
        // Resume
        isPaused = false;
        startBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        startBtn.classList.add('paused');
        updateStatus('⏱️ Timer running...', 'running');
    } else {
        // Pause
        isPaused = true;
        startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Resume</span>';
        startBtn.classList.remove('paused');
        updateStatus('⏸️ Timer paused', 'paused');
        return;
    }
    
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Start interval
    countdownInterval = setInterval(() => {
        if (!isPaused && remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
            
            // Warning when time is low
            if (remainingSeconds === 10) {
                updateStatus('⚠️ 10 seconds remaining!', 'paused');
            } else if (remainingSeconds === 5) {
                updateStatus('⚠️ 5 seconds remaining!', 'paused');
            } else if (remainingSeconds === 3) {
                timeDisplay.parentElement.classList.add('celebrate');
            }
            
            // Timer finished
            if (remainingSeconds === 0) {
                clearInterval(countdownInterval);
                timerFinished();
            }
        }
    }, 1000);
}

// Handle timer completion
function timerFinished() {
    isRunning = false;
    isPaused = false;
    
    // Update UI
    updateStatus('🎉 Timer finished!', 'finished');
    startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start Timer</span>';
    startBtn.classList.remove('paused');
    
    // Add celebration animation
    timeDisplay.parentElement.classList.add('celebrate');
    setTimeout(() => {
        timeDisplay.parentElement.classList.remove('celebrate');
    }, 600);
    
    // Play sound
    playAlertSound();
    
    // Show notification
    showNotification();
    
    // Auto-refresh and reset after a delay
    setTimeout(() => {
        secondsInput.disabled = false;
        resetBtn.disabled = true;
        
        // Auto-refresh to ready state
        updateStatus('✨ Ready for next timer!', 'running');
        setTimeout(() => {
            updateStatus('');
        }, 2000);
    }, 3000);
}

// Reset the countdown
function resetCountdown() {
    // Clear interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Reset state
    isRunning = false;
    isPaused = false;
    remainingSeconds = 0;
    totalSeconds = 0;
    hasPlayedSound = false;
    
    // Reset UI
    updateDisplay();
    updateStatus('');
    secondsInput.disabled = false;
    resetBtn.disabled = true;
    startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start Timer</span>';
    startBtn.classList.remove('paused');
    
    // Reset progress ring
    progressCircle.style.strokeDashoffset = 565.48;
    progressCircle.style.stroke = '#667eea';
    
    // Clear animations
    timeDisplay.parentElement.classList.remove('celebrate');
    
    // Clear preset button active states
    presetButtons.forEach(btn => btn.classList.remove('active'));
}

// ===== EVENT LISTENERS =====
startBtn.addEventListener('click', startCountdown);
resetBtn.addEventListener('click', resetCountdown);

// Preset button handlers
presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) return; // Don't allow changing while running
        
        const seconds = parseInt(btn.getAttribute('data-seconds'));
        secondsInput.value = seconds;
        
        // Visual feedback
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Animate input
        secondsInput.classList.add('celebrate');
        setTimeout(() => {
            secondsInput.classList.remove('celebrate');
        }, 600);
        
        updateStatus(`⚡ ${seconds}s selected!`, 'running');
        setTimeout(() => updateStatus(''), 1500);
    });
});

// Allow Enter key to start timer
secondsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isRunning) {
        startCountdown();
    }
});

// Prevent negative numbers
secondsInput.addEventListener('input', (e) => {
    if (e.target.value < 0) {
        e.target.value = 0;
    }
});

// ===== INITIALIZATION =====
// Initialize display
updateDisplay();
resetBtn.disabled = true;

// Add SVG gradient dynamically
const svg = document.querySelector('.progress-svg');
const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
gradient.setAttribute('id', 'gradient');
gradient.setAttribute('x1', '0%');
gradient.setAttribute('y1', '0%');
gradient.setAttribute('x2', '100%');
gradient.setAttribute('y2', '100%');

const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop1.setAttribute('offset', '0%');
stop1.setAttribute('style', 'stop-color:#667eea;stop-opacity:1');

const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop2.setAttribute('offset', '100%');
stop2.setAttribute('style', 'stop-color:#764ba2;stop-opacity:1');

gradient.appendChild(stop1);
gradient.appendChild(stop2);
defs.appendChild(gradient);
svg.insertBefore(defs, svg.firstChild);

// Show initial notification permission prompt after 2 seconds
setTimeout(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        updateStatus('💡 Tip: Enable notifications for alerts!', 'running');
        setTimeout(() => updateStatus(''), 4000);
    }
}, 2000);

console.log('🎉 Countdown Timer initialized!');
console.log('📚 Web APIs used: Notification API + Web Audio API');
