class RegexBuilder {
    
    constructor() {
        this.regex = "^\/.*\/(i|g|m|ig|im|gi|mi|gm|igm|img|gim|gmi|mig|mgi|)$";
    }

    build = (string) => {
        if (typeof string !== 'string') string = string.toString();
        if (!new RegExp(this.regex).test(string)) string = `/${string}/igm`;
        let split = string.split(/\//);
		let flags = split[split.length - 1];
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