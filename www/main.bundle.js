"use strict";
(() => {
  // src/audio.ts
  var OscillatorType = /* @__PURE__ */ ((OscillatorType2) => {
    OscillatorType2[OscillatorType2["Sine"] = 0] = "Sine";
    OscillatorType2[OscillatorType2["Square"] = 1] = "Square";
    OscillatorType2[OscillatorType2["Sawtooth"] = 2] = "Sawtooth";
    OscillatorType2[OscillatorType2["Triangle"] = 3] = "Triangle";
    OscillatorType2[OscillatorType2["Noise"] = 4] = "Noise";
    return OscillatorType2;
  })(OscillatorType || {});
  var PlayAudioContext = class {
    constructor() {
      this.sources = [];
      this.context = new AudioContext();
    }
    play(oscillatorType, tempo2, notes, time = 0) {
      let currentTime = time;
      let parsedNotes;
      if (typeof notes === "string") {
        parsedNotes = this.parseNotes(notes);
      } else {
        parsedNotes = notes;
      }
      for (const [note, octave, duration, volume] of parsedNotes) {
        this.playAtTime(oscillatorType, tempo2, this.freqOfNote(note, octave), duration, volume, currentTime);
        currentTime += duration;
      }
    }
    stop() {
      for (const source of this.sources) {
        source.disconnect();
      }
    }
    createOscillator(type) {
      let oscillator;
      switch (type) {
        case 1 /* Square */:
          oscillator = this.context.createOscillator();
          oscillator.type = "square";
          break;
        case 2 /* Sawtooth */:
          oscillator = this.context.createOscillator();
          oscillator.type = "sawtooth";
          break;
        case 3 /* Triangle */:
          oscillator = this.context.createOscillator();
          oscillator.type = "triangle";
          break;
        case 4 /* Noise */:
          oscillator = this.createNoiseOscillator();
          break;
        case 0 /* Sine */:
        default:
          oscillator = this.context.createOscillator();
      }
      this.sources.push(oscillator);
      return oscillator;
    }
    /**
     * Creates a 1 second sampled noise oscillator.
     */
    createNoiseOscillator() {
      const framesCount = this.context.sampleRate * 1;
      const buffer = this.context.createBuffer(1, framesCount, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < framesCount; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const oscillator = this.context.createBufferSource();
      oscillator.buffer = buffer;
      oscillator.loop = true;
      return oscillator;
    }
    freqOfNote(note, octave) {
      return Math.pow(2, (octave * 12 + note - 57) / 12) * 440;
    }
    parseNotes(notes) {
      const noteToIntMap = {
        "c": 0,
        "d": 2,
        "e": 4,
        "f": 5,
        "g": 7,
        "a": 9,
        "b": 11
      };
      const accentToIntMap = {
        "#": 1,
        "b": -1
      };
      const durationToFloatMap = {
        "z": 5,
        "l": 4,
        "i": 3,
        "u": 2,
        "w": 1,
        "h": 0.5,
        "q": 0.25,
        "e": 0.125,
        "s": 0.0625,
        "t": 0.03125,
        "x": 0.015625,
        "o": 78125e-7
      };
      const data = [];
      const tokenRe = /^([^\s\n\r\t]+)(?:[\s\n\r\t]+(.*))?$/;
      const noteRe = /^([abcdefg-][#b]?[0-9]?)?([zliuwhqestxo]\.*[0-9]?)?(v(?:1(?:\.0*)?|0?\.[0-9]*))?$/;
      const pitchRe = /^([abcdefg-])([#b])?([0-9])?$/;
      const durationRe = /^([zliuwhqestxo])(\.*)?([0-9])?$/;
      const volumeRe = /^v(.+)$/;
      let buffer = notes.replace(/\s+/g, " ");
      let tokens = buffer.match(tokenRe);
      let lastOctave = 4;
      let lastNote = 0;
      let lastDuration = 0;
      let lastVolume = 1;
      let isRest = false;
      while (tokens) {
        const [_, note, rest] = tokens;
        const noteTokens = note.match(noteRe);
        const noteData = [lastNote, lastDuration, lastVolume];
        if (noteTokens) {
          const [_2, pitch, duration, volume] = noteTokens;
          if (pitch) {
            const [_3, note2, accent, octave] = pitch.match(pitchRe) || [void 0, void 0, void 0, void 0];
            let noteValue;
            if (note2) {
              if (note2 === "-") {
                isRest = true;
                lastNote = 0;
                lastOctave = 0;
              } else {
                noteValue = noteToIntMap[note2];
                if (accent) {
                  noteValue += accentToIntMap[accent];
                }
                if (noteValue !== void 0) {
                  lastNote = noteValue;
                }
                if (octave !== void 0) {
                  lastOctave = parseInt(octave);
                }
              }
            }
          }
          if (duration) {
            const [_3, dur, dots, tuplet] = duration.match(durationRe) || [void 0, void 0, void 0, void 0, void 0];
            lastDuration = dur !== void 0 && durationToFloatMap[dur] || lastDuration;
            if (dots !== void 0) {
              lastDuration *= Math.pow(1.5, dots.length);
            }
            if (tuplet) {
              lastDuration /= parseInt(tuplet);
            }
          }
          if (volume) {
            const [_3, vol] = volume.match(volumeRe) || [void 0, void 0];
            if (vol !== void 0) {
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
    playAtTime(oscillatorType, tempo2, freq, duration, volume, time) {
      const o = this.createOscillator(oscillatorType);
      const g = this.context.createGain();
      const startTime = this.context.currentTime + time * 60 / tempo2;
      const endTime = this.context.currentTime + (time + duration) * 60 / tempo2;
      const smallDeltaTime = 0.03;
      const minGain = 1e-4;
      const maxGain = Math.max(0.2 * volume, minGain);
      if (o instanceof OscillatorNode) {
        o.frequency.value = freq;
      } else if (o instanceof AudioBufferSourceNode) {
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
    }
  };

  // src/index.ts
  var context = new PlayAudioContext();
  var types = Object.entries(OscillatorType).filter(([k, v]) => !isNaN(Number(v)));
  var examples = [
    "",
    "",
    "",
    "c3q c d# c3 g#2 g# a# g# \n".repeat(2) + "a#2q a# c3 a#2 f f g# f \n".repeat(2),
    "c3qv0.35 c c6 c3 c c c6 c \n".repeat(4)
  ];
  var div = document.createElement("div");
  div.innerHTML = `
<label>Tempo: <input id="tempo" type="text" size="4" value="60" /></label>
<table>
<tbody>
  ${types.map(
    ([_, i]) => `<tr><td>
    <select id="type${i}">
      <option value="-1">None</option>
      ${types.map(
      ([k, v]) => `<option value="${v}" ${v === i && "selected"}>${k}</option>`
    ).join("")}
    </select>
  </td><td>
    <textarea id="notes${i}" rows="4">${examples[i]}</textarea>
  </td></tr>`
  ).join("")}
</tbody>
</table>
<button id="play" type="button">Play</button>
`;
  document.body.append(div);
  var tempo = document.getElementById("tempo");
  var channels = [...document.querySelectorAll("tr")].map((tr, i) => ({
    type: tr.querySelector("#type" + i),
    notes: tr.querySelector("#notes" + i)
  }));
  var play = document.getElementById("play");
  play.addEventListener("click", () => {
    try {
      for (const { type, notes } of channels) {
        if (Number(type.value) !== -1) {
          if (notes.value.trim()) {
            context.play(Number(type.value), Number(tempo.value), notes.value);
          }
        }
      }
    } catch (e) {
      alert(e.stack);
    }
  });
})();
