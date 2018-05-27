"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var audio = __importStar(require("./audio"));
var audioContext = new audio.AudioContextWrapper();
Object.assign(window, __assign({ audio: audioContext }, audio));
var button = document.createElement('button');
button.type = 'button';
button.innerText = 'Play example';
button.addEventListener('click', function () {
    audioContext.playNotesAtTime(audio.OscillatorType.Triangle, 60, 'c3q c d# c3 g#2 g# a# g# '.repeat(2) + 'a#2q a# c3 a#2 f f g# f '.repeat(2), 0, audioContext);
    audioContext.playNotesAtTime(audio.OscillatorType.Noise, 60, 'c3qv0.35 c c6 c3 c c c6h '.repeat(4), 0, audioContext);
});
document.body.appendChild(button);
