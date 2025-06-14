import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UnitMappingService } from './services/unit-mapping.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'smartkirana';
  constructor(private unitMappingService: UnitMappingService) {}

  async ngOnInit() {
    await this.unitMappingService.loadMappings();
  }
}
