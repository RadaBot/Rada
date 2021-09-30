class RegexBuilder {
    
    constructor() {
        this.regex = "^\/.*\/(i|g|m|ig|im|gi|mi|gm|igm|img|gim|gmi|mig|mgi|)$";
    }

    validate = (input) => {
    	return new RegExp(this.regex).test(input);
    }

    build = (string) => {
        if (typeof string !== 'string') string = string.toString();
        if (!this.validate(string))     string = `/${string}/igm`;
        let parts = string.split(/\//);
		let flags = parts[parts.length - 1];
		let newReg = string.slice(string.indexOf('/') + 1, string.lastIndexOf('/'));
		try {
			return {
	            success: true,
				input: string,
				string: newReg,
				flags: flags,
				output: new RegExp(newReg, flags)
			};
		} catch (e) {
			return {
				success: false,
				message: e.message
			};
		};
    }
}

module.exports = RegexBuilder;