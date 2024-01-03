/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-selector */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Buffer } from 'buffer';
import { InstrumentName } from '../control-panel/control-panel.component';

@Component({
  selector: 'beat-canvas',
  templateUrl: './beat-canvas.component.html',
  styleUrl: './beat-canvas.component.scss',
})
export class BeatCanvasComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  canvas?: HTMLElement | null;
  context?: CanvasRenderingContext2D;

  width = 0;
  height = 0;

  bpm = 120;
  octaves = 2;
  instrument: InstrumentName = InstrumentName.ELECTRIC_PIANO;

  noteLength = 250;
  noteDivisions = 2;

  bars = 2;
  beatsPerBar = 4;

  spacing = 4;
  cornerRadius = 6;

  boxWidth = 0;
  minBoxWidth = 64;
  boxHeight = 0;
  minBoxHeight = 48;

  leftPull = 0;
  playing = false;
  currentBeat: number | null = null;

  backgroundDark = '#151515';
  backgroundLight = '#323232';
  backgroundOff = '#202020';
  borderColor = '#9e9e9e';
  onBeatColor = '#333333';

  selected: boolean[][] = [];

  noteColors = [
    '#f3212b', // C
    '#f37f21', // Db
    '#f3e821', // D
    '#94f321', // Eb
    '#2bf321', // E
    '#21f380', // F
    '#21f3e8', // Gb
    '#2196f3', // G
    '#212bf3', // Ab
    '#7f21f3', // A
    '#e821f3', // Bb
    '#f32194', // B
  ];

  noteNames = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];

  allNotes: string[] = [];

  get notes() {
    return this.octaves * 12;
  }

  get beats() {
    return this.bars * this.beatsPerBar * this.noteDivisions;
  }

  get lastBeat() {
    let lastBeat: number | null = null;

    this.selected.forEach((beat, index) => {
      if (beat.some((note) => note)) lastBeat = index;
    });

    if (lastBeat !== null) return lastBeat;
    else return -1;
  }

  setBars(bars: number) {
    this.bars = bars;
    this.resize();
  }

  setBeats(beats: number) {
    this.beatsPerBar = beats;
    this.resize();
  }

  setDivisions(divs: number) {
    this.noteDivisions = divs;
    this.resize();
  }

  setOctaves(octaves: number) {
    this.octaves = octaves;
    this.resize();
  }

  setNoteLength(bpm: number) {
    const length = (60 / bpm / this.noteDivisions) * 1000;
    this.noteLength = length;
  }

  draw() {
    if (!this.context) return;

    this.context.fillStyle = this.backgroundDark;
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.strokeStyle = this.borderColor;

    for (let beat = 0; beat < this.beats; beat += 1) {
      const currentBeat = this.currentBeat === beat;

      for (let note = 0; note < this.notes; note += 1) {
        this.context.beginPath();

        this.context.roundRect(
          beat * this.boxWidth + (currentBeat ? 0 : this.spacing / 2),
          this.height -
            note * this.boxHeight +
            (currentBeat ? 0 : this.spacing / 2) -
            (Math.floor(note / 12) + 1) * this.spacing,
          this.boxWidth - (currentBeat ? 0 : this.spacing),
          -1 * (this.boxHeight - (currentBeat ? 0 : this.spacing)),
          this.cornerRadius
        );

        this.context.stroke();

        if (this.selected[beat][note]) {
          this.context.fillStyle = this.noteColors[note % 12];
        } else if (currentBeat) {
          this.context.fillStyle = this.onBeatColor;
        } else if (
          (beat % (this.beatsPerBar * this.noteDivisions * 2)) -
            this.beatsPerBar * this.noteDivisions <
          0
        ) {
          if (!(beat % this.noteDivisions)) {
            this.context.fillStyle = this.backgroundDark;
          } else this.context.fillStyle = this.backgroundOff;
        } else {
          if (!(beat % this.noteDivisions)) {
            this.context.fillStyle = this.backgroundLight;
          } else this.context.fillStyle = this.backgroundOff;
        }

        if (this.currentBeat && this.width > window.innerWidth) {
          const distance = this.currentBeat * this.boxWidth;
          if (distance > 0.5 * window.innerWidth) {
            this.leftPull = Math.min(
              this.currentBeat * this.boxWidth - 0.5 * window.innerWidth,
              this.width - window.innerWidth
            );
          }
        }

        this.context.fill();
      }
    }
  }

  canvasClicked(event: MouseEvent) {
    const canvasRect = this.canvas?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    const beat = Math.floor(x / this.boxWidth);
    const note = this.notes - Math.floor(y / this.boxHeight) - 1;

    this.selected[beat][note] = !this.selected[beat][note];

    this.draw();
    if (this.selected[beat][note]) this.playNote(note % this.notes);
  }

  playNote(note: number) {
    const audio = new Audio(
      'assets/' + this.instrument + '/' + this.allNotes[note] + '.wav'
    );
    audio.volume = 0.2;
    audio.load();
    audio.play();
  }

  playSong() {
    if (this.lastBeat === -1 || this.playing) return;

    this.playing = true;
    this.leftPull = 0;
    this.playBeat(0);
  }

  playBeat(beat: number) {
    setTimeout(
      () => {
        if (beat <= this.lastBeat) {
          this.currentBeat = beat;

          for (let note = 0; note < this.notes; note += 1) {
            if (this.selected[this.currentBeat][note]) this.playNote(note);
          }

          this.playBeat(beat + 1);
        } else {
          this.currentBeat = null;
          this.playing = false;
        }

        this.draw();
      },

      this.noteLength
      // beat % 2 ? this.noteLength : this.noteLength + this.noteLength * 0.3
    );
  }

  resize() {
    if (!this.context) return;
    const selectedNotes: boolean[][] = [];

    for (let beat = 0; beat < this.beats; beat += 1) {
      selectedNotes.push([]);

      for (let note = 0; note < this.notes; note += 1) {
        if (this.selected.length > beat && this.selected[beat].length > note) {
          selectedNotes[beat].push(this.selected[beat][note]);
        } else selectedNotes[beat].push(false);
      }
    }

    this.selected = selectedNotes;

    this.allNotes = [];
    for (let i = 0; i < this.notes; i++) {
      this.allNotes.push(
        this.noteNames[i % this.noteNames.length] +
          (Math.floor(i / this.noteNames.length) + 3)
      );
    }

    this.width = window.innerWidth;
    this.boxWidth = Math.max(this.width / this.beats, this.minBoxWidth);
    if (this.boxWidth * this.beats > this.width) {
      this.width = this.boxWidth * this.beats;
    }
    this.context.canvas.width = this.width;

    this.height = window.innerHeight + this.octaves * this.spacing * 2 - 164;
    this.boxHeight = Math.max(this.height / 12, this.minBoxHeight);
    if (this.boxHeight * this.notes > this.height) {
      this.height = this.boxHeight * this.notes + this.octaves * this.spacing;
    }
    this.context.canvas.height = this.height;

    this.draw();
  }

  save() {
    const notes = this.selected.reduce((acc, beatGroup, beatIndex) => {
      beatGroup.forEach((_note, noteIndex) => {
        if (this.selected[beatIndex][noteIndex])
          acc.push([beatIndex, noteIndex]);
      });
      return acc;
    }, [] as number[][]);

    const encoded = Buffer.from(
      JSON.stringify({
        bars: this.bars,
        beatsPerBar: this.beatsPerBar,
        noteDivisions: this.noteDivisions,
        noteLength: this.noteLength,
        octaves: this.octaves,
        notes,
      })
    ).toString('base64');

    this.router.navigate([], { queryParams: { data: encoded } });
  }

  load() {
    this.route.queryParams.forEach((param) => {
      if (param['data']) {
        const encoded = param['data'];
        const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());

        if (decoded) {
          this.bars = decoded.bars ?? 2;
          this.beatsPerBar = decoded.beatsPerBar ?? 4;
          this.noteDivisions = decoded.noteDivisions ?? 2;
          this.noteLength = decoded.noteLength ?? 500 / this.noteDivisions;
          this.octaves = decoded.octaves ?? 2;

          this.bpm = Math.round(
            (1000 / (this.noteLength * this.noteDivisions)) * 60
          );

          this.selected = [];
          for (let beat = 0; beat < this.beats; beat += 1) {
            this.selected.push([]);

            for (let note = 0; note < this.notes; note += 1) {
              this.selected[beat].push(false);
            }
          }

          for (let i = 0; i < decoded.notes.length; i++) {
            this.selected[decoded.notes[i][0]][decoded.notes[i][1]] = true;
          }

          this.resize();
          this.draw();
        }
      }
    });
  }

  ngOnInit(): void {
    window.onbeforeunload = function () {
      return 'Your work will be lost.';
    };

    this.canvas = document.getElementById('canvas');

    if ((this.canvas as any)?.getContext('2d')) {
      this.context = (this.canvas as any)?.getContext(
        '2d'
      ) as CanvasRenderingContext2D;

      this.resize();
    }

    this.load();
  }
}
