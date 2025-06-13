const input = document.getElementById('input');

const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

oscillator.start();
gainNode.gain.value = 0;

var interval = null;
var amplitude = 40;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var reset = true;
var timepernote = 0;
var length = 0;

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
    gainNode.gain.setValueAtTime(vol_slider.value, audioCtx.currentTime);
    setting = setInterval(() => {gainNode.gain.value = vol_slider.value}, 1);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    setTimeout(() => { clearInterval(setting); gainNode.gain.value = 0; }, ((timepernote)-10));
}

function handle() {
    var pplsNotes = String(input.value);
    var notelist = [];
    for (i = 0; i < pplsNotes.length; i++) {
        notelist.push(notes.get(pplsNotes.charAt(i)));
    }
    length = pplsNotes.length;
    timepernote = (6000 / length);
    let j = 0;
    repeat = setInterval(() => {
        if (j < notelist.length) {
            frequency(parseInt(notelist[j]));
            drawWave();
            j++;
        } else {
            clearInterval(repeat);
        }
    }, timepernote)
    audioCtx.resume();
    gainNode.gain.value = 0;
    drawWave();
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
    y = height/2 + vol_slider.value * Math.sin(x * 2 * Math.PI * freq * (0.5 * length));
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.strokeStyle = color_picker.value;
    x = x + 1;
    counter++;
    if(counter > 50) {
        clearInterval(interval);
    }
    ctx.stroke();
}
const color_picker = document.getElementById('color');
const vol_slider = document.getElementById('vol-slider');