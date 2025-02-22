import * as audio from './audio';

const audioContext = new audio.AudioContextWrapper()
Object.assign(window, {
    audio: audioContext,
    ...audio
});

const entries = Object.entries(audio.OscillatorType)
  .filter(([k, v]) => !isNaN(Number(v)));

const examples = [
  '',
  '',
  '',
  'c3q c d# c3 g#2 g# a# g# '.repeat(2) + 'a#2q a# c3 a#2 f f g# f '.repeat(2),
  'c3qv0.35 c c6 c3 c c c6h '.repeat(4)
];

const div = document.createElement('div');
div.innerHTML = `
<label>Tempo: <input id="tempo" type="text" size="4" value="60" /></label>
<table>
<tbody>
  ${entries.map(([_, i]) => 
  `<tr><td>
    <select id="type${i}">
      ${Object.entries(audio.OscillatorType)
        .filter(([k, v]) => !isNaN(Number(v)))
        .map(([k, v]) =>
        `<option value="${v}" ${v === i && 'selected'}>${k}</option>`
      ).join('')}
    </select>
  </td><td>
    <input id="notes${i}" type="text" value="${examples[i]}" />
  </td></tr>`
  ).join('')}
</tbody>
</table>
<button id="play" type="button">Play</button>
`;
document.body.append(div);

const tempo = document.getElementById('tempo');
const channels = [...document.querySelectorAll('tr')]
  .map((tr, i) => ({
    type: tr.querySelector('#type' + i),
    notes: tr.querySelector('#notes' + i)
  }));
const play = document.getElementById('play');

play.addEventListener('click', () => {
  for (const {type, notes} of channels) {
    audioContext.playNotesAtTime(Number(type.value), Number(tempo.value), notes.value, 0, audioContext);
  }
});
