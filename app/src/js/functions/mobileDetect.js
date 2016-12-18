const MobileDetect = require('mobile-detect');

const md = new MobileDetect(window.navigator.userAgent);

export const isMobile = !!md.mobile();

export function initMobileDetect() {
    'use strict';

    if (isMobile) {
        document.body.classList.add('is-mobile');

        const appHld = document.querySelector('.app');

        const inputHld = document.createElement('DIV');
        inputHld.classList.add('mobile-input');

        const input = document.createElement('INPUT');
        input.type = 'text';
        input.classList.add('mobile-input__inner');

        inputHld.appendChild(input);
        document.body.appendChild(inputHld);

        appHld.addEventListener('click', function () {
            input.focus();
        });
    } else {
        document.body.classList.add('is-desktop');
    }
}
