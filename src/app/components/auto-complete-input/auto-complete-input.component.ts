import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-auto-complete-input',
  templateUrl: './auto-complete-input.component.html',
  styleUrls: ['./auto-complete-input.component.scss']
})
export class AutoCompleteInputComponent implements OnInit {
  // complete in work
  @Input()
  data: any[];

  @Input()
  placeholder: string;

  @Input()
  displayField: string;

  @Input()
  imageField: string;

  @Input()
  secondaryField: string;

  @Input()
  disabled: boolean;

  @Input()
  itemSelected: any;

  @Input()
  excludeItem: any;

  @Input()
  cleared: boolean;

  @Input()
  zIndex: number;

  @Output()
  atSuccess: any;


  public popupVisible = false;
  public inputValue = '';
  public selectedItem;
  public displayProperty;
  public secondaryProperty;

  constructor() { }

  ngOnInit() {
    console.log('data', this.data);
  }

  handleGotFocus(e) {
    this.popupVisible = true;
  }

  handleLostFocus(e) {
    this.popupVisible = false;
  }

  handleInputChanged(e) {
    const value = this.inputValue.length === 0 ? e.target.value.toUpperCase() : e.target.value;

    this.inputValue = value;
    this.selectedItem = null;
    this.popupVisible = true;

    // if (!e.target.value) {
    //   if (this.props.cleared) {
    //     this.props.cleared();
    //   }
    // }
  }

  handleItemSelected(item) {
    this.popupVisible = false;
    this.inputValue = this.getDisplayValue(item);
    this.selectedItem = item;

    // if (this.props.itemSelected) {
    //     this.props.itemSelected(item);
    // }
  }

  handleKeyDown(event) {
    console.log(event);
    if (event.key === 'Tab' || event.key === 'Enter') {
      const match = this.findMatch();

      if (match) {
        this.handleItemSelected(match);
      }
    }
  }

  findMatch(includeSecondary = true) {
    return this.data.find((item) => {
      if (!this.inputValue) {
          return false;
      }

      let matchesSecondary = false;

      if (includeSecondary && this.getSecondaryValue(item)) {
          matchesSecondary = this.getSecondaryValue(item).toLowerCase().startsWith(this.inputValue.toLowerCase());
      }

      return this.getDisplayValue(item).toLowerCase().startsWith(this.inputValue.toLowerCase()) || matchesSecondary;
    });
  }

  getDisplayValue = (item) => {
    return this.displayProperty ? item[this.displayProperty] : item;
  }

  getSecondaryValue = (item) => {
    return this.secondaryProperty ? item[this.secondaryProperty] : undefined;
  }

  applyContainerStyle() {
    const style = {
      'position': 'relative',
      'display': 'inline-block',
      'width': '100%',
      'z-index': this.zIndex
    };
    return style;
  }
}
