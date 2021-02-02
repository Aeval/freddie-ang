import { Task } from './task';
import { TaskFilter } from './task-filter';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';

const headers = new HttpHeaders().set('Accept', 'application/json');

@Injectable()
export class TaskService {
  taskList: Task[] = [];
  api = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}

  findById(id: string): Observable<Task> {
    const url = `${this.api}/${id}`;
    const params = { id: id };
    return this.http.get<Task>(url, { params, headers });
  }

  load(filter: TaskFilter): void {
    this.find(filter).subscribe(
      (result) => {
        this.taskList = result;
        sessionStorage.setItem('tasks', JSON.stringify(result));
      },
      (err) => {
        console.error('error loading', err);
      }
    );
  }

  find(filter: TaskFilter): Observable<Task[]> {
    const userTasks = 'http://localhost:8080/user/tasks';
    return this.http.get<Task[]>(userTasks, { headers });
  }

  filterList(filter: TaskFilter): void {
    const params = {
      taskName: filter.taskName,
      taskDone: filter.taskDone,
      dueDate: filter.dueDate,
    };

    let orgTasklist = JSON.parse(sessionStorage.getItem('tasks'));
    console.log(orgTasklist);

    function isInFilter(task) {
      console.log(this.taskDone);
      let containsName =
        task.taskName.includes(this.taskName) && this.taskName != '';
      let containsDone =
        task.taskDone.toString().includes(this.taskDone) && this.taskDone != '';
      let containsDate =
        task.dueDate.includes(this.dueDate) && this.dueDate != '';

      console.log(containsName);
      console.log(containsDone);
      console.log(containsDate);

      if (
        (containsName && containsDone && containsDate) ||
        (containsName && !containsDone && !containsDate) ||
        (!containsName && containsDone && !containsDate) ||
        (!containsName && !containsDone && containsDate)
      ) {
        return true;
      } else {
        return false;
      }
    }
    if (!params.taskName && !params.dueDate && !params.taskDone) {
      return;
    } else {
      console.log(orgTasklist);
      let newTaskList = orgTasklist.filter(isInFilter, params);
      this.taskList = newTaskList;
    }
  }

  save(entity: Task): Observable<Task> {
    let params = new HttpParams();
    let url = '';
    if (entity.id) {
      url = `${this.api}/${entity.id.toString()}`;
      params = new HttpParams().set('ID', entity.id.toString());
      return this.http.put<Task>(url, entity, { headers, params });
    } else {
      url = `${this.api}`;
      console.log(entity);
      return this.http.post<Task>(url, entity, { headers, params });
    }
  }

  delete(entity: Task): Observable<Task> {
    let params = new HttpParams();
    let url = '';
    if (entity.id) {
      url = `${this.api}/${entity.id.toString()}`;
      params = new HttpParams().set('ID', entity.id.toString());
      return this.http.delete<Task>(url, { headers, params });
    }
    return null;
  }
}
