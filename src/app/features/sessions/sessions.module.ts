import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsListComponent } from './pages/sessions-list/sessions-list.component';
import { SessionPlayerComponent } from './pages/session-player/session-player.component';
import { SessionsRoutingModule } from './sessions-routing.module';
import { DemoComponent } from './pages/demo/demo.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SessionsListComponent, SessionPlayerComponent, DemoComponent],
  imports: [CommonModule, SessionsRoutingModule, FormsModule],
})
export class SessionsModule {}
