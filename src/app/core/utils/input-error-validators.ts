const REGEX_EMAIL =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const REGEX_NUMBER = /^[0-9]*$/;
const REGEX_MOBILE_PHONE = /^[0][1-9]\d{8}$|^[1-9]\d{8}$/g;

function email(control: any) {
  if (control.value.match(REGEX_EMAIL)) return null;
  else return { invalidEmailAddress: true };
}

function number(control: any) {
  if (control.value && control.value.match(REGEX_NUMBER)) return null;
  else return { invalidNumber: true };
}

function mobilePhone(control: any) {
  if (control.value && control.value.match(REGEX_MOBILE_PHONE)) return null;
  else return { invalidNumber: true };
}

export default {
  email,
  number,
  mobilePhone,
};
