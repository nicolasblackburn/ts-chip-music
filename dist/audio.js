"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var OscillatorType;
(function (OscillatorType) {
    OscillatorType[OscillatorType["Sine"] = 0] = "Sine";
    OscillatorType[OscillatorType["Square"] = 1] = "Square";
    OscillatorType[OscillatorType["Sawtooth"] = 2] = "Sawtooth";
    OscillatorType[OscillatorType["Triangle"] = 3] = "Triangle";
})(OscillatorType = exports.OscillatorType || (exports.OscillatorType = {}));
function createOscillator(type, ctx) {
    switch (type) {
        case OscillatorType.Sine:
            return ctx.createOscillator();
        case OscillatorType.Square:
            return (function () {
                var oscillator = ctx.createOscillator();
                oscillator.type = 'square';
                return oscillator;
            })();
        case OscillatorType.Sawtooth:
            return (function () {
                var oscillator = ctx.createOscillator();
                oscillator.type = 'sawtooth';
                return oscillator;
            })();
        case OscillatorType.Triangle:
            return (function () {
                var oscillator = ctx.createOscillator();
                oscillator.type = 'triangle';
                return oscillator;
            })();
    }
}
exports.createOscillator = createOscillator;
function freqOfNote(note, octave) {
    return Math.pow(2, (octave * 12 + note - 57) / 12) * 440;
}
exports.freqOfNote = freqOfNote;
function playAtTime(oscillatorType, tempo, freq, duration, volume, time, ctx) {
    var o = createOscillator(oscillatorType, ctx);
    var g = ctx.createGain();
    var startTime = ctx.currentTime + time * 60 / tempo;
    var endTime = ctx.currentTime + (time + duration) * 60 / tempo;
    var smallDeltaTime = 0.03;
    var minGain = 0.0001;
    var maxGain = Math.max(0.2 * volume, minGain);
    o.frequency.value = freq;
    g.gain.setValueAtTime(minGain, startTime);
    g.gain.exponentialRampToValueAtTime(maxGain, startTime + smallDeltaTime);
    g.gain.setValueAtTime(maxGain, endTime - smallDeltaTime);
    g.gain.exponentialRampToValueAtTime(minGain, endTime);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(startTime);
    o.stop(endTime);
}
exports.playAtTime = playAtTime;
function playNotesAtTime(oscillatorType, tempo, notes, time, ctx) {
    var currentTime = time;
    try {
        for (var notes_1 = __values(notes), notes_1_1 = notes_1.next(); !notes_1_1.done; notes_1_1 = notes_1.next()) {
            var _a = __read(notes_1_1.value, 4), note = _a[0], octave = _a[1], duration = _a[2], volume = _a[3];
            playAtTime(oscillatorType, tempo, freqOfNote(note, octave), duration, volume, currentTime, ctx);
            currentTime += duration;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (notes_1_1 && !notes_1_1.done && (_b = notes_1.return)) _b.call(notes_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var e_1, _b;
}
exports.playNotesAtTime = playNotesAtTime;
function parseNotes(notes) {
    var noteToIntMap = {
        'c': 0,
        'd': 2,
        'e': 4,
        'f': 5,
        'g': 7,
        'a': 9,
        'b': 11
    };
    var accentToIntMap = {
        '#': 1,
        'b': -1
    };
    var durationToFloatMap = {
        'z': 5,
        'l': 4,
        'i': 3,
        'u': 2,
        'w': 1,
        'h': 0.5,
        'q': 0.25,
        'e': 0.125,
        's': 0.0625,
        't': 0.03125,
        'x': 0.015625,
        'o': 0.0078125
    };
    var data = [];
    var tokenRe = /^([^\s\n\r\t]+)(?:[\s\n\r\t]+(.*))?$/;
    var noteRe = /^([abcdefg-][#b]?[0-9]?)?([zliuwhqestxo]\.*[0-9]?)?(v(?:1(?:\.0*)?|0?\.[0-9]*))?$/;
    var pitchRe = /^([abcdefg-])([#b])?([0-9])?$/;
    var durationRe = /^([zliuwhqestxo])(\.*)?([0-9])?$/;
    var volumeRe = /^v(.+)$/;
    var buffer = notes.trim();
    var tokens = buffer.match(tokenRe);
    var lastOctave = 4;
    var lastNote = 0;
    var lastDuration = 0;
    var lastVolume = 1;
    var isRest = false;
    while (tokens) {
        var _a = __read(tokens, 3), _ = _a[0], note = _a[1], rest = _a[2];
        var noteTokens = note.match(noteRe);
        var noteData = [lastNote, lastDuration, lastVolume];
        if (noteTokens) {
            var _b = __read(noteTokens, 4), _1 = _b[0], pitch = _b[1], duration = _b[2], volume = _b[3];
            if (pitch) {
                var _c = __read(pitch.match(pitchRe) || [undefined, undefined, undefined, undefined], 4), _2 = _c[0], note_1 = _c[1], accent = _c[2], octave = _c[3];
                var noteValue = void 0;
                if (note_1) {
                    if (note_1 === '-') {
                        isRest = true;
                        lastNote = 0;
                        lastOctave = 0;
                    }
                    else {
                        noteValue = noteToIntMap[note_1];
                        if (accent) {
                            noteValue += accentToIntMap[accent];
                        }
                        if (noteValue !== undefined) {
                            lastNote = noteValue;
                        }
                        if (octave !== undefined) {
                            lastOctave = parseInt(octave);
                        }
                    }
                }
            }
            if (duration) {
                var _d = __read(duration.match(durationRe) || [undefined, undefined, undefined, undefined, undefined], 4), _3 = _d[0], dur = _d[1], dots = _d[2], tuplet = _d[3];
                lastDuration = dur !== undefined && durationToFloatMap[dur] || lastDuration;
                if (dots !== undefined) {
                    lastDuration *= Math.pow(1.5, dots.length);
                }
                if (tuplet) {
                    lastDuration /= parseInt(tuplet);
                }
            }
            if (volume) {
                var _e = __read(volume.match(volumeRe) || [undefined, undefined], 2), _4 = _e[0], vol = _e[1];
                if (vol !== undefined) {
                    lastVolume = parseFloat(vol);
                }
            }
            data.push([lastNote, lastOctave, lastDuration, isRest ? 0 : lastVolume]);
        }
        buffer = rest;
        tokens = buffer && buffer.match(tokenRe) || null;
        isRest = false;
    }
    return data;
}
exports.parseNotes = parseNotes;
