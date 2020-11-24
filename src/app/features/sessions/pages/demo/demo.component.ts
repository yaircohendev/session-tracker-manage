import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import * as tracker from 'user-session-recorder';
import { SessionsService } from '../../services/sessions.service';
import { UserEvent } from '../../models/sessions.model';
import { ModifiedEvent } from 'user-session-recorder/lib/model';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent implements AfterViewInit, OnDestroy {
  sessionId: string;
  constructor(private sessionsService: SessionsService) {}

  ngAfterViewInit(): void {
    this.sessionsService.createNewSession(new Date().toISOString()).subscribe(
      (sessionId) => {
        this.sessionId = sessionId;
        this.initializeTracker();
      },
      (error) => console.error(error)
    );
  }

  ngOnDestroy(): void {
    tracker.destroyTracker();
    this.sessionId = '';
  }

  initializeTracker(): void {
    tracker.initializeTracker(
      (sessions: ModifiedEvent[]) => {
        if (!this.sessionId) return;
        console.log('Saving to id - ' + this.sessionId);
        console.log(sessions);
        this.sessionsService
          .updateSession(this.sessionId, {
            sessions: sessions as UserEvent[],
            sessionDate: new Date().toISOString(),
          })
          .subscribe((res) => {
            console.log('Update successfully');
            console.log(res);
          });
      },
      { saveEvery: 3 }
    );
  }
}
