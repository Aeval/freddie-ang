import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { TaskService } from './task.service';
import { TASK_ROUTES } from './task.routes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(TASK_ROUTES)
  ],
  declarations: [
    TaskListComponent,
    TaskEditComponent
  ],
  providers: [TaskService],
  exports: []
})
export class TaskModule { }
