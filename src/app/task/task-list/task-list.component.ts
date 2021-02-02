import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskFilter } from '../task-filter';
import { TaskService } from '../task.service';
import { Task } from '../task';
import { OktaAuthService } from '@okta/okta-angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-task',
  templateUrl: 'task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  filter = new TaskFilter();
  selectedTask: Task;
  feedback: any = {};

  tasks: Task[];
  dataSource: TaskDataSource;
  displayedColumns = ['done', 'name', 'due', 'delete'];

  get taskList(): Task[] {
    return this.taskService.taskList;
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private taskService: TaskService,
    public oktaAuth: OktaAuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.taskService.find(this.filter).subscribe((data) => {
      this.tasks = data;
    });
    this.dataSource = new TaskDataSource(this.taskService);
  }

  ngAfterViewInit() {
    this.filter.pageSize = this.paginator.pageSize;
    this.paginator.page.pipe(tap(() => this.loadTasksPage())).subscribe();
    this.dataSource.loadTasks(this.filter);
  }

  loadTasksPage() {
    this.filter.pageSize = this.paginator.pageSize;
    this.filter.pageIndex = this.paginator.pageIndex;
    this.dataSource.loadTasks(this.filter);
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
            this.paginator.length = this.paginator.length - 1;
            this.dataSource.loadTasks(this.filter);
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

  public loading$ = this.loadingSubject.asObservable();

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
