
export enum OscillatorType {
    Sine,
    Square,
    Sawtooth,
    Triangle,
    Noise
}

export class PlayAudioContext {
    public sources: AudioNode[] = [];
    public context: AudioContext;

    constructor() {
        this.context = new AudioContext();
    }

    public play(oscillatorType: OscillatorType, tempo: number, notes: string | [number, number, number, number][], time: number = 0) {
        let currentTime = time;
        let parsedNotes;

        if (typeof notes === 'string') {
            parsedNotes = this.parseNotes(notes);
        } else {
            parsedNotes = notes;
        }

        for (const [note, octave, duration, volume] of parsedNotes) {
            this.playAtTime(oscillatorType, tempo, this.freqOfNote(note, octave), duration, volume, currentTime);
            currentTime += duration;
        }
    }

    public stop() {
        for (const source of this.sources) {
            source.disconnect();
        }
    }

    protected createOscillator(type: OscillatorType) {
        let oscillator;
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
    }

    /**
     * Creates a 1 second sampled noise oscillator.
     */
    public createNoiseOscillator() {
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

    protected freqOfNote(note: number, octave: number) {
        return Math.pow(2,(octave * 12 + note - 57) / 12) * 440;
    }

    protected parseNotes(notes: string) {
        const noteToIntMap: {[key: string]: number} = {
            'c': 0,
            'd': 2,
            'e': 4,
            'f': 5,
            'g': 7,
            'a': 9,
            'b': 11
        }; 
        const accentToIntMap: {[key: string]: number} = {
            '#': 1,
            'b': -1
        }
        const durationToFloatMap: {[key: string]: number} = {
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
        const data = [];
        const tokenRe = /^([^\s\n\r\t]+)(?:[\s\n\r\t]+(.*))?$/;
        const noteRe = /^([abcdefg-][#b]?[0-9]?)?([zliuwhqestxo]\.*[0-9]?)?(v(?:1(?:\.0*)?|0?\.[0-9]*))?$/;
        const pitchRe = /^([abcdefg-])([#b])?([0-9])?$/;
        const durationRe = /^([zliuwhqestxo])(\.*)?([0-9])?$/;
        const volumeRe = /^v(.+)$/;
        let buffer = notes.replace(/\s+/g, ' ');
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
                const [_, pitch, duration, volume] = noteTokens;
                if (pitch) {
                    const [_, note, accent, octave] = pitch.match(pitchRe) || [undefined, undefined, undefined, undefined];
                    let noteValue;
                    if (note) {
                        if (note === '-') {
                            isRest = true;
                            lastNote = 0;
                            lastOctave = 0;
                        } else {
                            noteValue = noteToIntMap[note];
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
                    const [_, dur, dots, tuplet] = duration.match(durationRe) || [undefined, undefined, undefined, undefined, undefined];
                    lastDuration = dur !== undefined && durationToFloatMap[dur] || lastDuration;
                    if (dots !== undefined) {
                        lastDuration *= Math.pow(1.5, dots.length);
                    }
                    if (tuplet) {
                        lastDuration /= parseInt(tuplet);
                    }
                }
                if (volume) {
                    const [_, vol] = volume.match(volumeRe) || [undefined, undefined];
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

    protected playAtTime(oscillatorType: OscillatorType, tempo: number, freq: number, duration: number, volume: number, time: number) {
        const o = this.createOscillator(oscillatorType);
        const g = this.context.createGain();
        const startTime = this.context.currentTime + time * 60 / tempo;
        const endTime = this.context.currentTime + (time + duration) * 60 / tempo;
        const smallDeltaTime = 0.03;
        const minGain = 0.0001;
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
}
