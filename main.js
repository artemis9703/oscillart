const input = document.getElementById('input');
const color_picker1 = document.getElementById('color1');
const color_picker2 = document.getElementById('color2');
const color_picker3 = document.getElementById('color3');
const vol_slider = document.getElementById('vol-slider');
const rec_toggle = document.getElementById('record');

var interval = null;
var reset = false;

var timepernote = 0;
var length = 0; 

const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

oscillator.start();
gainNode.gain.value = 0;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;

notes = new Map();
notes.set("C", 261.6);
notes.set("D", 293.7);
notes.set("E", 329.6);
notes.set("F", 349.2);
notes.set("G", 392.0);
notes.set("A", 440);
notes.set("B", 493.9);

function frequency(pitch) {
    freq = pitch / 10000;
    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    setting = setInterval(() => {gainNode.gain.value = vol_slider.value}, 1);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    setTimeout(() => { clearInterval(setting); gainNode.gain.value = 0; }, ((timepernote)-10));
}

function handle() {
    reset = true;
    audioCtx.resume();
    gainNode.gain.value = 0;
    var pplsNotes = String(input.value);
    var notelist = [];
    length = pplsNotes.length;
    timepernote = (6000 / length);
    for (i = 0; i < pplsNotes.length; i++) {
        notelist.push(notes.get(pplsNotes.charAt(i)));
    }    
    let j = 0;
    repeat = setInterval(() => {
        if (j < notelist.length) {
            frequency(parseInt(notelist[j]));
            drawWave();
        j++
        } else {
            clearInterval(repeat)
        }
    }, timepernote)
}

var counter = 0;
function drawWave() {
    clearInterval(interval);
    if (reset) {
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        ctx.moveTo(x,y);
        ctx.beginPath();
    }
    counter = 0;
    interval = setInterval(line, 20);
    reset = false;
}

function line() {
    y = height/2 + ((vol_slider.value/100)*40 * Math.sin(x * 2 * Math.PI * freq * (0.5 * length)));
    const gradient = ctx.createLinearGradient(20, 0, 220, 0);
    gradient.addColorStop(0, color_picker1.value);
    gradient.addColorStop(0.5, color_picker2.value);
    gradient.addColorStop(1, color_picker3.value);
    ctx.strokeStyle = gradient;
    ctx.lineTo(x, y);
    ctx.stroke();
    x = x + 1;
    counter++;
    if(counter > timepernote/20) {
        clearInterval(interval);
    }
}

var blob, recorder = null;
var chunks = [];

function startRecording() {
    const canvasStream = canvas.captureStream(20);
    const audioDestination = audioCtx.createMediaStreamDestination();
    gainNode.connect(audioDestination);
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'superAwesomeMusic.webm';
        a.click();
        URL.revokeObjectURL(url);
    };
    recorder.start();
}

var is_recording = false;
function toggle() {
    is_recording = !is_recording;
    if(is_recording) {
        recording_toggle.innerHTML = "stop recording";
        startRecording();
    } else {
        recording_toggle.innerHTML = "start recording";
        recorder.stop();
    }
}