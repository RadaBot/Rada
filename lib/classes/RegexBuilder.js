class RegexBuilder {
    
    constructor() {
        this.regex = "^\/.*\/(i|g|m|ig|im|gi|mi|gm|igm|img|gim|gmi|mig|mgi|)$";
    }

    build = (string) => {
        if (typeof string !== 'string') string = string.toString();
        let split = string.split(/\//);
		let flags = split[split.length - 1];
		let newReg = string.slice(string.indexOf('/') + 1, string.lastIndexOf('/'));
		if (!new RegExp(this.regex).test(string)) {
			return {
				success: false,
				message: 'Invalid regex provided. Make sure your regex is valid e.g. /https:\/\/example.com\//gi'
			};
		};
		return {
            success: true,
			input: string,
			string: newReg,
			flags: flags,
			output: new RegExp(newReg, flags)
		};
    }
}

module.exports = RegexBuilder;