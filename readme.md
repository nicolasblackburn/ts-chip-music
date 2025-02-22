# Typescript Chip Music

This project is a very minimal chip tune scripting language inspired by the `play` command from [Hypertalk](https://wiki.xxiivv.com/site/hypertalk.html) language. It consists of a rudimentary parser that transform a string of notes to real sounds that are played using the web audio API to generate sounds. You can find a good description of the notation here [jsPlayCommand](https://www.kreativekorp.com/lib/jsPlayCommand/). `jsPlayCommand` is similar to this project in that it allows you to play some music using the Hypertalk notation, but both implementations are different. `jsPlayCommand` uses Midi instead of the web audio API.

# Getting started

1. Install dependencies `npm install`
2. Build project `npm run buil`
3. Serve static files `npm run serve`
4. Open your browser at `http://localhost:8080`

This will launch a webpage with a button that plays a demo.

# Bugs and todos

- The audio of the different tracks is not properly synchronized so sometimes they start playing out of sync
- It would be nice to have a volume control per channel
- It would be nice if the notation would support some kind of comments

