import { Task } from './task';
import { TaskFilter } from './task-filter';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

const headers = new HttpHeaders().set('Accept', 'application/json');

@Injectable()
export class TaskService {
  taskList: Task[] = [];
  api = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {
  }

  findById(id: string): Observable<Task> {
    const url = `${this.api}/${id}`;
    const params = { id: id };
    return this.http.get<Task>(url, {params, headers});
  }

  load(filter: TaskFilter): void {
    this.find(filter).subscribe(result => {
        this.taskList = result;
      },
      err => {
        console.error('error loading', err);
      }
    );
  }

  find(filter: TaskFilter): Observable<Task[]> {
    const params = {
      'taskName': filter.taskName,
      'taskDone': filter.taskDone,
      'dueDate': filter.dueDate,
    };
    const userTasks = 'http://localhost:8080/user/tasks';
    return this.http.get<Task[]>(userTasks, {params, headers});
  }

  save(entity: Task): Observable<Task> {
    let params = new HttpParams();
    let url = '';
    if (entity.id) {
      url = `${this.api}/${entity.id.toString()}`;
      params = new HttpParams().set('ID', entity.id.toString());
      return this.http.put<Task>(url, entity, {headers, params});
    } else {
      url = `${this.api}`;
      console.log(entity)
      return this.http.post<Task>(url, entity, {headers, params});
    }
  }

  delete(entity: Task): Observable<Task> {
    let params = new HttpParams();
    let url = '';
    if (entity.id) {
      url = `${this.api}/${entity.id.toString()}`;
      params = new HttpParams().set('ID', entity.id.toString());
      return this.http.delete<Task>(url, {headers, params});
    }
    return null;
  }
}

