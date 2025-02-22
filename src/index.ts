import {OscillatorType, PlayAudioContext} from './audio';

const context = new PlayAudioContext()

const types = Object.entries(OscillatorType)
  .filter(([k, v]) => !isNaN(Number(v)));

const examples = [
  '',
  '',
  '',
  'c3q c d# c3 g#2 g# a# g# \n'.repeat(2) + 'a#2q a# c3 a#2 f f g# f \n'.repeat(2),
  'c3qv0.35 c c6 c3 c c c6 c \n'.repeat(4)
];

const div = document.createElement('div');
div.innerHTML = `
<label>Tempo: <input id="tempo" type="text" size="4" value="60" /></label>
<table>
<tbody>
  ${types.map(([_, i]) => 
  `<tr><td>
    <select id="type${i}">
      <option value="-1">None</option>
      ${types
        .map(([k, v]) =>
        `<option value="${v}" ${v === i && 'selected'}>${k}</option>`
      ).join('')}
    </select>
  </td><td>
    <textarea id="notes${i}" rows="4">${examples[i]}</textarea>
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
  try{
  for (const {type, notes} of channels) {
    if (Number(type.value) !== -1) {
      if (notes.value.trim()) {
        context.play(Number(type.value), Number(tempo.value), notes.value);
      }
    }
  }
  }catch(e){alert(e.stack)}
});
