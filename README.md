# Let's build a tiny game

[view slides](https://rikharink.github.io/topiconf-2022)

## Run, build, tweak, develop

### Development build

```sh
yarn install
yarn start
```

### Production build

```sh
yarn install
yarn build
```

## My 7 step recipe for an awesome game jam

### 1. Prepare (pre-jam)

- Pick or develop a framework
  - [My JS13k boilerplate repo](https://github.com/rikharink/js13k-boilerplate)
  - [Kontra](https://straker.github.io/kontra/)
  - [LittleJS](https://github.com/KilledByAPixel/LittleJS)
  - [Goodluck](https://github.com/piesku/goodluck)
  - [W](https://xem.github.io/W/)
- Setup build tools
  - [Rollup.js](https://www.rollupjs.org/guide/en/)
  - [Terser](https://terser.org/)
  - [Roadroller](https://lifthrasiir.github.io/roadroller/)
  - [Efficient-Compression-Tool](https://github.com/fhanau/Efficient-Compression-Tool)
- Setup debug tools
  - [lil-gui](https://lil-gui.georgealways.com/)
  - [stats.js](https://github.com/mrdoob/stats.js/)
  - [spector.js](https://spector.babylonjs.com/)
- Learn some Maths & Game physics
  - [3d Math Primer for Graphics and Game Development](https://gamemath.com/book/intro.html)
  - [3 Blue 1 Brown - Essence of Linear Algebra](https://www.youtube.com/playlist?list=PL0-GT3co4r2y2YErbmuJw2L5tW4Ew2O5B)
  - [Freya Holmér - Math For Game Devs](https://www.youtube.com/playlist?list=PLImQaTpSAdsD88wprTConznD1OY1EfK_V)
  - [Freya Holmér - The Beauty of Bézier Curves](https://www.youtube.com/watch?v=aVwxzDHniEw)
  - [Integration basics (game physics)](https://gafferongames.com/post/integration_basics/)
  - [GMTK Platformer physics](https://www.youtube.com/watch?v=zWi0jgghGcI)

### 2. Brainstorm

- Brainstorm game ideas
- Paper prototype (or validate your idea an other way)
- Try to get an idea how to integrate the theme
- You can use [GPT-3](https://beta.openai.com/overview) for inspiration (variants on the prompt pitch me a game idea for the game \<title\> worked good for me)
- Keep your idea simple

### 3. Core gameplay loop

- Build the core gameplay loop
- Maybe [Fix your Timestep](https://www.gafferongames.com/post/fix_your_timestep/)
  - [or not]()
- Keep it simple, pick one core mechanic make this fun
- People will probably only play your game for about 5 minutes make these minutes count
- People won't read your manual make your mechanic easy to pick up
  - Easy to learn hard to master type ideas work great in game jams!

### 4. Iterate and add juice

You have made the core gameplay fun and could submit the game now.
But this is the point where you can add secundary mechanics and juice

- add sounds
  - [ZzFX](https://github.com/KilledByAPixel/ZzFX)
  - [ZzFXM](https://keithclark.github.io/ZzFXM/)
  - [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- add juice
  - [The art of screenshake](https://www.youtube.com/watch?v=AJdEqssNZ-U)
  - [Juice it or lose it](https://www.youtube.com/watch?v=Fy0aCDmgnxg)
  - [Math for game programmers: juicing your camera](https://www.youtube.com/watch?v=tu-Qe66AvtY)
- add [trophies](https://github.com/KilledByAPixel/OS13k#trophies)

### 5. Final playtest

You should continually test your idea. Make sure to let people other than yourself play the game at every step.
You can learn a lot from this feedback, especially if the game is to hard (you will be to good at your own game to judge). Make use of the awesome people in the [JS13k games slack](https://slack.js13kgames.com/) they'll probably gladly test your game and will even hop on a Discord call so you can watch them play your game.

### 6. Bundle & Ship-it

Make your final zip, make sure it isn't bigger than 13KiB (maybe codegolf some more if it is!) and submit it!
See bundle tools under preparation if you didn't do this in preparation.

### 7. Celebrate, play other peoples games and vote

You made cool thing, be proud, celebrate!
Play other peoples submissions and give feedback, you'll also love to get feedback so make sure to pay it forward!

Now go on and cook up your own awesome tiny game jam game and make sure to show me!

- [Rik Harink](mailto:rik@har.ink)
