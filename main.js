document.addEventListener('DOMContentLoaded', () => {
    // Select all custom players on the page
    const customPlayers = document.querySelectorAll('.custom-player');

    // Store all global audio elements to manage pausing others when one plays
    const allAudioElements = Array.from(document.querySelectorAll('.hidden-audio'));

    customPlayers.forEach(player => {
        // Find elements within the specific custom player container
        const playBtn = player.querySelector('.play-btn');
        const playIcon = player.querySelector('.play-icon');
        const progressBar = player.closest('.beat-strip').querySelector('.progress-bar');
        const volumeBar = player.querySelector('.volume-bar');
        const currentTimeEl = player.querySelector('.current-time');
        const durationTimeEl = player.querySelector('.duration-time');

        // Find the corresponding hidden audio element (sibling of custom-player)
        const audio = player.previousElementSibling;

        // Initialize duration when metadata loads
        audio.addEventListener('loadedmetadata', () => {
            durationTimeEl.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
            audio.currentTime = 0;
            progressBar.value = 0;
            currentTimeEl.textContent = formatTime(0);
            progressBar.style.setProperty('--progress', `${(0 / audio.duration) * 100 || 0}%`);
        });

        // Initialize duration for already loaded audio
        if (audio.readyState >= 1) {
            durationTimeEl.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
            audio.currentTime = 0;
            progressBar.value = 0;
            currentTimeEl.textContent = formatTime(0);
            progressBar.style.setProperty('--progress', `${(0 / audio.duration) * 100 || 0}%`);
        }

        // --- Play / Stop Logic ---
        playBtn.addEventListener('click', () => {
            if (!audio.paused) { // currently playing -> STOP
                audio.pause();
                audio.currentTime = 0;
                progressBar.value = 0;
                currentTimeEl.textContent = formatTime(0);
                progressBar.style.setProperty('--progress', `${(0 / audio.duration) * 100 || 0}%`);
                playIcon.style.color = "inherit";
                playIcon.style.filter = "none";
            } else { // currently paused -> PLAY
                // Stop all other audio elements globally
                allAudioElements.forEach(otherAudio => {
                    if (otherAudio !== audio && !otherAudio.paused) {
                        otherAudio.pause();
                        otherAudio.currentTime = 0;

                        // Find the corresponding play button and reset it
                        const otherPlayer = otherAudio.nextElementSibling;
                        const otherPlayIcon = otherPlayer.querySelector('.play-icon');
                        const otherProgressBar = otherPlayer.closest('.beat-strip').querySelector('.progress-bar');
                        const otherCurrentTimeEl = otherPlayer.querySelector('.current-time');

                        otherProgressBar.value = 0;
                        otherCurrentTimeEl.textContent = formatTime(0);
                        otherProgressBar.style.setProperty('--progress', `${(0 / otherAudio.duration) * 100 || 0}%`);
                        otherPlayIcon.style.color = "inherit";
                        otherPlayIcon.style.filter = "none";
                    }
                });

                audio.play();
                playIcon.style.color = "var(--accent-electric)";
                playIcon.style.filter = "drop-shadow(0 0 8px var(--accent-electric))";
            }
        });

        // Handle Audio End
        audio.addEventListener('ended', () => {
            playIcon.style.color = "inherit";
            playIcon.style.filter = "none";
            audio.currentTime = 0;
            progressBar.value = 0;
            progressBar.style.setProperty('--progress', `${(0 / audio.duration) * 100 || 0}%`);
            currentTimeEl.textContent = formatTime(0);
        });

        // --- Progress Bar Logic ---
        audio.addEventListener('timeupdate', () => {
            progressBar.value = audio.currentTime;
            const progressPercent = (audio.currentTime / audio.duration) * 100 || 0;
            progressBar.style.setProperty('--progress', `${progressPercent}%`);
            currentTimeEl.textContent = formatTime(audio.currentTime);

            // Safety check if duration didn't load properly initially
            if (durationTimeEl.textContent === "0:00" || durationTimeEl.textContent === "NaN:NaN") {
                durationTimeEl.textContent = formatTime(audio.duration);
                progressBar.max = audio.duration;
            }
        });

        progressBar.addEventListener('input', () => {
            audio.currentTime = progressBar.value;
            const progressPercent = (audio.currentTime / audio.duration) * 100 || 0;
            progressBar.style.setProperty('--progress', `${progressPercent}%`);
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        // --- Volume Logic ---
        volumeBar.addEventListener('input', () => {
            // Volume ranges from 0.0 to 1.0 in HTML5 audio
            const volumeValue = volumeBar.value / 100;
            audio.volume = volumeValue;
        });

        // Initialize volume
        audio.volume = volumeBar.value / 100;
    });

    // Helper: Format seconds to M:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // --- Video Mute/Unmute Logic ---
    const bgVideo = document.getElementById('bgVideo');
    const videoMuteBtn = document.getElementById('videoMuteBtn');

    if (bgVideo && videoMuteBtn) {
        bgVideo.volume = 0.7; // 70% volume by default
        const iconMuted = videoMuteBtn.querySelector('.icon-muted');
        const iconUnmuted = videoMuteBtn.querySelector('.icon-unmuted');

        videoMuteBtn.addEventListener('click', () => {
            bgVideo.muted = !bgVideo.muted;

            if (bgVideo.muted) {
                iconMuted.classList.remove('hidden');
                iconUnmuted.classList.add('hidden');
                videoMuteBtn.classList.remove('active');
            } else {
                iconMuted.classList.add('hidden');
                iconUnmuted.classList.remove('hidden');
                videoMuteBtn.classList.add('active');
            }
        });
    }

    // --- Email Copy to Clipboard Logic ---
    const emailBtn = document.querySelector('.email-dock');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText('olczaakyt@gmail.com').then(() => {
                const originalTooltip = emailBtn.getAttribute('data-tooltip');
                emailBtn.setAttribute('data-tooltip', 'Copied!');

                // Force tooltip visibility via a temporary class if needed, or rely on hover remaining active
                setTimeout(() => {
                    emailBtn.setAttribute('data-tooltip', originalTooltip);
                }, 2000);
            });
        });
    }
});
