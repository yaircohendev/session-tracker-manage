import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { UserEvent } from '../../models/sessions.model';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../../services/sessions.service';
import { map, takeWhile, tap } from 'rxjs/operators';

interface Item {
  index: number;
  data: UserEvent;
}

@Component({
  selector: 'app-session-player',
  templateUrl: './session-player.component.html',
  styleUrls: ['./session-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionPlayerComponent implements AfterViewInit, OnDestroy {
  sessionEvents: UserEvent[];
  currentItem$ = new BehaviorSubject<Item | null>(null);
  startPlayer$: Observable<any>;
  playerInstance$: Subscription;
  timerInstance$: Subscription;
  isPlaying$ = new BehaviorSubject(false);
  sessionDuration: number;
  sessionDate: Date;
  timeLeft$ = new BehaviorSubject<number | null>(null);
  timer$: Observable<number>;
  loading$ = new BehaviorSubject(true);
  enableClickSound = true;
  sessionSpeed$ = new BehaviorSubject(100);
  latestViewPortSize$ = new BehaviorSubject<UserEvent | null>(null);
  @ViewChild('player') player: ElementRef;
  @ViewChild('mouseContainer') mouseContainer: ElementRef;

  constructor(private renderer: Renderer2, private route: ActivatedRoute, private sessionsService: SessionsService) {}

  ngAfterViewInit(): void {
    this.initializeData();
    this.initializePlayer();
  }

  ngOnDestroy(): void {
    this.resetPlayer();
  }

  initializeData(): void {
    this.loading$.next(true);
    const sessionId = this.route.snapshot.paramMap.get('sessionId') as string;
    this.sessionsService.getSpecificSession(sessionId).subscribe(
      (sessionItem) => {
        this.sessionEvents = sessionItem.sessions;
        this.latestViewPortSize$.next(this.sessionEvents[0]);
        this.timeLeft$.next(sessionItem.duration as number);
        this.sessionDuration = sessionItem.duration as number;
        this.sessionDate = new Date(sessionItem.sessionDate);
      },
      (error) => console.error(error),
      () => this.loading$.next(false)
    );
  }

  initializePlayer(): void {
    this.startPlayer$ = new Observable((observer) => {
      const currentItem = this.currentItem$.getValue();
      const hasFinishedPlaying = currentItem?.index === this.sessionEvents.length - 1;
      const index = currentItem && !hasFinishedPlaying ? currentItem.index : 0;
      (async () => {
        for (let i = index || 0; i < this.sessionEvents.length; i++) {
          const session = this.sessionEvents[i];
          if (!this.isPlaying$.getValue()) {
            return;
          }
          if (session.type === 'VIEWPORT_SIZE') {
            this.latestViewPortSize$.next(session);
          }
          const currentItem = { index: i, data: this.getItemWithCoordinates(session) };
          const speed = this.sessionSpeed$.getValue() / 100;
          const timeDifference = this.sessionEvents[i + 1]?.time_stamp - currentItem.data.time_stamp;
          observer.next(currentItem);
          await new Promise((r) => setTimeout(r, timeDifference / speed));
        }
        this.isPlaying$.next(false);
        this.latestViewPortSize$.next(this.sessionEvents[0]);
        observer.complete();
      })();
    });
  }

  getItemWithCoordinates(item: UserEvent): UserEvent {
    const { x: recordingWidth, y: recordingHeight } = this.latestViewPortSize$.getValue() as UserEvent;
    const playerHeight = this.player.nativeElement.clientHeight;
    const playerWidth = this.player.nativeElement.clientWidth;
    const divideByHeight = recordingHeight / playerHeight;
    const divideByWidth = recordingWidth / playerWidth;
    return {
      ...item,
      x: item.x / divideByWidth,
      y: item.y / divideByHeight,
    };
  }

  async startPlayer(): Promise<void> {
    this.initiateTimer();
    this.isPlaying$.next(true);
    this.timerInstance$ = this.timer$.subscribe((time) => {
      this.timeLeft$.next(time - 1);
    });
    this.playerInstance$ = this.startPlayer$.subscribe((currentItem) => {
      this.currentItem$.next(currentItem);
      if (currentItem.data.type === 'MOUSE_CLICK') {
        this.createClickEffect();
      }
    });
  }

  initiateTimer(): void {
    const speed = 1000 / (this.sessionSpeed$.getValue() / 100);
    this.timer$ = timer(1000, speed).pipe(
      map(() => this.timeLeft$.getValue() as number),
      tap((time) => {
        if (time === 0) {
          this.timeLeft$.next(this.sessionDuration);
        }
      }),
      takeWhile((i) => i - 1 >= 0)
    );
  }

  async createClickEffect(): Promise<void> {
    if (this.enableClickSound) {
      await new Audio('../../../../../assets/sounds/mouse-click.mp3').play();
    }
    const clickEffect = this.renderer.createElement('div');
    clickEffect.className = 'clickEffect';
    this.renderer.appendChild(this.mouseContainer.nativeElement, clickEffect);
    clickEffect.addEventListener(
      'animationend',
      function () {
        clickEffect.parentElement.removeChild(clickEffect);
      }.bind(this)
    );
  }

  pausePlayer(): void {
    this.playerInstance$?.unsubscribe();
    this.timerInstance$?.unsubscribe();
    this.isPlaying$?.next(false);
  }

  resetPlayer(): void {
    this.pausePlayer();
    this.timeLeft$?.next(0);
    this.currentItem$?.next(null);
  }

  setSpeed(event: any): void {
    this.sessionSpeed$.next(event.target.value);
  }
}
