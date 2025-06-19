import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UnitMappingService } from './services/unit-mapping.service';
import { DataUploadService } from './services/data-upload.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Smart Kirana';
  message: string = '';

  constructor(
    private unitMappingService: UnitMappingService, 
    private uploadService: DataUploadService
  ) {}

  async ngOnInit() {
    await this.unitMappingService.loadMappings();
  }


  uploadItems(){
    this.uploadService.uploadItems().then(() => {
      this.updateMessage('Items Uploaded successfully!');
    }).catch(err => {
      this.updateMessage('Items Upload failed:' + err);
    });
  }

  uploadUnits(){
    this.uploadService.uploadUnits().then(() => {
      this.updateMessage('Units Uploaded successfully!');
    }).catch(err => {
      this.updateMessage('Units Upload failed:' + err);
    });
  }

  updateMessage(text: string){
      this.message = text;
      console.log(this.message);
      alert(this.message);
  }
}
