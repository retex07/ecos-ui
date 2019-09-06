import FormIODateTimeComponent from 'formiojs/components/datetime/DateTime';
import { utcAsLocal, revokeUtcAsLocal } from '../../../../helpers/util';

export default class DateTimeComponent extends FormIODateTimeComponent {
  setValue(value, flags) {
    if (!this.isEmpty(value) && this.component.enableDate) {
      value = utcAsLocal(value);
    }

    return super.setValue(value, flags);
  }

  setupValueElement(element) {
    let value = this.getValue();

    value = this.isEmpty(value) ? this.defaultViewOnlyValue : this.getView(this.component.enableDate ? utcAsLocal(value) : value);

    element.innerHTML = value;
  }

  beforeSubmit() {
    const value = this.dataValue;

    if (!this.isEmpty(value) && this.component.enableDate) {
      this.dataValue = revokeUtcAsLocal(value);
    }

    return super.beforeSubmit();
  }
}