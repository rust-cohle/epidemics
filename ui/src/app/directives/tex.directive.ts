import { Directive, ElementRef, Input, SimpleChange } from '@angular/core';

declare var MathJax: any;

@Directive({
  selector: '[tex]'
})
export class TexDirective {
  @Input('tex') tex: string | undefined = '';

  @Input('inline') inline?: boolean = false;

  constructor(private element: ElementRef) { }

  async ngOnInit() {
    await this.update();
  }

  async ngOnChanges(changes: SimpleChange) {
    if("tex" in changes) {
      await this.update();
    }
  }

  async update() {
    if(!this.tex) {
      return;
    }


    let tex = this.tex;
    tex = this.inline ? `$${this.tex}$` : `$$${this.tex}$$`;

    this.element.nativeElement.innerHTML = tex;
    try {
      await MathJax.typesetPromise([this.element.nativeElement]);
    } catch(err) {
      console.error(err);
    }
  }
}
