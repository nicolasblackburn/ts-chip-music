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
    OscillatorType[OscillatorType["Noise"] = 4] = "Noise";
})(OscillatorType = exports.OscillatorType || (exports.OscillatorType = {}));
var AudioContextWrapper = /** @class */ (function () {
    function AudioContextWrapper() {
        this.sources = [];
        this.context = new AudioContext();
    }
    AudioContextWrapper.prototype.playNotesAtTime = function (oscillatorType, tempo, notes, time, audio) {
        var currentTime = time;
        var parsedNotes;
        if (typeof notes === 'string') {
            parsedNotes = this.parseNotes(notes);
        }
        else {
            parsedNotes = notes;
        }
        try {
            for (var parsedNotes_1 = __values(parsedNotes), parsedNotes_1_1 = parsedNotes_1.next(); !parsedNotes_1_1.done; parsedNotes_1_1 = parsedNotes_1.next()) {
                var _a = __read(parsedNotes_1_1.value, 4), note = _a[0], octave = _a[1], duration = _a[2], volume = _a[3];
                this.playAtTime(oscillatorType, tempo, this.freqOfNote(note, octave), duration, volume, currentTime);
                currentTime += duration;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (parsedNotes_1_1 && !parsedNotes_1_1.done && (_b = parsedNotes_1.return)) _b.call(parsedNotes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var e_1, _b;
    };
    AudioContextWrapper.prototype.stop = function () {
        try {
            for (var _a = __values(this.sources), _b = _a.next(); !_b.done; _b = _a.next()) {
                var source = _b.value;
                source.disconnect();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var e_2, _c;
    };
    AudioContextWrapper.prototype.createOscillator = function (type) {
        var oscillator;
        switch (type) {
            case OscillatorType.Square:
                oscillator = this.context.createOscillator();
                oscillator.type = 'square';
                break;
            case OscillatorType.Sawtooth:
                oscillator = this.context.createOscillator();
                oscillator.type = 'sawtooth';
                break;
            case OscillatorType.Triangle:
                oscillator = this.context.createOscillator();
                oscillator.type = 'triangle';
                break;
            case OscillatorType.Noise:
                oscillator = this.createNoiseOscillator();
                break;
            case OscillatorType.Sine:
            default:
                oscillator = this.context.createOscillator();
        }
        this.sources.push(oscillator);
        return oscillator;
    };
    /**
     * Creates a 1 second sampled noise oscillator.
     */
    AudioContextWrapper.prototype.createNoiseOscillator = function () {
        var framesCount = this.context.sampleRate * 1;
        var buffer = this.context.createBuffer(1, framesCount, this.context.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < framesCount; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        var oscillator = this.context.createBufferSource();
        oscillator.buffer = buffer;
        oscillator.loop = true;
        return oscillator;
    };
    AudioContextWrapper.prototype.freqOfNote = function (note, octave) {
        return Math.pow(2, (octave * 12 + note - 57) / 12) * 440;
    };
    AudioContextWrapper.prototype.parseNotes = function (notes) {
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
    };
    AudioContextWrapper.prototype.playAtTime = function (oscillatorType, tempo, freq, duration, volume, time) {
        var o = this.createOscillator(oscillatorType);
        var g = this.context.createGain();
        var startTime = this.context.currentTime + time * 60 / tempo;
        var endTime = this.context.currentTime + (time + duration) * 60 / tempo;
        var smallDeltaTime = 0.03;
        var minGain = 0.0001;
        var maxGain = Math.max(0.2 * volume, minGain);
        if (o instanceof OscillatorNode) {
            o.frequency.value = freq;
        }
        else if (o instanceof AudioBufferSourceNode) {
            o.playbackRate.setValueAtTime(freq / 7040, time);
        }
        g.gain.setValueAtTime(minGain, startTime);
        g.gain.exponentialRampToValueAtTime(maxGain, startTime + smallDeltaTime);
        g.gain.setValueAtTime(maxGain, endTime - smallDeltaTime);
        g.gain.exponentialRampToValueAtTime(minGain, endTime);
        o.connect(g);
        g.connect(this.context.destination);
        o.start(startTime);
        o.stop(endTime);
    };
    return AudioContextWrapper;
}());
exports.AudioContextWrapper = AudioContextWrapper;
