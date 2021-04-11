import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CannonBallComponent } from './components/canvas-two-d/cannon-ball/cannon-ball.component';
import { CanvasTwoDComponent } from './components/canvas-two-d/canvas-two-d.component';
import { CollisionOneDComponent } from './components/canvas-two-d/collision-one-d/collision-one-d.component';
import { MathematicsComponent } from './components/mathematics/mathematics.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { SimulationComponent } from './components/simulation/simulation.component';
import { TexDirective } from './directives/tex.directive';
import { MaterialModule } from './modules/material.module';
import { SOCKET_CONFIG } from './services/io/socket/socket.token';
import { WelcomeComponent } from './welcome/welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    SimulationComponent,
    NotFoundComponent,
    PageTitleComponent,
    MathematicsComponent,
    TexDirective,
    CanvasTwoDComponent,
    CannonBallComponent,
    CollisionOneDComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    StoreModule.forRoot({}, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    PageTitleComponent
  ],
  providers: [
    {
      provide: SOCKET_CONFIG,
      useValue: {
        url: environment.production ? `${window.location.origin}:3333` : `http://localhost:3333`,
        options: {
          withCredentials: true
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
