import "@angular/compiler";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { DeviceViewComponent } from "./device-view.component";

void bootstrapApplication(DeviceViewComponent, { providers: [provideZonelessChangeDetection()] });
