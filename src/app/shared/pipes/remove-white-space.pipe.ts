import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'removeWhiteSpace'
})
export class RemoveWhiteSpacePipe implements PipeTransform {
  transform(value: any): any {
    if (value === undefined)
      return 'undefined';
    return value.replace(/\s/g, "");
  }
}
