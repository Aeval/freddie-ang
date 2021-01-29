import { Component, OnInit } from '@angular/core';
import { TaskFilter } from '../task-filter';
import { TaskService } from '../task.service';
import { Task } from '../task';

@Component({
  selector: 'app-task',
  templateUrl: 'task-list.component.html'
})
export class TaskListComponent implements OnInit {

  filter = new TaskFilter();
  selectedTask: Task;
  feedback: any = {};

  get taskList(): Task[] {
    return this.taskService.taskList;
  }

  constructor(private taskService: TaskService) {
  }

  ngOnInit() {
    this.search();
  }

  search(): void {
    this.taskService.load(this.filter);
  }

  select(selected: Task): void {
    this.selectedTask = selected;
  }

  delete(task: Task): void {
    if (confirm('Are you sure?')) {
      this.taskService.delete(task).subscribe(() => {
          this.feedback = {type: 'success', message: 'Delete was successful!'};
          setTimeout(() => {
            this.search();
          }, 1000);
        },
        err => {
          this.feedback = {type: 'warning', message: 'Error deleting.'};
        }
      );
    }
  }
}
