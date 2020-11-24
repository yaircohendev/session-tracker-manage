import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SessionsService } from '../../services/sessions.service';
import { BehaviorSubject } from 'rxjs';
import { Session } from '../../models/sessions.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sessions-list',
  templateUrl: './sessions-list.component.html',
  styleUrls: ['./sessions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsListComponent implements OnInit {
  constructor(private sessionsService: SessionsService, public router: Router) {}
  allSessions$ = new BehaviorSubject<Session[] | null>(null);
  sessionId: string;

  ngOnInit(): void {
    this.sessionsService.getAllSessions().subscribe(
      (res) => {
        this.allSessions$.next(res);
      },
      (error) => console.error(error)
    );
  }

  async showPlayer(item: Session): Promise<void> {
    await this.router.navigate([`/sessions/player/${item._id}`]);
  }

  deleteSession(item: Session): void {
    this.sessionsService.deleteSession(item._id).subscribe(
      (res) => {
        console.log(res);
        this.allSessions$.next(
          this.allSessions$.getValue()?.filter((session) => session._id !== item._id) as Session[]
        );
      },
      (error) => console.error(error)
    );
  }
}
