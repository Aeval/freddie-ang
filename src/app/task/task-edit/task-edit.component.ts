import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { OktaAuthService } from '@okta/okta-angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css'],
})
export class TaskEditComponent implements OnInit {
  id: string;
  task: Task;
  feedback: any = {};
  userName: String;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    public oktaAuth: OktaAuthService,
    public datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.userName = sessionStorage.getItem('username');
    this.route.params
      .pipe(
        map((p) => p.id),
        switchMap((id) => {
          if (id === 'new') {
            return of(new Task());
          }
          return this.taskService.findById(id);
        })
      )
      .subscribe(
        (task) => {
          this.task = task;
          this.feedback = {};
        },
        (err) => {
          this.feedback = { type: 'warning', message: 'Error loading' };
        }
      );
  }

  save() {
    let formattedDate = this.datepipe.transform(
      this.task.dueDate,
      'yyyy-MM-dd'
    );
    this.task.dueDate = formattedDate;

    this.taskService.save(this.task).subscribe(
      (task) => {
        this.task = task;
        this.feedback = { type: 'success', message: 'Save was successful!' };
        setTimeout(() => {
          this.router.navigate(['/tasks']);
        }, 1000);
      },
      (err) => {
        this.feedback = { type: 'warning', message: 'Error saving' };
      }
    );
  }

  cancel() {
    this.router.navigate(['/tasks']);
  }
}
