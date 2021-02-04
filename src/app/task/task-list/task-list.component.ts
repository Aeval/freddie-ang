import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TaskFilter } from '../task-filter';
import { TaskService } from '../task.service';
import { Task } from '../task';
import { OktaAuthService } from '@okta/okta-angular';
import { BehaviorSubject, fromEvent, merge, Observable, of } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  tap,
} from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';

interface Status {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-task',
  templateUrl: 'task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TaskListComponent implements OnInit {
  filter = new TaskFilter();
  selectedTask: Task;
  feedback: any = {};
  statuses: Status[] = [
    { value: '', viewValue: 'All' },
    { value: 'true', viewValue: 'Done' },
    { value: 'false', viewValue: 'Not Done' },
  ];

  userName: String;

  tasks: Task[];
  dataSource: TaskDataSource;
  displayedColumns = ['done', 'name', 'due', 'delete', 'edit'];

  get taskList(): Task[] {
    return this.taskService.taskList;
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor(
    private taskService: TaskService,
    public oktaAuth: OktaAuthService,
    public datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.taskService.find(this.filter).subscribe((data) => {
      this.tasks = data;
    });
    this.dataSource = new TaskDataSource(this.taskService);
  }

  async ngAfterViewInit() {
    this.userName = sessionStorage.getItem('username');
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadTasksPage();
        })
      )
      .subscribe();

    this.filter.pageSize = this.paginator.pageSize;
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.paginator.page, this.sort.sortChange)
      .pipe(tap(() => this.loadTasksPage()))
      .subscribe();
    this.dataSource.loadTasks(this.filter);
  }

  loadTasksPage() {
    this.filter.sortDirection = this.sort.direction;
    this.filter.pageSize = this.paginator.pageSize;
    this.filter.pageIndex = this.paginator.pageIndex;
    this.filter.taskName = this.input.nativeElement.value;
    this.dataSource.loadTasks(this.filter);
  }

  select(selected: Task): void {
    this.selectedTask = selected;
  }

  filterByDone(selection: string): void {
    this.filter.taskDone = selection;
    this.paginator.pageIndex = 0;
    this.loadTasksPage();
  }

  updateDone(task: Task): void {
    console.log(task);
    this.save(task);
  }

  edit(task: Task): void {
    this.select(task);
    console.log(this.selectedTask);
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

  save(task: Task): void {
    let formattedDate = this.datepipe.transform(task.dueDate, 'yyyy-MM-dd');
    task.dueDate = formattedDate;
    if (this.selectedTask) {
      this.selectedTask = new Task();
    }
    this.taskService.save(task).subscribe(
      (task) => {
        this.feedback = { type: 'success', message: 'Save was successful!' };
      },
      (err) => {
        this.feedback = { type: 'warning', message: 'Error saving' };
      }
    );
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
