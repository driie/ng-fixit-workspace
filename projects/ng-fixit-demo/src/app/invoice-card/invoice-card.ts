import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'demo-invoice-card',
  templateUrl: './invoice-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoInvoiceCard {}
