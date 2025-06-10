import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [FormsModule,CommonModule],
})
export class SettingsComponent implements OnInit {
  settings: any;
  loading = false;
  error: string | null = null;

  private apiUrl = 'https://localhost:7134/api/Settings';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loading = true;
    this.http.get(this.apiUrl).subscribe({
      next: (data) => {
        this.settings = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load settings';
        this.loading = false;
      }
    });
  }

  saveSettings() {
    this.http.put(this.apiUrl, this.settings).subscribe({
      next: () => alert('✅ Settings updated!'),
      error: () => alert('❌ Failed to update settings')
    });
  }
}
