import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BeatCanvasComponent, ControlPanelComponent } from './components';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [BeatCanvasComponent, ControlPanelComponent],
  exports: [BeatCanvasComponent, ControlPanelComponent],
})
export class ComponentsModule {}
