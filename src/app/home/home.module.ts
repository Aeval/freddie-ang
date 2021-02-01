import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { HomeComponent } from './home.component';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatSliderModule,
  ],
  declarations: [],
  providers: [],
  exports: [MatButtonModule,
    MatSliderModule,]
})
export class HomeModule { }