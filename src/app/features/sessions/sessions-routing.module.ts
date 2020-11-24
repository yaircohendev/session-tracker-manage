import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionPlayerComponent } from './pages/session-player/session-player.component';
import { SessionsListComponent } from './pages/sessions-list/sessions-list.component';
import { DemoComponent } from './pages/demo/demo.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
  },
  {
    path: 'player/:sessionId',
    component: SessionPlayerComponent,
  },
  {
    path: 'list',
    component: SessionsListComponent,
  },
  {
    path: 'demo',
    component: DemoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionsRoutingModule {}
