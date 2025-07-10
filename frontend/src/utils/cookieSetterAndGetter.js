import Cookies from 'js-cookie';

export function getCookie(key) {
    let val = Cookies.get(key)
    return val || null;
}

export function setCookie(key, value, days = 30) {
    Cookies.set(key, value, { expires: days })
}
