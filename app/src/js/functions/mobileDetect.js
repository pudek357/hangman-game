const MobileDetect = require('mobile-detect');

export function init() {
    const md = new MobileDetect(window.navigator.userAgent);

    if (md.mobile()) {
        document.body.className += ' is-mobile';

        const appHld = document.querySelector('.app');

        const inputHld = document.createElement("DIV");
        inputHld.className = 'mobile-input';

        const input = document.createElement("INPUT");
        input.type = 'text';
        input.className = 'mobile-input__inner';

        inputHld.appendChild(input);
        document.body.appendChild(inputHld);

        appHld.addEventListener('click', function () {
            input.focus();
        });
    }
}
