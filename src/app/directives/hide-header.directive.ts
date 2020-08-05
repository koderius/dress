import { Directive, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appHideHeader]'
})
export class HideHeaderDirective implements OnInit {

  @Input('header') header: any;

  private lastY = 0;

  private top: number = 0;

  constructor(
    private renderer: Renderer2,
    private domCtrl: DomController
  ) { }

  ngOnInit(): void {
    this.header = this.header.el;
    // this.domCtrl.write(() => {
    //   this.renderer.setStyle(this.header, 'transition', 'top 700ms');
    // });
  }

  @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
    const dif = $event.detail.scrollTop - this.lastY;
    this.top -= dif;
    if(this.top < -this.header.clientHeight)
      this.top = -this.header.clientHeight;
    if(this.top > 0)
      this.top = 0;
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.header, 'top', `${this.top}px`);
    });

    this.lastY = $event.detail.scrollTop;
  }

}
