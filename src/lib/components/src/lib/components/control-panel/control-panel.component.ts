/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-selector */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';

export enum InstrumentName {
  ELECTRIC_PIANO = 'electric-piano',
}

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrl: './control-panel.component.scss',
})
export class ControlPanelComponent {
  constructor(private formBuilder: FormBuilder) {
    this.form.controls['bpm'].valueChanges.subscribe((value) => {
      if (value) this.updateBpm(value);
    });

    this.form.controls['bars'].valueChanges.subscribe((value) => {
      if (value) this.updateBars(value);
    });

    this.form.controls['beats'].valueChanges.subscribe((value) => {
      if (value) this.updateBeats(value);
    });

    this.form.controls['divisions'].valueChanges.subscribe((value) => {
      if (value) {
        this.updateDivisions(value);
        this.updateBpm(this.form.value.bpm || 120);
      }
    });

    this.form.controls['octaves'].valueChanges.subscribe((value) => {
      if (value) this.updateOctaves(value);
    });
  }

  @Input() playing = false;

  @Input() set bpm(bpm: number) {
    if (bpm) this.form.patchValue({ bpm });
  }
  @Input() set bars(bars: number) {
    if (bars) this.form.patchValue({ bars });
  }
  @Input() set beats(beats: number) {
    if (beats) this.form.patchValue({ beats });
  }
  @Input() set divisions(divisions: number) {
    if (divisions) this.form.patchValue({ divisions });
  }
  @Input() set octaves(octaves: number) {
    if (octaves) this.form.patchValue({ octaves });
  }

  @Output() playPressed = new EventEmitter();
  @Output() stopPressed = new EventEmitter();

  @Output() save = new EventEmitter();

  @Output() setBars = new EventEmitter<number>();
  @Output() setBeats = new EventEmitter<number>();
  @Output() setDivisions = new EventEmitter<number>();
  @Output() setBpm = new EventEmitter<number>();
  @Output() setOctaves = new EventEmitter<number>();

  form = this.formBuilder.group({
    bpm: [120],
    bars: [2],
    beats: [4],
    divisions: [2],
    octaves: [2],
    loop: false,
  });

  play() {
    this.playPressed.emit();
  }

  stop() {
    this.stopPressed.emit();
  }

  addBar() {
    this.form.patchValue({
      bars: Math.min((this.form.value.bars || 1) + 1, 8),
    });
  }

  removeBar() {
    this.form.patchValue({
      bars: Math.max((this.form.value.bars || 1) - 1, 1),
    });
  }

  addBeat() {
    this.form.patchValue({
      beats: Math.min((this.form.value.beats || 1) + 1, 7),
    });
  }

  removeBeat() {
    this.form.patchValue({
      beats: Math.max((this.form.value.beats || 1) - 1, 2),
    });
  }

  addDivision() {
    this.form.patchValue({
      divisions: Math.min((this.form.value.divisions || 1) + 1, 6),
    });
  }

  removeDivision() {
    this.form.patchValue({
      divisions: Math.max((this.form.value.divisions || 1) - 1, 2),
    });
  }

  addOctave() {
    this.form.patchValue({
      octaves: Math.min((this.form.value.octaves || 1) + 1, 6),
    });
  }

  removeOctave() {
    this.form.patchValue({
      octaves: Math.max((this.form.value.octaves || 1) - 1, 1),
    });
  }

  updateBpm(bpm: number) {
    this.setBpm.emit(bpm);
  }

  updateBars(bars: number) {
    this.setBars.emit(bars);
  }

  updateBeats(beats: number) {
    this.setBeats.emit(beats);
  }

  updateDivisions(divs: number) {
    this.setDivisions.emit(divs);
  }

  updateOctaves(octaves: number) {
    this.setOctaves.emit(octaves);
  }

  saveSong() {
    this.save.emit();
  }
}
