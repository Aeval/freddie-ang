import { Component, OnInit } from '@angular/core';
import { TaskFilter } from '../task-filter';
import { TaskService } from '../task.service';
import { Task } from '../task';
import { OktaAuthService } from '@okta/okta-angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-task',
  templateUrl: 'task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  filter = new TaskFilter();
  selectedTask: Task;
  feedback: any = {};

  dataSource: TaskDataSource;
  displayedColumns = ['id', 'name', 'done', 'due'];

  get taskList(): Task[] {
    return this.taskService.taskList;
  }

  constructor(
    private taskService: TaskService,
    public oktaAuth: OktaAuthService
  ) {}

  ngOnInit() {
    this.search();
    this.dataSource = new TaskDataSource(this.taskService);
    this.dataSource.loadTasks(this.filter);
  }

  search(): void {
    this.taskService.load(this.filter);
  }

  filterList(): void {
    this.taskService.filterList(this.filter);
  }

  select(selected: Task): void {
    this.selectedTask = selected;
  }

  delete(task: Task): void {
    if (confirm('Are you sure?')) {
      this.taskService.delete(task).subscribe(
        () => {
          this.feedback = {
            type: 'success',
            message: 'Delete was successful!',
          };
          setTimeout(() => {
            this.search();
          }, 1000);
        },
        (err) => {
          this.feedback = { type: 'warning', message: 'Error deleting.' };
        }
      );
    }
  }
}

export class TaskDataSource implements DataSource<Task> {
  filter = new TaskFilter();

  private taskSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private taskService: TaskService) {}

  connect(collectionViewer: CollectionViewer): Observable<Task[]> {
    return this.taskSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.taskSubject.complete();
    this.loadingSubject.complete();
  }

  loadTasks(filter) {
    this.loadingSubject.next(true);

    this.taskService
      .find(filter)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((tasks) => this.taskSubject.next(tasks));
  }
}
