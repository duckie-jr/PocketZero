import { AppRegistry } from './registry.js';
import { Router } from './router.js';
import { ICON_MUSIC, ICON_BACK } from '../icons/svg.js';

AppRegistry.register({
    id: 'music',
    name: 'Music',
    icon: ICON_MUSIC,
    removable: false,
    render: renderMusic,
});

function renderMusic(container) {
    let audioContext = null;
    let analyserNode = null;
    let sourceNode = null;
    let animFrameId = null;
    const playlist = [];
    let currentTrackIndex = 0;
    let audioElement = null;

    container.innerHTML = `
        <div class="app-chrome">
            <button class="app-chrome-btn" id="music-back">${ICON_BACK}</button>
            <span class="app-chrome-title">Music</span>
            <span style="width:36px"></span>
        </div>
        <div class="app-body" style="align-items:center;gap:16px">
            <canvas id="music-visualizer" width="300" height="80" style="width:100%;max-width:360px;border-radius:12px;background:var(--bg-tertiary)"></canvas>
            <div class="card" style="width:100%;max-width:360px">
                <div id="music-track-title" style="font-size:16px;font-weight:600;color:var(--text-primary);text-align:center;margin-bottom:4px">No track loaded</div>
                <div id="music-track-index" style="font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:12px">--</div>
                <input type="range" id="music-progress" min="0" max="100" value="0" style="width:100%;accent-color:var(--accent);margin-bottom:8px" />
                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:14px">
                    <span id="music-current-time">0:00</span>
                    <span id="music-duration">0:00</span>
                </div>
                <div style="display:flex;justify-content:center;align-items:center;gap:16px">
                    <button class="pz-btn secondary" id="music-prev" style="padding:10px 16px">&#9664;&#9664;</button>
                    <button class="pz-btn" id="music-play" style="padding:10px 20px;font-size:18px">&#9654;</button>
                    <button class="pz-btn secondary" id="music-next" style="padding:10px 16px">&#9654;&#9654;</button>
                    <button class="pz-btn secondary" id="music-shuffle" style="padding:10px 14px;font-size:12px">Shuffle</button>
                </div>
            </div>
            <div class="card" style="width:100%;max-width:360px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                    <span style="font-size:14px;font-weight:600;color:var(--text-primary)">Playlist</span>
                    <label class="pz-btn secondary" style="padding:6px 12px;font-size:12px;cursor:pointer">
                        Add Files
                        <input type="file" id="music-file-input" accept="audio/*" multiple style="display:none" />
                    </label>
                </div>
                <div id="music-playlist" style="display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto">
                    <div style="color:var(--text-muted);font-size:13px;text-align:center;padding:16px">
                        No tracks — click Add Files to load audio
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('music-back').addEventListener('click', () => {
        cancelAnimationFrame(animFrameId);
        Router.home();
    });

    audioElement = new Audio();
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', playNext);

    document.getElementById('music-file-input').addEventListener('change', (e) => {
        Array.from(e.target.files).forEach((file) => {
            playlist.push({ name: file.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(file) });
        });
        renderPlaylist();
        if (playlist.length === e.target.files.length) loadTrack(0);
    });

    document.getElementById('music-play').addEventListener('click', togglePlay);
    document.getElementById('music-prev').addEventListener('click', playPrev);
    document.getElementById('music-next').addEventListener('click', playNext);
    document.getElementById('music-shuffle').addEventListener('click', shufflePlaylist);

    document.getElementById('music-progress').addEventListener('input', (e) => {
        if (audioElement.duration) {
            audioElement.currentTime = (e.target.value / 100) * audioElement.duration;
        }
    });

    function loadTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        currentTrackIndex = index;
        audioElement.src = playlist[index].url;
        document.getElementById('music-track-title').textContent = playlist[index].name;
        document.getElementById('music-track-index').textContent = `Track ${index + 1} of ${playlist.length}`;
        renderPlaylist();
        setupVisualizer();
        audioElement.play();
        document.getElementById('music-play').innerHTML = '&#9646;&#9646;';
    }

    function togglePlay() {
        if (playlist.length === 0) return;
        if (audioElement.paused) {
            audioElement.play();
            document.getElementById('music-play').innerHTML = '&#9646;&#9646;';
            drawVisualizer();
        } else {
            audioElement.pause();
            document.getElementById('music-play').innerHTML = '&#9654;';
            cancelAnimationFrame(animFrameId);
        }
    }

    function playNext() {
        if (playlist.length === 0) return;
        loadTrack((currentTrackIndex + 1) % playlist.length);
    }

    function playPrev() {
        if (playlist.length === 0) return;
        loadTrack((currentTrackIndex - 1 + playlist.length) % playlist.length);
    }

    function shufflePlaylist() {
        for (let i = playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
        }
        renderPlaylist();
        if (playlist.length > 0) loadTrack(0);
    }

    function updateProgress() {
        const progress = document.getElementById('music-progress');
        const currentTimeEl = document.getElementById('music-current-time');
        const durationEl = document.getElementById('music-duration');
        if (audioElement.duration) {
            progress.value = (audioElement.currentTime / audioElement.duration) * 100;
            currentTimeEl.textContent = formatTime(audioElement.currentTime);
            durationEl.textContent = formatTime(audioElement.duration);
        }
    }

    function formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function renderPlaylist() {
        const listEl = document.getElementById('music-playlist');
        if (!listEl) return;
        if (playlist.length === 0) {
            listEl.innerHTML = `<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:16px">No tracks — click Add Files to load audio</div>`;
            return;
        }
        listEl.innerHTML = playlist.map((track, index) => `
            <div class="playlist-item" data-index="${index}" style="padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;background:${index === currentTrackIndex ? 'var(--accent)' : 'var(--bg-tertiary)'};color:${index === currentTrackIndex ? '#fff' : 'var(--text-primary)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background 0.15s">
                ${escapeHtml(track.name)}
            </div>
        `).join('');

        listEl.querySelectorAll('.playlist-item').forEach((item) => {
            item.addEventListener('click', () => loadTrack(parseInt(item.dataset.index)));
        });
    }

    function setupVisualizer() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 64;
            sourceNode = audioContext.createMediaElementSource(audioElement);
            sourceNode.connect(analyserNode);
            analyserNode.connect(audioContext.destination);
        }
        drawVisualizer();
    }

    function drawVisualizer() {
        const canvas = document.getElementById('music-visualizer');
        if (!canvas || !analyserNode) return;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        function frame() {
            animFrameId = requestAnimationFrame(frame);
            analyserNode.getByteFrequencyData(dataArray);
            ctx.fillStyle = isDark ? '#3a3a3c' : '#e5e5ea';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2;
            let xPos = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                ctx.fillStyle = `hsl(${211 + i * 2}, 100%, 55%)`;
                ctx.beginPath();
                ctx.roundRect(xPos, canvas.height - barHeight, barWidth - 2, barHeight, 2);
                ctx.fill();
                xPos += barWidth;
            }
        }
        frame();
    }
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
