import * as audio from './audio';

const audioContext = new audio.AudioContextWrapper()
Object.assign(window, {
    audio: audioContext,
    ...audio
});

const button = document.createElement('button');
button.type = 'button';
button.innerText = 'Play example';
button.addEventListener('click', () => {
    audioContext.playNotesAtTime(audio.OscillatorType.Triangle, 60, 'c3q c d# c3 g#2 g# a# g# '.repeat(2) + 'a#2q a# c3 a#2 f f g# f '.repeat(2) , 0, audioContext);
    audioContext.playNotesAtTime(audio.OscillatorType.Noise, 60, 'c3qv0.35 c c6 c3 c c c6h '.repeat(4), 0, audioContext);
});
document.body.appendChild(button);