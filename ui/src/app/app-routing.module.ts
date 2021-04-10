import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanvasTwoDComponent } from './components/canvas-two-d/canvas-two-d.component';
import { MathematicsComponent } from './components/mathematics/mathematics.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SimulationComponent } from './components/simulation/simulation.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'simulation', component: SimulationComponent },
  { path: 'mathematics', component: MathematicsComponent },
  { path: '2d-canvas', component: CanvasTwoDComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
