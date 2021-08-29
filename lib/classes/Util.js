const constants = require('../util/constants');

module.exports = class Util {

    constructor() {
        throw new Error('This class may not be initiated with new');
    }

    static codeBlock = (language, text) => {
        return `\`\`\`${language}\n${text || String.fromCharCode(8203)}\`\`\``;
    }

    static inlineCode = (text) => {
        return typeof text === 'object' ? text.map(t => `\`${t}\``).join(', ') : `\`${text}\``;
    }

    static quote = (text) => {
        return `> ${text}`;
    }

    static toTitleCase = (str) => {
        return str.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]\S*/g, (txt) => Util.titleCaseVariants[txt] || txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    static toSnakeCase = (str) => {
        return str.split(/\s/g).join('_');
    }

    static trimString = (str, max = 30) => {
        if (str.length > max) return `${str.substr(0, max)}...`;
        return str;
    }

    static random = (n1, n2) => {
        return Math.floor(Math.random() * (n2 - n1)) + n1;
    }

    static randomArray = (array) => {
        return array[this.random(0, array.length)];
    }

    static isUnicodeEmoji = (str) => {
        return /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c([\ud000-\udfff]){1,2}|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/.test(str);
    }

    static isFunction = (input) => {
        return typeof input === 'function';
    }

    static isObject = (input) => {
        return input && input.constructor === Object;
    }

    static isArray = (input) => {
        return typeof input === 'object';
    }

    static isThenable = (input) => {
        if (!input) return false;
        return (input instanceof Promise) || (input !== Promise.prototype && Util.isFunction(input.then) && Util.isFunction(input.catch));
    }

    static generateID = () => {
        return Date.now().toString(35).toUpperCase();
    }

    static shuffleArray(arr) {
        return arr.reduce((newArr, _, i) => {
            let rand = i + (Math.floor(Math.random() * (newArr.length - i)));
            [newArr[rand], newArr[i]] = [newArr[i], newArr[rand]]
            return newArr
        }, [...arr])
    }

    static reverse(text) {
        return text.split('').reverse().join('')
    }

    static leet(text) {
        const leetMap = constants.leetMap;
        return text
            .split('')
            .map(char => {
                const mappedChar = leetMap[char.toLowerCase()];
                return mappedChar ? mappedChar['translated'] : char
            }).join('');
    }

    static emojify(text) {
        const specialCodes = constants.specialCodes;
        return text.toLowerCase().split('').map(letter => {
            if (/[a-z]/g.test(letter)) {
                return `:regional_indicator_${letter}: `
            } else if (specialCodes[letter]) {
                return `${specialCodes[letter]} `
            }
            return letter
        }).join('');
    }

    static toggleCase(str) {
        if (str.length !== 1) return str;
        if (str.match(/^[A-Za-z]$/)) {
            if (str.toUpperCase() === str) {
                return str.toLowerCase();
            } else {
                return str.toUpperCase();
            }
        }
        return str;
    }

    static mock(str) {
        return str.split("").map((char, index) => {
            if (index % 2 === 0) return this.toggleCase(char);
            return char;
        }).join("");
    }

    static generateEmojipasta(text) {
        var blocks = this.splitIntoBlocks(text);
        var newBlocks = [];
        var emojis = [];
        blocks.forEach(block => {
            newBlocks.push(block);
            emojis = this.generateEmojisFrom(block);
            if (emojis) {
                newBlocks.push(" " + emojis);
            }
        });
        return newBlocks.join("");
    }

    static splitIntoBlocks(text) {
        return text.match(/\s*[^\s]*/g);
    }

    static generateEmojisFrom(block) {
        var trimmedBlock = this.trimNonAlphanumericalChars(block);
        var matchingEmojis = this.getMatchingEmojis(trimmedBlock);
        var emojis = [];
        if (matchingEmojis) {
            var numEmojis = Math.floor(Math.random() * (1 + 1));
            for (var i = 0; i < numEmojis; i++) {
                emojis.push(matchingEmojis[Math.floor(Math.random() * matchingEmojis.length)]);
            }
        }
        return emojis.join("");
    }

    static trimNonAlphanumericalChars(text) {
        return text.replace(/^\W*/, "").replace(/\W*$/, "");
    }

    static getMatchingEmojis(word) {
        const emoji_mapping = require("../util/EmojiMappings").emojiMap;
        var key = this.getAlphanumericPrefix(word.toLowerCase());
        if (key in emoji_mapping) {
            return emoji_mapping[key];
        }
        return [];
    }

    static getAlphanumericPrefix(s) {
        return s.match(/^[a-z0-9]*/i);
    }

    static owofy(string) {
        const OwOfy = constants.OwOfy
        let i = Math.floor(Math.random() * OwOfy.length);

        string = string.replace(/(?:l|r)/g, 'w');
        string = string.replace(/(?:L|R)/g, 'W');
        string = string.replace(/n([aeiou])/g, 'ny$1');
        string = string.replace(/N([aeiou])/g, 'Ny$1');
        string = string.replace(/N([AEIOU])/g, 'Ny$1');
        string = string.replace(/ove/g, 'uv');
        string = string.replace(/!+/g, ` ${OwOfy[i]} `);
        string = string.replace(/\.+/g, ` ${OwOfy[i]} `);
        string = string.replace(/~+/g, ` ${OwOfy[i]} `);

        return string;
    }

    static vaporwave(text) {
        const vaporwaveMap = constants.vaporwaveMap;
        return text.split('')
            .map(char => {
                const mappedChar = vaporwaveMap[char.toLowerCase()];
                return mappedChar ? mappedChar['translated'] : char
            }).join(' ').replace(/\s/g, '  ');
    }

    static resolveEmoji(text, emojis, caseSensitive = false, wholeWord = false) {
        return emojis.get(text) || emojis.find(emoji => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }

    static checkEmoji(text, emoji, caseSensitive = false, wholeWord = false) {
        if (emoji.id === text) return true;

        const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
        const match = text.match(reg);

        if (match && emoji.id === match[1]) return true;

        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? emoji.name : emoji.name.toLowerCase();

        if (!wholeWord) {
            return name.includes(text)
            || name.includes(text.replace(/:/, ''));
        }

        return name === text
        || name === text.replace(/:/, '');
    }

}