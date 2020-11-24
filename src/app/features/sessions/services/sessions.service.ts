import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Session, UpdateSessionData, UserEvent } from '../models/sessions.model';
import { concatAll, map, toArray } from 'rxjs/operators';
import { MongoDeleteResults, MongoUpdateResults } from '../../../core/models/mongo.model';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  constructor(private http: HttpClient) {}

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.apiURL}/api/sessions`).pipe(
      concatAll(),
      map((item) => {
        item.duration = this.getSessionDuration(item.sessions);
        return item;
      }),
      toArray()
    );
  }

  getSpecificSession(sessionId: string): Observable<Session> {
    return this.http.get<Session>(`${environment.apiURL}/api/sessions/${sessionId}`).pipe(
      map((item) => {
        item.duration = this.getSessionDuration(item.sessions);
        return item;
      })
    );
  }

  updateSession(sessionId: string, data: UpdateSessionData): Observable<MongoUpdateResults> {
    return this.http.put<MongoUpdateResults>(`${environment.apiURL}/api/sessions/${sessionId}`, data);
  }

  createNewSession(sessionDate: string): Observable<string> {
    return this.http.post<string>(`${environment.apiURL}/api/sessions`, { sessionDate });
  }

  deleteSession(sessionId: string): Observable<MongoDeleteResults> {
    return this.http.delete<MongoDeleteResults>(`${environment.apiURL}/api/sessions/${sessionId}`);
  }

  getSessionDuration(sessions: UserEvent[]): number | null {
    if (sessions.length <= 1) return null;
    return Math.round((sessions[sessions.length - 1].time_stamp - sessions[0].time_stamp) / 1000);
  }
}
