//Use
//private mediaService = new MediaService('(max-width: 768px)');
//ngOnInit(): this.mediaService.match$.subscribe(value => {...});

import {ReplaySubject} from "rxjs";

export class MediaService {
  private matches = new ReplaySubject<boolean>(1);
  public match$ = this.matches.asObservable();

  constructor(public readonly query: string) {
    // we need to make sure we are in browser
    if (window) {
      const mediaQueryList = window.matchMedia(this.query);
      // here we pass value to our ReplaySubject
      const listener: any = (event: MediaQueryList) => this.matches.next(event.matches);
      // run once and then add listener
      listener(mediaQueryList);
      mediaQueryList.addEventListener('change', listener);
    }
  }
}
