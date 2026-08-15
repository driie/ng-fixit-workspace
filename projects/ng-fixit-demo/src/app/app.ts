import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NgFixit } from 'ng-fixit';

import { DemoInvoiceCard } from './invoice-card/invoice-card';

@Component({
  selector: 'demo-root',
  imports: [DemoInvoiceCard, NgFixit],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
